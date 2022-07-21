import { selectFileToRenderGivenList } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useAppSelector } from './redux-hooks';
import { useCommonReportData } from './use-common-report-data';

export const useFileToRender = (): { path: string; id: string; path_scs: string } | null => {
  const router = useRouter();
  const report = useCommonReportData();
  const fileToRenderDefault = useAppSelector((state) => selectFileToRenderGivenList(state, [router.query.path as string, report?.main_file, 'readme.md'])); // 'index.html', 'index.ipynb',

  const fileToRender = useMemo(() => {
    if ((!router.query.path || router.query.path.length === 0) && report?.main_file && report?.main_file.length > 0 && report?.main_file_id && report?.main_file_id.length > 0) {
      return {
        path: report?.main_file,
        id: report?.main_file_id,
        path_scs: report?.main_file_path_scs,
      };
    }
    return fileToRenderDefault;
  }, [router.query.path, report, fileToRenderDefault]);

  return fileToRender;
};
