import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import type { GithubFileHash } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import type { CommonData } from './use-common-data';

export interface FileToRender {
  path: string;
  id: string;
  path_scs: string;
  isLoading: boolean;
  percentLoaded?: number | null;
  content?: Buffer | string | null;
}

const isImage = (name: string) => {
  return (
    name != null &&
    (name.toLowerCase().endsWith('.png') || name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg') || name.toLowerCase().endsWith('.gif') || name.toLowerCase().endsWith('.svg'))
  );
};

interface Props {
  path: string;
  tree: GithubFileHash[];
  mainFile: string | undefined;
  commonData: CommonData;
}

const token: string | null = getLocalStorageItem('jwt');

export const useFileToRender = (props: Props): FileToRender | null => {
  const { path, tree, mainFile, commonData } = props;

  const [fileToRender, setFileToRender] = useState<FileToRender | null>(null);

  const validFiles: GithubFileHash[] = tree?.filter((item: GithubFileHash) => item.type === 'file');
  const allowedPaths = [path, mainFile, 'Readme.md'];

  const validFile: GithubFileHash | undefined = validFiles?.find((item: GithubFileHash) => {
    return allowedPaths.includes(item.path);
  });

  const fetcher = async () => {
    try {
      let ftr: FileToRender | null = null;

      if (validFile) {
        ftr = {
          path: validFile!.path,
          id: validFile!.id,
          path_scs: validFile!.path_scs,
          percentLoaded: 0,
          isLoading: false,
          content: null,
        };
      }

      setFileToRender(ftr);

      if (ftr && !ftr.path.endsWith('.html')) {
        setFileToRender({ ...ftr, isLoading: true });
        const api: Api = new Api(token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);
        const data: Buffer = await api.getReportFileContent(ftr.id, {
          onDownloadProgress(progressEvent) {
            if (progressEvent.lengthComputable) {
              const percentLoaded = progressEvent.loaded / progressEvent.total;
              setFileToRender({ ...(ftr as FileToRender), percentLoaded });
            } else {
              setFileToRender({ ...(ftr as FileToRender), percentLoaded: (fileToRender?.percentLoaded as number) + 1 });
            }
          },
        });
        // const result = await dispatch(fetchFileContentAction(ftr.id));
        let content = null;
        if (data && isImage(ftr.path)) {
          content = Buffer.from(data).toString('base64');
        } else if (data) {
          content = Buffer.from(data).toString('utf-8');
        }

        setFileToRender({ ...ftr, content, isLoading: false });
      }
    } catch (e) {
      // error fetching file
    }
  };

  useEffect(() => {
    fetcher();
  }, [tree, validFile]);

  // console.log(fileToRender?.percentLoaded)
  return fileToRender;
};
