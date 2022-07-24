import useSWR from 'swr';
import type { SWRResponse } from 'swr';
import { Api } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { GithubFileHash, NormalizedResponseDTO } from '@kyso-io/kyso-model';

import { getLocalStorageItem } from '@/helpers/get-local-storage-item';
import { useCommonReportData } from './use-common-report-data';

interface IUseTree {
  path: string;
}

const token: string | null = getLocalStorageItem('jwt');

export const useTree = (props: IUseTree): GithubFileHash[] => {
  const { path } = props;
  const router = useRouter();
  const report = useCommonReportData();

  const fetcher = async () => {
    interface ArgType {
      reportId: string;
      filePath: string;
      version?: number;
    }

    const args: ArgType = {
      reportId: report!.id as string,
      filePath: (path as string) || '',
    };

    if (router.query.version && !Number.isNaN(router.query.version)) {
      args.version = parseInt(router.query.version as string, 10);
    }

    const api: Api = new Api(token);
    const result: NormalizedResponseDTO<GithubFileHash | GithubFileHash[]> = await api.getReportFileTree(args);

    return result.data as GithubFileHash[];
  };

  const [mounted, setMounted] = useState(false);
  const { data }: SWRResponse<GithubFileHash[]> = useSWR(mounted ? `use-tree-${path}` : null, fetcher);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (!report) {
      return;
    }

    setMounted(true);
  }, [path, report]);

  let tree = null;
  if (data) {
    tree = [...data].sort((ta, tb) => {
      return Number(ta.type > tb.type);
    });
  }

  return tree as GithubFileHash[];
};
