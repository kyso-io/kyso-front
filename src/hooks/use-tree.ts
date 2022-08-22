import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import type { CommonData } from '@/types/common-data';
import type { GithubFileHash, NormalizedResponseDTO, ReportDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

interface Props {
  path: string;
  report: ReportDTO | null | undefined;
  version?: string;
  commonData: CommonData;
}

const token: string | null = getLocalStorageItem('jwt');

const fetcher = async (props: Props) => {
  const { report, path, version, commonData } = props;
  interface ArgType {
    reportId: string;
    filePath: string;
    version?: number;
  }

  const args: ArgType = {
    reportId: report!.id as string,
    filePath: (path as string) || '',
  };

  if (version && !Number.isNaN(version)) {
    args.version = parseInt(version as string, 10);
  }

  const api: Api = new Api(token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);

  const result: NormalizedResponseDTO<GithubFileHash | GithubFileHash[]> = await api.getReportFileTree(args);
  let tr = [result.data];
  if (result.data && Array.isArray(result.data)) {
    tr = [...result.data].sort((ta, tb) => {
      return Number(ta.type > tb.type);
    });
  }

  return tr as GithubFileHash[];
};

export const useTree = (props: Props, dependancies: unknown[] = []): GithubFileHash[] => {
  const { report, commonData } = props;
  let { path = '' } = props;

  if (path === '.') {
    path = '';
  }

  const [mounted, setMounted] = useState(false);

  const { data } = useSWR<GithubFileHash[]>(mounted ? `use-tree-${path}` : null, () => fetcher(props));

  useEffect(() => {
    if (!report) {
      return;
    }
    if (!commonData) {
      return;
    }
    setMounted(true);
  }, [path, report, commonData, ...dependancies]);

  return data as GithubFileHash[];
};
