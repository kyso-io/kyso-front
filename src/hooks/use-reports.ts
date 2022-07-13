import type { ReportDTO } from "@kyso-io/kyso-model";
import { fetchReportsAction, selectActiveReports } from "@kyso-io/kyso-store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useAppDispatch, useAppSelector } from "./redux-hooks";
import { useAuth } from "./use-auth";
import type { CommonData } from "./use-common-data";
import { useCommonData } from "./use-common-data";

export const useReports = (): ReportDTO[] => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const commonData: CommonData = useCommonData();
  const reports = useAppSelector(selectActiveReports);

  const user = useAuth({ loginRedirect: false });

  let reportsPerPage = 20;
  if (router.query.per_page && router.query.per_page.length > 0) {
    reportsPerPage = parseInt(router.query.per_page, 10);
  }

  const fetcher = async () => {
    const args = {
      filter: { team_id: commonData.team.id, search: null },
      sort: "-created_at",
      page: router.query.page ? parseInt(router.query.page, 10) : 1,
      per_page: reportsPerPage,
    };
    if (router.query.search && router.query.search.length > 0) {
      args.filter.search = router.query.search;
    }

    // console.log('calling api to get reports')
    dispatch(fetchReportsAction(args));
  };

  const [mounted, setMounted] = useState(false);
  useSWR(mounted ? "use-reports" : null, fetcher);

  useEffect(() => {
    if (reports) return;
    if (!commonData.team) return;

    setMounted(true);
  }, [user, commonData.team]);

  return reports || [];
};
