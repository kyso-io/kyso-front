import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import type { CommonData } from '@/types/common-data';
import type { NormalizedResponseDTO, ReportDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

interface Props {
  commonData: CommonData;
  report: ReportDTO | null | undefined;
}

export interface Version {
  version: number;
  created_at: Date;
  num_files: number;
}

const token: string | null = getLocalStorageItem('jwt');

const fetcher = async (props: Props) => {
  const { commonData, report } = props;
  const api: Api = new Api(token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);
  const result: NormalizedResponseDTO<Version[]> = await api.getReportVersions(report!.id as string, '-created_at');
  return result.data as Version[];
};

export const useVersions = (props: Props, dependancies: unknown[] = []): Version[] => {
  const { report } = props;
  const [mounted, setMounted] = useState(false);

  const { data } = useSWR<Version[]>(mounted ? `use-versions` : null, () => fetcher(props));

  useEffect(() => {
    if (!report) {
      return;
    }
    setMounted(true);
  }, [report, ...dependancies]);

  return data as Version[];
};
