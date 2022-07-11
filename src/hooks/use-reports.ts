import { fetchReportsAction, selectActiveReports } from "@kyso-io/kyso-store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useAppDispatch, useAppSelector } from "./redux-hooks";
import { useAuth } from "./use-auth";
import { useCommonData } from "./use-common-data";

export const useReports = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { team: activeTeam } = useCommonData();
  const reports = useAppSelector(selectActiveReports);

  const user = useAuth({ loginRedirect: false });

  let reportsPerPage = 20;
  if (router.query.per_page && router.query.per_page.length > 0) {
    reportsPerPage = parseInt(router.query.per_page, 10);
  }

  const fetcher = async () => {
    const args = {
      filter: { team_id: activeTeam.id, search: null },
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
    if (!activeTeam) return;

    setMounted(true);
  }, [user, activeTeam]);

  return reports;
};
