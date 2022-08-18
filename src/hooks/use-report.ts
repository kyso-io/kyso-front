import { fetchReportsAction, setActiveId } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import type { ReportDTO } from '@kyso-io/kyso-model';
import type { KeyedMutator } from 'swr';
import useSWR from 'swr';
import { unwrapResult } from '@reduxjs/toolkit';
import { useAppDispatch } from './redux-hooks';
import type { CommonData } from './use-common-data';

interface Props {
  commonData: CommonData;
  reportName: string;
}

export const useReport = (props: Props): [ReportDTO, KeyedMutator<ReportDTO | null>] => {
  const { commonData, reportName } = props;
  const dispatch = useAppDispatch();

  const fetcher = async (): Promise<ReportDTO | null> => {
    const resultReportAction = await dispatch(
      fetchReportsAction({
        filter: {
          team_id: commonData.team?.id,
          sluglified_name: reportName,
        },
      }),
    );

    const reports: ReportDTO[] = unwrapResult(resultReportAction);

    if (reports.length === 0) {
      return null;
    }

    const tempReport: ReportDTO = reports[0] as ReportDTO;
    await dispatch(setActiveId(tempReport.id as string));

    return tempReport;
  };

  const [mounted, setMounted] = useState(false);
  const { data, mutate } = useSWR<ReportDTO | null>(mounted ? `use-report` : null, fetcher);

  useEffect((): void => {
    if (reportName && commonData.team) {
      setMounted(true);
    }
  }, [reportName, commonData]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return [data as any, mutate];
};
