/* eslint-disable @typescript-eslint/no-explicit-any */
import ActivityFeedComponent from '@/components/ActivityFeed';
import { PureSpinner } from '@/components/PureSpinner';
import ReportBadge from '@/components/ReportBadge';
import UserProfileInfo from '@/components/UserProfileInfo';
import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import { useInterval } from '@/hooks/use-interval';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import { InformationCircleIcon } from '@heroicons/react/solid';
import type { ActivityFeed, NormalizedResponseDTO, PaginatedResponseDto, ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import debounce from 'lodash.debounce';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import ToasterNotification from '../../../components/ToasterNotification';
import { checkReportAuthors } from '../../../helpers/check-report-authors';

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
      checkReportAuthors(result);
      cb(result);
    } catch (e) {
      console.log(e);
      cb(null);
    }
  },
  500,
);

type UserProfileData = {
  userProfile: UserDTO | null;
  errorUserProfile: string | null;
};

interface Props {
  commonData: CommonData;
  setUser: (user: UserDTO) => void;
}

const Index = ({ commonData, setUser }: Props) => {
  const router = useRouter();
  const { username } = router.query;
  const [userProfileData, setUserProfileData] = useState<UserProfileData | null>(null);
  const [currentTab, onChangeTab] = useState<string>('Overview');
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
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
    if (!userProfileData || !userProfileData.userProfile) {
      return;
    }
    getReports(1);
  }, [userProfileData]);

  useEffect(() => {
    if (!userProfileData || !userProfileData.userProfile) {
      return;
    }
    getActivityFeed();
  }, [userProfileData, datetimeActivityFeed]);

  const getUserByUsername = async () => {
    try {
      const api: Api = new Api(token);
      const result: NormalizedResponseDTO<UserDTO> = await api.getUserProfileByUsername(username as string);
      setUserProfileData({
        userProfile: result.data,
        errorUserProfile: null,
      });
    } catch (e: any) {
      let errorUserProfile: string | null = null;
      if (e.response.data.statusCode === 404) {
        errorUserProfile = 'The user does not exist';
      } else {
        errorUserProfile = e.response.data.message;
      }
      setUserProfileData({
        userProfile: null,
        errorUserProfile,
      });
    }
  };

  const refreshLastActivityFeed = useCallback(async () => {
    if (!commonData.user) {
      return;
    }
    const api: Api = new Api(token);
    try {
      const result: NormalizedResponseDTO<ActivityFeed[]> = await api.getUserActivityFeed(username as string, {
        start_datetime: moment().add(-DAYS_ACTIVITY_FEED, 'days').toDate(),
        end_datetime: moment().toDate(),
        user_id: commonData.user.id,
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
  }, [commonData.user, userProfileData]);

  useInterval(refreshLastActivityFeed, ACTIVITY_FEED_POOLING_MS);

  // START REPORT ACTIONS

  const getReports = async (page: number, queryParams?: string) => {
    setRequestingReports(true);
    debouncedPaginatedReports(token!, userProfileData!.userProfile!.id, page, queryParams ?? '', (result: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> | null) => {
      setReportsResponse(result);
      setRequestingReports(false);
    });
  };

  const updateReportsResponse = (result: NormalizedResponseDTO<ReportDTO>) => {
    const { data: report } = result;
    const allAuthorsId: string[] = [report.user_id, ...report.author_ids];
    const uniqueAllAuthorsId: string[] = Array.from(new Set(allAuthorsId));
    const allAuthorsData: UserDTO[] = [];
    for (const authorId of uniqueAllAuthorsId) {
      /* eslint-disable no-await-in-loop */
      if (result.relations?.user[authorId]) {
        allAuthorsData.push(result.relations.user[authorId]);
      }
    }
    report.authors = allAuthorsData;
    const copyPaginatedReponse: PaginatedResponseDto<ReportDTO> = { ...reportsResponse!.data } as any;
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
    } as any);
  };

  const toggleUserStarReport = async (reportDto: ReportDTO) => {
    const api: Api = new Api(token, reportDto.organization_sluglified_name, reportDto.team_sluglified_name);
    try {
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleUserStarReport(reportDto.id!);
      updateReportsResponse(result);
    } catch (e) {}
  };

  const toggleUserPinReport = async (reportDto: ReportDTO) => {
    try {
      const api: Api = new Api(token, reportDto.organization_sluglified_name, reportDto.team_sluglified_name);
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleUserPinReport(reportDto.id!);
      updateReportsResponse(result);
    } catch (e) {}
  };

  const toggleGlobalPinReport = async (reportDto: ReportDTO) => {
    try {
      const api: Api = new Api(token, reportDto.organization_sluglified_name, reportDto.team_sluglified_name);
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleGlobalPinReport(reportDto.id!);
      updateReportsResponse(result);
    } catch (e) {}
  };

  // END REPORT ACTIONS

  // START ACTIVITY FEED

  const getActivityFeed = async () => {
    if (!userProfileData || !userProfileData.userProfile) {
      return;
    }
    const api: Api = new Api(token);
    try {
      const startDatetime: Date = moment(datetimeActivityFeed).add(-DAYS_ACTIVITY_FEED, 'day').toDate();
      const result: NormalizedResponseDTO<ActivityFeed[]> = await api.getUserActivityFeed(username as string, {
        start_datetime: startDatetime,
        end_datetime: datetimeActivityFeed,
        user_id: userProfileData.userProfile.id,
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

  const onChangeBackgroundImage = async (file: File) => {
    if (!file) {
      return;
    }
    try {
      setShowToaster(true);
      setMessageToaster('Uploading image...');
      const api: Api = new Api(commonData.token);
      const response: NormalizedResponseDTO<UserDTO> = await api.updateUserBackgroundImage(file);
      setUser(response.data);
      setUserProfileData({ errorUserProfile: null, userProfile: response.data });
      setMessageToaster('Image uploaded successfully!');
      setTimeout(() => {
        setShowToaster(false);
      }, 3000);
    } catch (e) {}
  };

  if (!userProfileData || !commonData) {
    return null;
  }

  if (userProfileData.errorUserProfile) {
    return <div className="text-center mt-4">{userProfileData.errorUserProfile}</div>;
  }

  return (
    <div className="p-2">
      <ToasterNotification show={showToaster} setShow={setShowToaster} message={messageToaster} icon={<InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />} />
      <UserProfileInfo commonData={commonData} onChangeBackgroundImage={onChangeBackgroundImage} onChangeTab={onChangeTab} currentTab={currentTab} userProfile={userProfileData.userProfile!} />
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
                        commonData={commonData}
                        key={report.id}
                        report={report}
                        authors={report.authors ? report.authors : []}
                        toggleUserStarReport={() => toggleUserStarReport(report)}
                        toggleUserPinReport={() => toggleUserPinReport(report)}
                        toggleGlobalPinReport={() => toggleGlobalPinReport(report)}
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
              {activityFeed && activityFeed.data.length > 0 ? (
                <React.Fragment>
                  <p className="text-xs font-bold leading-relaxed text-gray-700 py-10">Most recent</p>
                  <ActivityFeedComponent activityFeed={activityFeed} hasMore={hasMore} getMore={getMoreActivityFeed} />
                </React.Fragment>
              ) : (
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
