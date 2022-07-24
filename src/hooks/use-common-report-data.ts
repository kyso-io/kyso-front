import { fetchReportsAction, selectActiveReport, setActiveId } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { ReportDTO } from '@kyso-io/kyso-model';
import useSWR from 'swr';
import { unwrapResult } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from './redux-hooks';
import type { CommonData } from './use-common-data';
import { useCommonData } from './use-common-data';

export const useCommonReportData = (): ReportDTO => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { query } = router;
  const commonData: CommonData = useCommonData();

  const report = useAppSelector(selectActiveReport);

  const fetcher = async (): Promise<ReportDTO | null> => {
    const resultReportAction = await dispatch(
      fetchReportsAction({
        filter: {
          team_id: commonData.team.id,
          sluglified_name: query.reportName,
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
  useSWR(mounted ? `use-common-report-data` : null, fetcher);

  useEffect((): void => {
    if (commonData.team) {
      setMounted(true);
    }
  }, [router.query, commonData.team]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return report as any;
};
