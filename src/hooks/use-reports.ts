import { fetchReportsAction, selectActiveReports } from "@kyso-io/kyso-store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useAppDispatch, useAppSelector } from "./redux-hooks";
import { useUser } from "./use-user";
import { useCommonData } from "./use-common-data";

type IUseReports = {
  perPage?: string;
  page?: string;
  search?: string | null;
  sort?: string;
  tags?: string[];
};

type Filter = {
  team_id: String;
  search: String | null;
};

export const useReports = (props: IUseReports = {}) => {
  const { perPage = 20, page = 1, search = null, sort = "-created_at" } = props;

  const router = useRouter();

  const { team } = useCommonData();

  const dispatch = useAppDispatch();
  const reports = useAppSelector(selectActiveReports);

  const user = useUser();

  const fetcher = async () => {
    const args = {
      filter: { team_id: team.id, search: null } as Filter,
      sort,
      page,
      per_page: perPage,
    };
    if (search && search.length > 0) {
      args.filter.search = search!;
    }
    dispatch(fetchReportsAction(args as object));
  };

  const [mounted, setMounted] = useState(false);
  useSWR(mounted ? `use-reports-${router.asPath}` : null, fetcher);
  useEffect(() => {
    if (reports) {
      return;
    }
    if (!team) {
      return;
    }

    setMounted(true);
  }, [user, team, router.query.sort]);

  return reports || [];
};
