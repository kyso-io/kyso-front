import useSWR from 'swr';
import type { SWRResponse } from 'swr';
import { fetchReportsTreeAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { ActionWithPayload, GithubFileHash } from '@kyso-io/kyso-model';

import { useAppDispatch } from './redux-hooks';
import { useCommonReportData } from './use-common-report-data';

export const useTree = (): GithubFileHash[] => {
  const dispatch = useAppDispatch();
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
      filePath: (router.query.path as string) || '',
    };
    if (router.query.version && !Number.isNaN(router.query.version)) {
      args.version = parseInt(router.query.version as string, 10);
    }

    const fetchTreeRequest: ActionWithPayload<GithubFileHash[]> = await dispatch(fetchReportsTreeAction(args));
    return fetchTreeRequest.payload as GithubFileHash[];
  };

  const [mounted, setMounted] = useState(false);
  const { data }: SWRResponse<GithubFileHash[]> = useSWR(mounted ? 'use-tree' : null, fetcher);
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (!report) {
      return;
    }

    setMounted(true);
  }, [router.query, report]);

  let tree = null;
  if (data) {
    tree = [...data].sort((ta, tb) => {
      return Number(ta.type > tb.type);
    });
  }

  return tree as GithubFileHash[];
};
