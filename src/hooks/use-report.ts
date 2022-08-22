/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CommonData } from '@/types/common-data';
import type { NormalizedResponseDTO, ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

interface Props {
  commonData: CommonData;
  reportName: string;
}

export const useReport = ({ commonData, reportName }: Props): { report: ReportDTO | null | undefined; authors: UserDTO[]; mutate: KeyedMutator<any> } => {
  const fetcher = async (): Promise<{ report: ReportDTO | null; authors: UserDTO[] }> => {
    try {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<ReportDTO> = await api.getReportByTeamIdAndSlug(commonData.team!.id!, reportName);
      const authors: UserDTO[] = [];
      result.data.author_ids.forEach((authorId: string) => {
        if (result.relations?.user[authorId]) {
          authors.push(result.relations.user[authorId]);
        }
      });
      return { report: result.data, authors };
    } catch (e) {
      return { report: null, authors: [] };
    }
  };

  const [mounted, setMounted] = useState(false);
  const { data, mutate } = useSWR(mounted ? `use-report` : null, fetcher);

  useEffect((): void => {
    if (reportName && commonData.team) {
      setMounted(true);
    }
  }, [reportName, commonData?.team]);

  return { report: data?.report, authors: data?.authors || [], mutate };
};
