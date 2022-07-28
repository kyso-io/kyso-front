import type { GithubFileHash } from '@kyso-io/kyso-model';
import { fetchFileContentAction } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import { useAppDispatch } from './redux-hooks';

export interface FileToRender {
  path: string;
  id: string;
  path_scs: string;
  isLoading: boolean;
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
}

export const useFileToRender = (props: Props): FileToRender | null => {
  const { path, tree, mainFile } = props;

  const [fileToRender, setFileToRender] = useState<FileToRender | null>(null);
  const dispatch = useAppDispatch();

  const validFiles: GithubFileHash[] = tree?.filter((item: GithubFileHash) => item.type === 'file');
  const allowedPaths = [path, mainFile, 'Readme.md'];

  const validFile: GithubFileHash | undefined = validFiles?.find((item: GithubFileHash) => {
    return allowedPaths.includes(item.path);
  });

  const fetcher = async () => {
    let ftr: FileToRender | null = null;

    if (validFile) {
      ftr = {
        path: validFile!.path,
        id: validFile!.id,
        path_scs: validFile!.path_scs,
        isLoading: false,
        content: null,
      };
    }

    setFileToRender(ftr);

    if (ftr && !ftr.path.endsWith('.html')) {
      setFileToRender({ ...ftr, isLoading: true });
      const result = await dispatch(fetchFileContentAction(ftr.id));
      let content = null;
      if (result.payload && isImage(ftr.path)) {
        content = Buffer.from(result.payload).toString('base64');
      } else if (result.payload) {
        content = Buffer.from(result.payload).toString('utf-8');
      }

      setFileToRender({ ...ftr, content, isLoading: false });
    }
  };

  useEffect(() => {
    fetcher();
  }, [tree, validFile]);

  console.log(mainFile, fileToRender);

  return fileToRender;
};
