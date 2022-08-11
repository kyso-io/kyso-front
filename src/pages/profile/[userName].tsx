import UserProfileInfo from '@/components/UserProfileInfo';
/* eslint no-empty: "off" */
import Pagination from '@/components/Pagination';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { ActivityFeed, NormalizedResponseDTO, PaginatedResponseDto, ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import ActivityFeedComponent from '../../components/ActivityFeed';
import ReportBadge from '../../components/ReportBadge';
import { getLocalStorageItem } from '../../helpers/get-local-storage-item';
import type { CommonData } from '../../hooks/use-common-data';
import { useCommonData } from '../../hooks/use-common-data';
import { useInterval } from '../../hooks/use-interval';

const token: string | null = getLocalStorageItem('jwt');
const DAYS_ACTIVITY_FEED: number = 14;
const MAX_ACTIVITY_FEED_ITEMS: number = 15;
const ACTIVITY_FEED_POOLING_MS: number = 30 * 1000; // 30 seconds

interface PaginationParams {
  page: number;
  limit: number;
  sort: string;
}

const Index = () => {
  const user = {
    name: 'Sergio Talents-Oliag',
    role: 'Master of the Dark Arts in System Engineering',
    date: 'January 9, 2020',
    location: 'Valencia',
    email: 'ricardo.cooper@example.com',
    backgroundImage: 'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
  };
  const [currentTab, onChangeTab] = useState('Overview');

  const router = useRouter();
  useRedirectIfNoJWT();
  const commonData: CommonData = useCommonData({
    organizationName: 'darkside',
    teamName: router.query.teamName as string,
  });

  // const commonData: CommonData = useCommonData({
  //   userName: router.query.userName as string,
  // });

  const [paginatedResponseDto, setPaginatedResponseDto] = useState<PaginatedResponseDto<ReportDTO> | null>(null);
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    sort: '-created_at',
  });
  const [datetimeActivityFeed, setDatetimeActivityFeed] = useState<Date>(new Date());
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activityFeed, setActivityFeed] = useState<NormalizedResponseDTO<ActivityFeed[]> | null>(null);
  const organizationName = 'darkside';
  // const { organizationName } = router.query;

  useEffect(() => {
    if (!organizationName) {
      return;
    }
    getReports();
  }, [token, organizationName, paginationParams]);

  useEffect(() => {
    if (!commonData.organization || !commonData.user) {
    }
  }, [commonData?.organization, commonData?.user]);

  useEffect(() => {
    if (!organizationName) {
      return;
    }
    getActivityFeed();
  }, [token, organizationName, datetimeActivityFeed]);

  const refreshLastActivityFeed = useCallback(async () => {
    if (!organizationName || !token) {
      return;
    }
    const api: Api = new Api(token);
    try {
      const result: NormalizedResponseDTO<ActivityFeed[]> = await api.getOrganizationActivityFeed(organizationName as string, {
        start_datetime: moment().add(-DAYS_ACTIVITY_FEED, 'days').toDate(),
        end_datetime: moment().toDate(),
      });

      result.data = result.data.slice(0, MAX_ACTIVITY_FEED_ITEMS);

      const newActivityFeed: NormalizedResponseDTO<ActivityFeed[]> = { ...(activityFeed || { data: [], relations: {} }) };
      if (result?.data) {
        result.data.forEach((af: ActivityFeed) => {
          const index: number = newActivityFeed.data.findIndex((activity: ActivityFeed) => activity.id === af.id);
          if (index === -1) {
            newActivityFeed.data.push(af);
          }
        });
      }
      if (result?.relations) {
        for (const key in result?.relations) {
          if (result?.relations[key]) {
            if (!newActivityFeed.relations![key]) {
              newActivityFeed.relations![key] = { ...result.relations[key] };
            } else {
              for (const key2 in result?.relations[key]) {
                if (!result.relations[key][key2]) {
                  newActivityFeed.relations![key][key2] = result.relations[key][key2];
                }
              }
            }
          }
        }
      }
      setActivityFeed(newActivityFeed);
      setHasMore(result.data.length > 0);
    } catch (e) {}
  }, [token, organizationName]);

  useInterval(refreshLastActivityFeed, ACTIVITY_FEED_POOLING_MS);

  const getReports = async () => {
    try {
      const api: Api = new Api(token);
      const result: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> = await api.getOrganizationReports(
        organizationName as string,
        paginationParams.page,
        paginationParams.limit,
        paginationParams.sort,
      );

      // Sort by global_pin and user_pin
      result.data.results.sort((a: ReportDTO, b: ReportDTO) => {
        if ((a.pin || a.user_pin) && !(b.pin || b.user_pin)) {
          return -1;
        }
        if ((b.pin || b.user_pin) && !(a.pin || a.user_pin)) {
          return 1;
        }
        return 0;
      });

      const dataWithAuthors = [];

      for (const x of result.data.results) {
        const allAuthorsId: string[] = [x.user_id, ...x.author_ids];
        const uniqueAllAuthorsId: string[] = Array.from(new Set(allAuthorsId));
        const allAuthorsData: UserDTO[] = [];

        for (const authorId of uniqueAllAuthorsId) {
          /* eslint-disable no-await-in-loop */
          const userData: NormalizedResponseDTO<UserDTO> = await api.getUserProfileById(authorId);

          if (userData && userData.data) {
            allAuthorsData.push(userData.data);
          }
        }

        x.authors = allAuthorsData;
        dataWithAuthors.push(x);
      }

      result.data.results = dataWithAuthors;
      setPaginatedResponseDto(result.data);
    } catch (e) {}
  };

  const toggleUserStarReport = async (reportId: string) => {
    const api: Api = new Api(token);
    try {
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleUserStarReport(reportId);
      const { data: report } = result;
      const { results: reports } = paginatedResponseDto!;
      const newReports: ReportDTO[] = reports.map((r: ReportDTO) => (r.id === report.id ? report : r));
      // Sort by global_pin and user_pin
      newReports.sort((a: ReportDTO, b: ReportDTO) => {
        if ((a.pin || a.user_pin) && !(b.pin || b.user_pin)) {
          return -1;
        }
        if ((b.pin || b.user_pin) && !(a.pin || a.user_pin)) {
          return 1;
        }
        return 0;
      });
      setPaginatedResponseDto({ ...paginatedResponseDto!, results: newReports });
    } catch (e) {}
  };

  const getActivityFeed = async () => {
    if (!token) {
      return;
    }
    const api: Api = new Api(token);
    try {
      const startDatetime: Date = moment(datetimeActivityFeed).add(-DAYS_ACTIVITY_FEED, 'day').toDate();
      const result: NormalizedResponseDTO<ActivityFeed[]> = await api.getOrganizationActivityFeed(organizationName as string, {
        start_datetime: startDatetime,
        end_datetime: datetimeActivityFeed,
      });

      result.data = result.data.slice(0, MAX_ACTIVITY_FEED_ITEMS);

      const newActivityFeed: NormalizedResponseDTO<ActivityFeed[]> = { ...(activityFeed || { data: [], relations: {} }) };
      if (result?.data) {
        newActivityFeed.data = [...newActivityFeed.data, ...result.data];
      }
      if (result?.relations) {
        for (const key in result?.relations) {
          if (result?.relations[key]) {
            newActivityFeed.relations![key] = { ...newActivityFeed.relations![key], ...result.relations[key] };
          }
        }
      }
      setActivityFeed(newActivityFeed);
      setHasMore(result.data.length > 0);
    } catch (e) {}
  };

  const getMoreActivityFeed = () => {
    setDatetimeActivityFeed(moment(datetimeActivityFeed).add(-DAYS_ACTIVITY_FEED, 'day').toDate());
  };

  return (
    <>
      <UserProfileInfo user={user} onChangeTab={onChangeTab} currentTab={currentTab} />
      <div className="flex flex-row space-x-8">
        <div className="w-1/6" />
        <div className="w-4/6">
          {currentTab === 'Overview' && (
            <>
              <div className="grid lg:grid-cols-1 sm:grid-cols-1 xs:grid-cols-1 gap-4 pt-10">
                <p className="text-xs font-bold leading-relaxed text-gray-700 pb-5">Most recent</p>
                {paginatedResponseDto?.results && paginatedResponseDto.results.length === 0 && <p>There are no reports</p>}
                {paginatedResponseDto?.results &&
                  paginatedResponseDto.results.length > 0 &&
                  paginatedResponseDto?.results.map((report: ReportDTO) => (
                    <ReportBadge key={report.id} report={report} authors={report.authors ? report.authors : []} toggleUserStarReport={() => toggleUserStarReport(report.id!)} />
                  ))}
              </div>
              {paginatedResponseDto && paginatedResponseDto.totalPages > 1 && (
                <div className="pt-20">
                  <Pagination page={paginatedResponseDto.currentPage} numPages={paginatedResponseDto.totalPages} onPageChange={(page: number) => setPaginationParams({ ...paginationParams, page })} />
                </div>
              )}
            </>
          )}
          {commonData.user && currentTab === 'Activity' && (
            <div className="w-1/6">
              <p className="text-xs font-bold leading-relaxed text-gray-700 py-10">Most recent</p>
              <ActivityFeedComponent activityFeed={activityFeed} hasMore={hasMore} getMore={getMoreActivityFeed} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
