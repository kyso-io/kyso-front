import type { GithubFileHash } from '@kyso-io/kyso-model';
import { fetchFileContentAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAppDispatch } from './redux-hooks';
import { useCommonReportData } from './use-common-report-data';
import { useTree } from './use-tree';

interface IFileToRender {
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

interface IUseFileToRender {
  path: string;
}

export const useFileToRender = (props: IUseFileToRender): IFileToRender | null => {
  const { path } = props;
  const router = useRouter();
  const report = useCommonReportData();

  const [fileToRender, setFileToRender] = useState<IFileToRender | null>(null);
  const dispatch = useAppDispatch();
  const tree = useTree({ path });

  let validFile: GithubFileHash | undefined | null = null;

  const validFiles: GithubFileHash[] = tree?.filter((item: GithubFileHash) => item.type === 'file');

  const allowedPaths = [path, report?.main_file, 'Readme.md'];

  validFile = validFiles?.find((item: GithubFileHash) => {
    return allowedPaths.includes(item.path);
  });

  const fetcher = async () => {
    let ftr: IFileToRender | null = null;

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
    if (router.isReady) {
      fetcher();
    }
  }, [router.query.path, validFile]);

  return fileToRender;
};
