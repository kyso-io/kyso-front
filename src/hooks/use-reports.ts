import { fetchReportsAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import type { ActionWithPayload, Report } from '@kyso-io/kyso-model';
import { useAppDispatch } from './redux-hooks';
import { useUser } from './use-user';

type IUseReports = {
  teamId?: string;
  perPage?: string;
  page?: string;
  search?: string | null;
  sort?: string;
  tags?: string[];
};

type Filter = {
  team_id?: String;
  search: String | null;
};

export const useReports = (props: IUseReports = {}): Report[] | null | undefined => {
  const { teamId, perPage = 20, page = 1, search = null, sort = '-created_at' } = props;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useUser();

  const fetcher = async () => {
    const filter = { search: null } as Filter;
    if (teamId) {
      filter.team_id = teamId;
    }
    const args = {
      filter,
      sort,
      page,
      per_page: perPage,
    };
    if (search && search.length > 0) {
      args.filter.search = search!;
    }
    const fetchReportRequest: ActionWithPayload<Report[]> = await dispatch(fetchReportsAction(args as object));
    return fetchReportRequest.payload;
  };

  const [mounted, setMounted] = useState(false);
  const { data: reports } = useSWR(mounted ? `use-reports-${router.asPath}` : null, fetcher);
  useEffect(() => {
    if (!user) {
      return;
    }
    if (!teamId) {
      return;
    }
    setMounted(true);
  }, [user, teamId, router.query.sort]);

  return reports;
};
