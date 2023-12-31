/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint no-empty: "off" */
import ActivityFeedComponent from '@/components/ActivityFeed';
import ChannelList from '@/components/ChannelList';
import InfoActivity from '@/components/InfoActivity';
import ManageUsers from '@/components/ManageUsers';
import Pagination from '@/components/Pagination';
import PureAvatar from '@/components/PureAvatar';
import PureNewReportPopover from '@/components/PureNewReportPopover';
import { PureSpinner } from '@/components/PureSpinner';
import ReportBadge from '@/components/ReportBadge';
import { Helper } from '@/helpers/Helper';
import { checkJwt } from '@/helpers/check-jwt';
import { HelperPermissions } from '@/helpers/check-permissions';
import { checkReportAuthors } from '@/helpers/check-report-authors';
import { useInterval } from '@/hooks/use-interval';
import type { PaginationParams } from '@/interfaces/pagination-params';
import type { ReportsFilter } from '@/interfaces/reports-filter';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { Member } from '@/types/member';
import UnpureDeleteOrganizationDropdown from '@/unpure-components/UnpureDeleteOrganizationDropdown';
import { XCircleIcon } from '@heroicons/react/solid';
import type {
  ActivityFeed,
  NormalizedResponseDTO,
  Organization,
  OrganizationInfoDto,
  OrganizationMember,
  PaginatedResponseDto,
  ReportDTO,
  ResourcePermissions,
  SearchUser,
  TeamMembershipOriginEnum,
  UserDTO,
} from '@kyso-io/kyso-model';
import { GlobalPermissionsEnum, KysoSettingsEnum, OrganizationPermissionsEnum, ReportPermissionsEnum, SearchUserDto } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import debounce from 'lodash.debounce';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReadMoreReact from 'read-more-react';
import ReportsSearchBar from '../../components/ReportsSearchBar';
import { usePublicSetting } from '../../hooks/use-public-setting';

const DAYS_ACTIVITY_FEED: number = 14;
const MAX_ACTIVITY_FEED_ITEMS: number = 15;
const ACTIVITY_FEED_POOLING_MS: number = 30 * 1000; // 30 seconds

const debouncedPaginatedReports = debounce(
  async (tkn: string | null, organization: Organization, paginationParams: PaginationParams, cb: (data: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> | null) => void) => {
    try {
      const api: Api = new Api(tkn, organization.sluglified_name);
      let query = `organization_id=${organization.id}&skip=${(paginationParams.page - 1) * paginationParams.limit}&limit=${paginationParams.limit}`;
      if (paginationParams.query) {
        query += `&${paginationParams.query}`;
      }
      const result: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> = await api.getPaginatedReports(query);
      checkReportAuthors(result);
      cb(result);
    } catch (e) {
      cb(null);
    }
  },
  500,
);

const Index = ({ commonData, showToaster, isCurrentUserVerified, isCurrentUserSolvedCaptcha }: IKysoApplicationLayoutProps) => {
  const router = useRouter();
  const globalPrivacyShowEmailStr: any | null = usePublicSetting(KysoSettingsEnum.GLOBAL_PRIVACY_SHOW_EMAIL);
  const { join, organizationName } = router.query;
  const [requestingReports, setRequestingReports] = useState<boolean>(true);
  const [paginatedResponseDto, setPaginatedResponseDto] = useState<PaginatedResponseDto<ReportDTO> | null>(null);
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfoDto | null>(null);
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    sort: '-created_at',
    query: '',
  });
  const [searchUser, setSearchUser] = useState<SearchUser | null | undefined>(undefined);
  const [datetimeActivityFeed, setDatetimeActivityFeed] = useState<Date>(new Date());
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [activityFeed, setActivityFeed] = useState<NormalizedResponseDTO<ActivityFeed[]> | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [showEmails, setShowEmails] = useState<boolean>(false);
  const hasPermissionDeleteOrganization: boolean = useMemo(
    () => HelperPermissions.checkPermissions(commonData, [GlobalPermissionsEnum.GLOBAL_ADMIN, OrganizationPermissionsEnum.ADMIN, OrganizationPermissionsEnum.DELETE]),
    [commonData],
  );
  const hasPermissionCreateReport: boolean = useMemo(() => {
    if (!commonData.permissions) {
      return false;
    }
    if (!commonData.organization) {
      return false;
    }
    const orgResourcePermissions: ResourcePermissions | undefined = commonData.permissions.organizations!.find(
      (resourcePermissions: ResourcePermissions) => resourcePermissions.id === commonData.organization!.id,
    );
    if (!orgResourcePermissions) {
      return false;
    }
    const teamsResourcePermissions: ResourcePermissions[] = commonData.permissions.teams!.filter((resourcePermissions: ResourcePermissions) => {
      if (resourcePermissions.organization_id !== orgResourcePermissions.id) {
        return false;
      }
      const copyCommonData: any = { ...commonData };
      copyCommonData.team = {
        id: resourcePermissions.id,
      };
      return HelperPermissions.checkPermissions(copyCommonData, ReportPermissionsEnum.CREATE);
    });
    if (teamsResourcePermissions.length > 0) {
      return true;
    }
    return HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.CREATE);
  }, [commonData.permissions, commonData.organization]);
  const [invitationError, setInvitationError] = useState<string>('');

  useEffect(() => {
    if (!globalPrivacyShowEmailStr) {
      return;
    }
    setShowEmails(globalPrivacyShowEmailStr === 'true');
  }, [globalPrivacyShowEmailStr]);

  useEffect(() => {
    if (!commonData.user) {
      return undefined;
    }
    const interval = setInterval(() => {
      const validJwt: boolean = checkJwt();
      if (!validJwt) {
        router.replace('/logout');
      }
    }, Helper.CHECK_JWT_TOKEN_MS);
    return () => clearInterval(interval);
  }, [commonData.user]);

  // Needed to refresh properly when a channel changes
  useEffect(() => {
    setRequestingReports(true);
  }, [router]);

  useEffect(() => {
    if (!commonData.permissions || !commonData.permissions.organizations || !organizationName) {
      return;
    }
    // A user is trying to access the organization page with an invitation link
    if (join) {
      // The user is...
      if (!commonData.token) {
        // Unauthorized, redirect to SignUp page
        router.push(`/signup?invitation=/${organizationName}?join=${join as string}`);
        return;
      }
      // Authorized
      if (HelperPermissions.belongsToOrganization(commonData, organizationName as string)) {
        // User already belongs to the organization, skipping the invitation process
        return;
      }
      // User doesn't belong to the organization, accepting the invitation
      const joinUserToOrganization = async () => {
        try {
          const api: Api = new Api(commonData.token);
          await api.joinUserToOrganization(organizationName as string, join as string);
          router.push(`/${organizationName}`);
        } catch (e: any) {
          const errorData: { statusCode: number; message: string; error: string } = e.response.data;
          Helper.logError('Unexpected error', errorData);
          setInvitationError(errorData.message);
        }
      };
      joinUserToOrganization();
      return;
    }

    if (!HelperPermissions.belongsToOrganization(commonData, organizationName as string)) {
      if (commonData.token) {
        router.push('/');
      } else {
        router.replace(`/login?redirect=${encodeURIComponent(`/${router.query.organizationName as string}`)}`);
      }
    }
  }, [commonData?.permissions?.organizations, organizationName, join]);

  useEffect(() => {
    if (!commonData.organization || !commonData.user) {
      return;
    }
    getSearchUser();
  }, [commonData?.organization, commonData?.team, commonData?.user]);

  useEffect(() => {
    if (!commonData.organization) {
      return;
    }
    getReports(paginationParams);
  }, [commonData?.organization, paginationParams]);

  useEffect(() => {
    if (!commonData.organization) {
      return;
    }
    getOrganizationsInfo();
    getOrganizationMembers();
  }, [commonData?.organization]);

  useEffect(() => {
    if (!commonData.organization) {
      return;
    }
    getActivityFeed();
  }, [commonData.organization, datetimeActivityFeed]);

  const refreshLastActivityFeed = useCallback(async () => {
    if (!commonData.organization) {
      return;
    }
    const api: Api = new Api(commonData.token);
    try {
      const result: NormalizedResponseDTO<ActivityFeed[]> = await api.getOrganizationActivityFeed(commonData.organization.sluglified_name as string, {
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
  }, [commonData.organization]);

  useInterval(refreshLastActivityFeed, ACTIVITY_FEED_POOLING_MS);

  const getReports = async (pp: PaginationParams) => {
    setRequestingReports(true);
    debouncedPaginatedReports(commonData.token, commonData.organization!, pp, (result: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> | null) => {
      setPaginatedResponseDto(result?.data ? result.data : null);
      setRequestingReports(false);
    });
  };

  const getOrganizationsInfo = async () => {
    try {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<OrganizationInfoDto[]> = await api.getOrganizationsInfo(commonData!.organization!.id!);
      if (result?.data?.length > 0) {
        setOrganizationInfo(result.data[0]!);
      }
    } catch (e) {}
  };

  const toggleUserStarReport = async (reportDto: ReportDTO) => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    const api: Api = new Api(commonData.token, reportDto.organization_sluglified_name, reportDto.team_sluglified_name);

    try {
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleUserStarReport(reportDto.id!);
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
      setPaginatedResponseDto({ ...paginatedResponseDto!, results: newReports } as any);
    } catch (e) {}
  };

  const toggleUserPinReport = async (reportDto: ReportDTO) => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    const api: Api = new Api(commonData.token, reportDto.organization_sluglified_name, reportDto.team_sluglified_name);
    try {
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleUserPinReport(reportDto.id!);
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
      setPaginatedResponseDto({ ...paginatedResponseDto!, results: newReports } as any);
    } catch (e) {}
  };

  const toggleGlobalPinReport = async (reportDto: ReportDTO) => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    const api: Api = new Api(commonData.token, reportDto.organization_sluglified_name, reportDto.team_sluglified_name);
    try {
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleGlobalPinReport(reportDto.id!);
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
      setPaginatedResponseDto({ ...paginatedResponseDto!, results: newReports } as any);
    } catch (e) {}
  };

  const getActivityFeed = async () => {
    if (!commonData.organization) {
      return;
    }
    const api: Api = new Api(commonData.token);
    try {
      const startDatetime: Date = moment(datetimeActivityFeed).add(-DAYS_ACTIVITY_FEED, 'day').toDate();
      const result: NormalizedResponseDTO<ActivityFeed[]> = await api.getOrganizationActivityFeed(commonData.organization.sluglified_name, {
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

  // START ORGANIZATION MEMBERS
  const getOrganizationMembers = async () => {
    try {
      const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
      const result: NormalizedResponseDTO<OrganizationMember[]> = await api.getOrganizationMembers(commonData!.organization!.id!);
      const m: Member[] = [];
      let userMember: Member | null = null;
      result.data.forEach((organizationMember: OrganizationMember) => {
        if (organizationMember.id === commonData!.user?.id) {
          userMember = {
            id: organizationMember.id!,
            nickname: organizationMember.nickname,
            username: organizationMember.username,
            display_name: organizationMember.nickname,
            avatar_url: organizationMember.avatar_url,
            email: organizationMember.email,
            organization_roles: organizationMember.organization_roles,
            team_roles: [],
          };
        } else {
          m.push({
            id: organizationMember.id!,
            nickname: organizationMember.nickname,
            username: organizationMember.username,
            display_name: organizationMember.nickname,
            avatar_url: organizationMember.avatar_url,
            email: organizationMember.email,
            organization_roles: organizationMember.organization_roles,
            team_roles: [],
          });
        }
      });
      if (userMember) {
        m.unshift(userMember);
      }
      setMembers(m);
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
  };

  const searchUsers = async (query: string): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
      const result: NormalizedResponseDTO<UserDTO[]> = await api.getUsers({
        userIds: [],
        page: 1,
        per_page: 1000,
        sort: '',
        search: query,
      });
      setUsers(result.data);
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
  };

  const updateMemberRole = async (_userId: string, _organizationRole: string): Promise<void> => {
    // Reloading of data is too fast, to retrieve the right value we need to wait a bit
    setTimeout(() => {
      getOrganizationMembers();
    }, 500);
  };

  const inviteNewUser = async (_email: string, _organizationRole: string): Promise<void> => {
    // Reloading of data is too fast, to retrieve the right value we need to wait a bit
    setTimeout(() => {
      getOrganizationMembers();
    }, 500);
  };

  const removeUser = async (_userId: string, _type: TeamMembershipOriginEnum): Promise<void> => {
    // Reloading of data is too fast, to retrieve the right value we need to wait a bit
    setTimeout(() => {
      getOrganizationMembers();
    }, 500);
  };

  // END ORGANIZATION MEMBERS

  const getSearchUser = async () => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const result: NormalizedResponseDTO<SearchUser> = await api.getSearchUser(commonData.organization!.id!);
      const newPaginationParams: PaginationParams = { ...paginationParams };
      if (result.data) {
        setSearchUser(result.data);
        newPaginationParams.query = result.data.query || '';
      }
      setPaginationParams(newPaginationParams);
      getReports(newPaginationParams);
    } catch (e) {}
  };

  const createSearchUser = async (query: string, payload: ReportsFilter[]) => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const searchUserDto: SearchUserDto = new SearchUserDto(commonData.organization!.id!, null, query, payload);
      const result: NormalizedResponseDTO<SearchUser> = await api.createSearchUser(searchUserDto);
      setSearchUser(result.data);
    } catch (e) {}
  };

  const deleteSearchUser = async () => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      await api.deleteSearchUser(searchUser!.id!);
      setSearchUser(null);
    } catch (e) {}
  };

  // END SEARCH USER

  if (commonData.errorOrganization) {
    return <div className="text-center mt-4">{commonData.errorOrganization}</div>;
  }

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="hidden md:block w-1/6">
        <ChannelList basePath={router.basePath} commonData={commonData} />
      </div>
      <div className="w-4/6 flex flex-col space-y-4">
        {invitationError ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">There was an error in the invitation process</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul role="list" className="list-disc space-y-1 pl-5">
                    <li>{invitationError}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <React.Fragment>
            <div className="flex items-center w justify-between p-2">
              <div className="shrink-0 flex flex-row items-end space-x-2">
                <PureAvatar
                  src={commonData.organization?.avatar_url ? commonData.organization?.avatar_url : ''}
                  title={commonData.organization?.display_name ? commonData.organization?.display_name : ''}
                  size={TailwindHeightSizeEnum.H16}
                  textSize={TailwindFontSizeEnum.XXL}
                />
                <h1 className="ml-12 mb-4 text-2xl font-bold text-gray-900">{commonData.organization?.display_name}</h1>
              </div>
              <div className="invisible md:visible md:flex items-center space-x-2">
                <ManageUsers
                  commonData={commonData}
                  members={members}
                  onInputChange={(query: string) => searchUsers(query)}
                  users={users}
                  showTeamRoles={false}
                  onUpdateRoleMember={updateMemberRole}
                  onInviteNewUser={inviteNewUser}
                  onRemoveUser={removeUser}
                  showEmails={showEmails}
                  showToaster={showToaster}
                  isCurrentUserSolvedCaptcha={isCurrentUserSolvedCaptcha}
                  isCurrentUserVerified={isCurrentUserVerified}
                />
                {hasPermissionDeleteOrganization && (
                  <UnpureDeleteOrganizationDropdown
                    commonData={commonData}
                    showToaster={showToaster}
                    isCurrentUserSolvedCaptcha={isCurrentUserSolvedCaptcha}
                    isCurrentUserVerified={isCurrentUserVerified}
                  />
                )}
                {commonData?.user && hasPermissionCreateReport && (
                  <PureNewReportPopover commonData={commonData} isCurrentUserSolvedCaptcha={isCurrentUserSolvedCaptcha} isCurrentUserVerified={isCurrentUserVerified} />
                )}
              </div>
            </div>
            {organizationInfo && <InfoActivity info={organizationInfo} />}
            <ReportsSearchBar
              members={members}
              onSaveSearch={(query: string | null, payload: ReportsFilter[] | null) => {
                if (query) {
                  createSearchUser(query, payload!);
                } else if (searchUser && !query) {
                  deleteSearchUser();
                }
              }}
              onFiltersChange={(query: string) => setPaginationParams({ ...paginationParams, page: 1, query: query || '' })}
              searchUser={searchUser}
              user={commonData.user}
            />
            {requestingReports && (
              <div className="text-center">
                <PureSpinner size={12} />
              </div>
            )}
            {!requestingReports && (
              <>
                <div className="grid lg:grid-cols-1 sm:grid-cols-1 xs:grid-cols-1 gap-4">
                  {paginatedResponseDto?.results && paginatedResponseDto.results.length === 0 && <p>There are no reports</p>}
                  {paginatedResponseDto?.results &&
                    paginatedResponseDto.results.length > 0 &&
                    paginatedResponseDto?.results.map((report: ReportDTO) => (
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
                {paginatedResponseDto && paginatedResponseDto.totalPages > 1 && (
                  <div className="pt-10">
                    <Pagination
                      page={paginatedResponseDto.currentPage}
                      numPages={paginatedResponseDto.totalPages}
                      onPageChange={(page: number) => setPaginationParams({ ...paginationParams, page })}
                    />
                  </div>
                )}
              </>
            )}
          </React.Fragment>
        )}
      </div>
      {!invitationError && commonData.user && (
        <div className="hidden lg:block w-1/6">
          <ActivityFeedComponent activityFeed={activityFeed} hasMore={hasMore} getMore={getMoreActivityFeed} />
          {commonData.organization?.bio && (
            <div className="pt-10 border-t-gray-300 border-t-4 mt-2">
              <h1 className="text-xl font-bold text-gray-800 mb-2">About {commonData.organization?.display_name}</h1>
              {Helper.isBrowser() && <ReadMoreReact text={commonData.organization?.bio || ''} ideal={200} readMoreText={'Read more...'} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
