import ActivityFeedComponent from '@/components/ActivityFeed';
import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import { useInterval } from '@/hooks/use-interval';
import { useRouter } from 'next/router';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { ActivityFeed, NormalizedResponseDTO, PaginatedResponseDto, ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import debounce from 'lodash.debounce';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import UserProfileInfo from '@/components/UserProfileInfo';
import { useUser } from '@/hooks/use-user';
import { PureSpinner } from '@/components/PureSpinner';
import ReportBadge from '@/components/ReportBadge';

const token: string | null = getLocalStorageItem('jwt');
const DAYS_ACTIVITY_FEED: number = 60;
const MAX_ACTIVITY_FEED_ITEMS: number = 15;
const ACTIVITY_FEED_POOLING_MS: number = 30 * 1000; // 30 seconds
const LIMIT_REPORTS = 10;

const debouncedPaginatedReports = debounce(
  async (tkn: string, userId: string, page: number, queryParams: string, cb: (data: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> | null) => void) => {
    try {
      const api: Api = new Api(tkn);
      let query = `skip=${(page - 1) * LIMIT_REPORTS}&limit=${LIMIT_REPORTS}`;
      if (queryParams) {
        query += `&${queryParams}`;
      }
      const result: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> = await api.getUserReports(userId, query);
      result.data.results.sort((a: ReportDTO, b: ReportDTO) => {
        if ((a.pin || a.user_pin) && !(b.pin || b.user_pin)) {
          return -1;
        }
        if ((b.pin || b.user_pin) && !(a.pin || a.user_pin)) {
          return 1;
        }
        return 0;
      });
      const dataWithAuthors: ReportDTO[] = [];
      for (const x of result.data.results) {
        const allAuthorsId: string[] = [x.user_id, ...x.author_ids];
        const uniqueAllAuthorsId: string[] = Array.from(new Set(allAuthorsId));
        const allAuthorsData: UserDTO[] = [];
        for (const authorId of uniqueAllAuthorsId) {
          /* eslint-disable no-await-in-loop */
          const userData: NormalizedResponseDTO<UserDTO> = result.relations!.user[authorId];
          if (userData && userData.data) {
            allAuthorsData.push(userData.data);
          }
        }
        x.authors = allAuthorsData;
        dataWithAuthors.push(x);
      }
      result.data.results = dataWithAuthors;
      cb(result);
    } catch (e) {
      console.log(e);
      cb(null);
    }
  },
  500,
);

const Index = () => {
  const user: UserDTO = useUser();
  const router = useRouter();
  const { username } = router.query;

  const [userProfile, setUser] = useState<UserDTO>();

  const [currentTab, onChangeTab] = useState<string>('Overview');
  // REPORTS
  const [reportsResponse, setReportsResponse] = useState<NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> | null>(null);
  const [requestingReports, setRequestingReports] = useState<boolean>(true);
  // ACTIVITY FEED
  const [datetimeActivityFeed, setDatetimeActivityFeed] = useState<Date>(new Date());
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activityFeed, setActivityFeed] = useState<NormalizedResponseDTO<ActivityFeed[]> | null>(null);

  useEffect(() => {
    if (!username) {
      return;
    }
    getUserByUsername();
  }, [username]);

  useEffect(() => {
    if (!userProfile) {
      return;
    }
    getReports(1);
  }, [userProfile]);

  useEffect(() => {
    if (!username) {
      return;
    }
    getActivityFeed();
  }, [datetimeActivityFeed]);

  const getUserByUsername = async () => {
    try {
      const api: Api = new Api(token);
      const result: NormalizedResponseDTO<UserDTO> = await api.getUserProfileByUsername(username as string);
      setUser(result.data);
    } catch (e) {
      console.log(e);
    }
  };

  const refreshLastActivityFeed = useCallback(async () => {
    if (!user || !token || !userProfile) {
      return;
    }
    const api: Api = new Api(token);
    try {
      const result: NormalizedResponseDTO<ActivityFeed[]> = await api.getUserActivityFeed({
        start_datetime: moment().add(-DAYS_ACTIVITY_FEED, 'days').toDate(),
        end_datetime: moment().toDate(),
        user_id: userProfile.id,
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
  }, [token, user, userProfile]);

  useInterval(refreshLastActivityFeed, ACTIVITY_FEED_POOLING_MS);

  // START REPORT ACTIONS

  const getReports = async (page: number, queryParams?: string) => {
    if (!userProfile) {
      return;
    }
    setRequestingReports(true);
    debouncedPaginatedReports(token!, userProfile.id, page, queryParams ?? '', (result: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> | null) => {
      setReportsResponse(result);
      setRequestingReports(false);
    });
  };

  const toggleUserStarReport = async (reportId: string) => {
    const api: Api = new Api(token);
    try {
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleUserStarReport(reportId);
      const { data: report } = result;
      const copyPaginatedReponse: PaginatedResponseDto<ReportDTO> = { ...reportsResponse!.data };
      const newReports: ReportDTO[] = copyPaginatedReponse.results.map((r: ReportDTO) => (r.id === report.id ? report : r));
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
      setReportsResponse({
        ...reportsResponse!,
        data: {
          ...copyPaginatedReponse,
          results: newReports,
        },
      });
    } catch (e) {}
  };

  const toggleUserPinReport = async (reportId: string) => {
    try {
      const api: Api = new Api(token);
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleUserPinReport(reportId);
      const { data: report } = result;
      const copyPaginatedReponse: PaginatedResponseDto<ReportDTO> = { ...reportsResponse!.data };
      const newReports: ReportDTO[] = copyPaginatedReponse.results.map((r: ReportDTO) => (r.id === report.id ? report : r));
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
      setReportsResponse({
        ...reportsResponse!,
        data: {
          ...copyPaginatedReponse,
          results: newReports,
        },
      });
    } catch (e) {}
  };

  const toggleGlobalPinReport = async (reportId: string) => {
    try {
      const api: Api = new Api(token);
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleGlobalPinReport(reportId);
      const { data: report } = result;
      const copyPaginatedReponse: PaginatedResponseDto<ReportDTO> = { ...reportsResponse!.data };
      const newReports: ReportDTO[] = copyPaginatedReponse.results.map((r: ReportDTO) => (r.id === report.id ? report : r));
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
      setReportsResponse({
        ...reportsResponse!,
        data: {
          ...copyPaginatedReponse,
          results: newReports,
        },
      });
    } catch (e) {}
  };

  // END REPORT ACTIONS

  // START ACTIVITY FEED

  const getActivityFeed = async () => {
    if (!token || !userProfile) {
      return;
    }
    const api: Api = new Api(token);
    try {
      const startDatetime: Date = moment(datetimeActivityFeed).add(-DAYS_ACTIVITY_FEED, 'day').toDate();
      const result: NormalizedResponseDTO<ActivityFeed[]> = await api.getUserActivityFeed({
        start_datetime: startDatetime,
        end_datetime: datetimeActivityFeed,
        user_id: userProfile.id,
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

  // END ACTIVITY FEED

  if (!userProfile) {
    return null;
  }

  return (
    <div>
      <UserProfileInfo onChangeTab={onChangeTab} currentTab={currentTab} userProfile={userProfile} />
      <div className="flex flex-row space-x-8">
        <div className="w-1/6" />
        <div className="w-4/6">
          {currentTab === 'Overview' && (
            <React.Fragment>
              {requestingReports ? (
                <div className="text-center">
                  <PureSpinner size={12} />
                </div>
              ) : reportsResponse && reportsResponse.data.results && reportsResponse.data.results.length > 0 ? (
                <React.Fragment>
                  <div className="grid lg:grid-cols-1 sm:grid-cols-1 xs:grid-cols-1 gap-4 pt-10 pb-20">
                    <p className="text-xs font-bold leading-relaxed text-gray-700 pb-5">Most recent</p>
                    {reportsResponse.data.results?.map((report: ReportDTO) => (
                      <ReportBadge
                        key={report.id}
                        report={report}
                        authors={report.authors ? report.authors : []}
                        toggleUserStarReport={() => toggleUserStarReport(report.id!)}
                        toggleUserPinReport={() => toggleUserPinReport(report.id!)}
                        toggleGlobalPinReport={() => toggleGlobalPinReport(report.id!)}
                      />
                    ))}
                  </div>
                  <div className="flex-1 flex justify-center">
                    {reportsResponse.data.currentPage - 1 >= 1 && (
                      <span
                        onClick={() => getReports(reportsResponse.data.currentPage - 1)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        Previous
                      </span>
                    )}
                    <p className="px-6 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">Page {reportsResponse.data.currentPage}</p>
                    {reportsResponse.data.currentPage + 1 <= reportsResponse.data.totalPages && (
                      <span
                        onClick={() => getReports(reportsResponse.data.currentPage + 1)}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        Next
                      </span>
                    )}
                  </div>
                </React.Fragment>
              ) : (
                <div className="pt-10 pb-20">
                  <p>The user has no reports</p>
                </div>
              )}
            </React.Fragment>
          )}
          {currentTab === 'Activity' && (
            <React.Fragment>
              {activityFeed && (
                <>
                  <p className="text-xs font-bold leading-relaxed text-gray-700 py-10">Most recent</p>
                  <ActivityFeedComponent activityFeed={activityFeed} hasMore={hasMore} getMore={getMoreActivityFeed} />
                </>
              )}
              {!activityFeed && (
                <div className="pt-10 pb-20">
                  <p>The user has no activity</p>
                </div>
              )}
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
