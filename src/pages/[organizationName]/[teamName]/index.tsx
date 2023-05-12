/* eslint-disable @typescript-eslint/no-explicit-any */
import UnpureDeleteChannelDropdown from '@/unpure-components/UnpureDeleteChannelDropdown';
import type {
  ActivityFeed,
  NormalizedResponseDTO,
  Organization,
  OrganizationMember,
  PaginatedResponseDto,
  ReportDTO,
  SearchUser,
  Team,
  TeamInfoDto,
  TeamMember,
  TeamMembershipOriginEnum,
  TeamsInfoQuery,
  UserDTO,
} from '@kyso-io/kyso-model';
import { KysoSettingsEnum, OrganizationPermissionsEnum, ReportPermissionsEnum, SearchUserDto, TeamPermissionsEnum } from '@kyso-io/kyso-model';
// @ts-ignore
import ActivityFeedComponent from '@/components/ActivityFeed';
import ChannelList from '@/components/ChannelList';
import ChannelVisibility from '@/components/ChannelVisibility';
import InfoActivity from '@/components/InfoActivity';
import ManageUsers from '@/components/ManageUsers';
import Pagination from '@/components/Pagination';
import PureNewReportPopover from '@/components/PureNewReportPopover';
import { PureSpinner } from '@/components/PureSpinner';
import ReportBadge from '@/components/ReportBadge';
import ReportsSearchBar from '@/components/ReportsSearchBar';
import { Helper } from '@/helpers/Helper';
import { checkJwt } from '@/helpers/check-jwt';
import { HelperPermissions } from '@/helpers/check-permissions';
import { checkReportAuthors } from '@/helpers/check-report-authors';
import type { PaginationParams } from '@/interfaces/pagination-params';
import type { ReportsFilter } from '@/interfaces/reports-filter';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { TailwindWidthSizeEnum } from '@/tailwind/enum/tailwind-width.enum';
import type { Member } from '@/types/member';
import { Api } from '@kyso-io/kyso-store';
import debounce from 'lodash.debounce';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import ReadMoreReact from 'read-more-react';
import { usePublicSetting } from '../../../hooks/use-public-setting';

const DAYS_ACTIVITY_FEED: number = 14;
const MAX_ACTIVITY_FEED_ITEMS: number = 15;

const debouncedPaginatedReports = debounce(
  async (
    tkn: string | null,
    organization: Organization,
    team: Team,
    paginationParams: PaginationParams,
    queryParams: string,
    cb: (data: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> | null) => void,
  ) => {
    try {
      const api: Api = new Api(tkn, organization.sluglified_name, team.sluglified_name);
      let query = `team_id=${team.id}&skip=${(paginationParams.page - 1) * paginationParams.limit}&limit=${paginationParams.limit}`;
      if (queryParams) {
        query += `&${queryParams}`;
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
  const showEmailStr: any | null = usePublicSetting(KysoSettingsEnum.GLOBAL_PRIVACY_SHOW_EMAIL);

  const [teamInfo, setTeamInfo] = useState<TeamInfoDto | null>(null);
  // MEMBERS
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  // REPORTS
  const [paginatedResponseDto, setPaginatedResponseDto] = useState<PaginatedResponseDto<ReportDTO> | null>(null);
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    sort: '-created_at',
  });
  const [requestingReports, setRequestingReports] = useState<boolean>(true);
  const [queryParams, setQueryParams] = useState<string>('');
  // ACTIVITY FEED
  const [datetimeActivityFeed, setDatetimeActivityFeed] = useState<Date>(new Date());
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activityFeed, setActivityFeed] = useState<NormalizedResponseDTO<ActivityFeed[]> | null>(null);
  // PERMISSIONS
  const hasPermissionDeleteChannel: boolean = useMemo(
    () => HelperPermissions.checkPermissions(commonData, [OrganizationPermissionsEnum.ADMIN, TeamPermissionsEnum.ADMIN, TeamPermissionsEnum.DELETE]),
    [commonData],
  );
  const hasPermissionCreateReport: boolean = useMemo(() => {
    if (!commonData.permissions) {
      return false;
    }
    if (!commonData.organization) {
      return false;
    }
    return HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.CREATE);
  }, [commonData.permissions, commonData.organization]);
  // SEARCH USER
  const [searchUser, setSearchUser] = useState<SearchUser | null | undefined>(undefined);
  const [showEmails, setShowEmails] = useState<boolean>(false);

  useEffect(() => {
    if (!showEmailStr) {
      return;
    }
    setShowEmails(showEmailStr === 'true');
  }, [showEmailStr]);

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

  useEffect(() => {
    if (!commonData.permissions || !commonData.permissions.organizations || !commonData.permissions.teams || !router.query.organizationName || !router.query.teamName) {
      return;
    }

    if (!HelperPermissions.belongsToOrganization(commonData, router.query.organizationName as string)) {
      if (commonData.token) {
        router.replace('/');
      } else {
        router.replace(`/login?redirect=${encodeURIComponent(`/${router.query.organizationName as string}/${router.query.teamName as string}`)}`);
      }
      return;
    }
    if (!HelperPermissions.belongsToTeam(commonData, router.query.organizationName as string, router.query.teamName as string)) {
      if (commonData.token) {
        router.replace(`/${router.query.organizationName as string}`);
      } else {
        router.replace(`/login?redirect=${encodeURIComponent(`/${router.query.organizationName as string}/${router.query.teamName as string}`)}`);
      }
    }
  }, [commonData?.permissions?.organizations, commonData?.permissions?.teams, router.query?.organizationName, router.query?.teamName]);

  useEffect(() => {
    if (!commonData.team) {
      return;
    }
    getTeamsInfo();
    getTeamMembers();
  }, [commonData?.team, commonData?.user]);

  useEffect(() => {
    if (!commonData.organization || !commonData.team) {
      return;
    }
    if (commonData.user) {
      getSearchUser();
    } else {
      getReports();
    }
  }, [commonData?.organization, commonData?.team, commonData?.user, paginationParams, queryParams]);

  useEffect(() => {
    if (!commonData.organization || !commonData.team) {
      return;
    }
    getActivityFeed();
  }, [commonData?.organization, commonData?.team, datetimeActivityFeed]);

  const getReports = async () => {
    setRequestingReports(true);
    debouncedPaginatedReports(commonData.token, commonData.organization!, commonData.team!, paginationParams, queryParams, (result: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> | null) => {
      setPaginatedResponseDto(result?.data ? result.data : null);
      setRequestingReports(false);
    });
  };

  const getTeamsInfo = async () => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);
      const teamsInfoQuery: TeamsInfoQuery = {
        organizationId: commonData.organization!.id!,
        teamId: commonData.team!.id!,
        page: 1,
        limit: 1,
        search: '',
      };
      const result: NormalizedResponseDTO<PaginatedResponseDto<TeamInfoDto>> = await api.getTeamsInfo(teamsInfoQuery);
      if (result?.data?.results.length > 0) {
        setTeamInfo(result.data.results[0]!);
      }
    } catch (e) {}
  };

  // START TEAM MEMBERS

  const getTeamMembers = async () => {
    const m: Member[] = [];
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const resultOrgMembers: NormalizedResponseDTO<OrganizationMember[]> = await api.getOrganizationMembers(commonData.organization!.id!);
      let userMember: Member | null = null;
      resultOrgMembers.data.forEach((organizationMember: OrganizationMember) => {
        if (organizationMember.id === commonData.user?.id) {
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

      api.setTeamSlug(commonData.team!.sluglified_name);
      const resultTeamMembers: NormalizedResponseDTO<TeamMember[]> = await api.getTeamMembers(commonData.team!.id!);
      resultTeamMembers.data.forEach((teamMember: TeamMember) => {
        const member: Member | undefined = m.find((mem: Member) => mem.id === teamMember.id);
        if (userMember && userMember.id === teamMember.id) {
          /**
           * this weird filter is there because sometimes team_roles looks like [null],
           * it has an element of null
           */

          userMember.team_roles = teamMember.team_roles.filter((r) => !!r);
          userMember.membership_origin = teamMember.membership_origin;
        } else if (member) {
          member.team_roles = teamMember.team_roles.filter((r) => !!r);
          member.membership_origin = teamMember.membership_origin;
        } else {
          m.push({
            id: teamMember.id!,
            nickname: teamMember.nickname,
            username: teamMember.username,
            display_name: teamMember.nickname,
            avatar_url: teamMember.avatar_url,
            email: teamMember.email,
            organization_roles: [],
            team_roles: teamMember.team_roles.filter((r) => !!r),
            membership_origin: teamMember.membership_origin,
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
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
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

  const updateMemberRole = async (_userId: string, _organizationRole: string, _teamRole?: string): Promise<void> => {
    // Reloading of data is too fast, to retrieve the right value we need to wait a bit
    setTimeout(() => {
      getTeamMembers();
    }, 500);
  };

  const inviteNewUser = async (_email: string, _organizationRole: string, _teamRole?: string): Promise<void> => {
    // Reloading of data is too fast, to retrieve the right value we need to wait a bit
    setTimeout(() => {
      getTeamMembers();
    }, 500);
  };

  const removeUser = async (_userId: string, _type: TeamMembershipOriginEnum): Promise<void> => {
    // Reloading of data is too fast, to retrieve the right value we need to wait a bit
    setTimeout(() => {
      getTeamMembers();
    }, 500);
  };

  // END TEAM MEMBERS

  // START REPORT ACTIONS

  const toggleUserStarReport = async (reportDto: ReportDTO) => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    try {
      const api: Api = new Api(commonData.token, reportDto.organization_sluglified_name, reportDto.team_sluglified_name);
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

    try {
      const api: Api = new Api(commonData.token, reportDto.organization_sluglified_name, reportDto.team_sluglified_name);
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

    try {
      const api: Api = new Api(commonData.token, reportDto.organization_sluglified_name, reportDto.team_sluglified_name);
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

  // END REPORT ACTIONS

  // START ACTIVITY FEED

  const getActivityFeed = async () => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      const startDatetime: Date = moment(datetimeActivityFeed).add(-DAYS_ACTIVITY_FEED, 'day').toDate();
      const result: NormalizedResponseDTO<ActivityFeed[]> = await api.getTeamActivityFeed(commonData.organization!.sluglified_name, commonData.team!.sluglified_name, {
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

  // END ACTIVITY FEED

  // START SEARCH USER

  const getSearchUser = async () => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      const result: NormalizedResponseDTO<SearchUser> = await api.getSearchUser(commonData.organization!.id!, commonData.team!.id!);
      if (result.data) {
        setSearchUser(result.data);
      } else {
        getReports();
      }
    } catch (e) {}
  };

  const createSearchUser = async (query: string, payload: ReportsFilter[]) => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      const searchUserDto: SearchUserDto = new SearchUserDto(commonData.organization!.id!, commonData.team!.id!, query, payload);
      const result: NormalizedResponseDTO<SearchUser> = await api.createSearchUser(searchUserDto);
      setSearchUser(result.data);
    } catch (e) {}
  };

  const deleteSearchUser = async () => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      await api.deleteSearchUser(searchUser!.id!);
      setSearchUser(null);
    } catch (e) {}
  };

  // END SEARCH USER

  if (commonData.errorTeam) {
    return <div className="text-center mt-4">{commonData.errorTeam}</div>;
  }

  return (
    <div className="flex flex-row space-x-8 p-4">
      <div className="hidden md:block md:w-1/6">
        <ChannelList basePath={router.basePath} commonData={commonData} />
      </div>
      <div className="w-4/6 flex flex-col space-y-4">
        {commonData.team && (
          <div className="flex flex-row w-full justify-between space-x-2">
            <div className="w-3/6 flex flex-col justify-between">
              <div className="flex justify-start content-center items-center">
                <div className="text-xl font-medium">{commonData.team.display_name}</div>
                <ChannelVisibility
                  containerClasses="ml-10"
                  teamVisibility={commonData.team.visibility}
                  imageWidth={TailwindWidthSizeEnum.W4}
                  imageMarginX={TailwindWidthSizeEnum.W4}
                  imageMarginY={TailwindWidthSizeEnum.W1}
                />
              </div>
            </div>
            <div className="invisible lg:visible lg:w-3/6 lg:flex lg:flex-row justify-end items-center space-x-2">
              <ManageUsers
                commonData={commonData}
                members={members}
                onInputChange={(query: string) => searchUsers(query)}
                users={users}
                showTeamRoles={true}
                onUpdateRoleMember={updateMemberRole}
                onInviteNewUser={inviteNewUser}
                onRemoveUser={removeUser}
                showEmails={showEmails}
                showToaster={showToaster}
                isCurrentUserSolvedCaptcha={isCurrentUserSolvedCaptcha}
                isCurrentUserVerified={isCurrentUserVerified}
              />
              {hasPermissionDeleteChannel && (
                <UnpureDeleteChannelDropdown commonData={commonData} showToaster={showToaster} isCurrentUserSolvedCaptcha={isCurrentUserSolvedCaptcha} isCurrentUserVerified={isCurrentUserVerified} />
              )}
              {commonData?.user && hasPermissionCreateReport && (
                <PureNewReportPopover commonData={commonData} isCurrentUserSolvedCaptcha={isCurrentUserSolvedCaptcha} isCurrentUserVerified={isCurrentUserVerified} />
              )}
            </div>
          </div>
        )}

        {teamInfo && <InfoActivity info={teamInfo} visibility={commonData.team?.visibility} hasLabel={true} showPrivacy={false} />}

        <ReportsSearchBar
          members={members}
          onSaveSearch={(query: string | null, payload: ReportsFilter[] | null) => {
            if (query) {
              createSearchUser(query, payload!);
            } else if (searchUser && !query) {
              deleteSearchUser();
            }
          }}
          onFiltersChange={(query: string) => {
            setPaginationParams({ ...paginationParams, page: 1 });
            setQueryParams(query || '');
          }}
          searchUser={searchUser}
          user={commonData.user}
        />
        {requestingReports && (
          <div className="text-center">
            <PureSpinner size={12} />
          </div>
        )}
        {!requestingReports && (
          <React.Fragment>
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
                <Pagination page={paginatedResponseDto.currentPage} numPages={paginatedResponseDto.totalPages} onPageChange={(page: number) => setPaginationParams({ ...paginationParams, page })} />
              </div>
            )}
          </React.Fragment>
        )}
      </div>
      <div className="hidden lg:block w-1/6">
        <ActivityFeedComponent activityFeed={activityFeed} hasMore={hasMore} getMore={getMoreActivityFeed} />
        {commonData.team?.bio && (
          <div className="pt-10 border-t-gray-300 border-t-4 mt-2">
            <h1 className="text-xl font-bold text-gray-800 mb-2">About {commonData.team?.display_name}</h1>
            {Helper.isBrowser() && <ReadMoreReact text={commonData.team?.bio || ''} ideal={200} readMoreText={'Read more...'} />}
          </div>
        )}
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
