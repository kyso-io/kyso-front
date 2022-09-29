/* eslint-disable @typescript-eslint/no-explicit-any */
import checkPermissions from '@/helpers/check-permissions';
import type { CommonData } from '@/types/common-data';
import UnpureDeleteChannelDropdown from '@/unpure-components/UnpureDeleteChannelDropdown';
import type {
  ActivityFeed,
  KysoSetting,
  NormalizedResponseDTO,
  Organization,
  OrganizationMember,
  PaginatedResponseDto,
  ReportDTO,
  SearchUser,
  SearchUserDto,
  Team,
  TeamInfoDto,
  TeamMember,
  UserDTO,
  ResourcePermissions,
} from '@kyso-io/kyso-model';
import { KysoSettingsEnum, OrganizationPermissionsEnum, TeamMembershipOriginEnum, TeamPermissionsEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import debounce from 'lodash.debounce';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import ActivityFeedComponent from '../../../components/ActivityFeed';
import ChannelList from '../../../components/ChannelList';
import InfoActivity from '../../../components/InfoActivity';
import ManageUsers from '../../../components/ManageUsers';
import PureNewReportPopover from '../../../components/PureNewReportPopover';
import { PureSpinner } from '../../../components/PureSpinner';
import ReportBadge from '../../../components/ReportBadge';
import ReportsSearchBar from '../../../components/ReportsSearchBar';
import type { ReportsFilter } from '../../../interfaces/reports-filter';
import KysoApplicationLayout from '../../../layouts/KysoApplicationLayout';
import type { Member } from '../../../types/member';

const LIMIT_REPORTS = 10;
const DAYS_ACTIVITY_FEED: number = 14;
const MAX_ACTIVITY_FEED_ITEMS: number = 15;

const debouncedPaginatedReports = debounce(
  async (tkn: string | null, organization: Organization, team: Team, page: number, queryParams: string, cb: (data: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> | null) => void) => {
    try {
      const api: Api = new Api(tkn, organization.sluglified_name, team.sluglified_name);
      let query = `team_id=${team.id}&skip=${(page - 1) * LIMIT_REPORTS}&limit=${LIMIT_REPORTS}`;
      if (queryParams) {
        query += `&${queryParams}`;
      }
      const result: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> = await api.getPaginatedReports(query);
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

      const dataWithAuthors: ReportDTO[] = [];
      for (const x of result.data.results) {
        const allAuthorsId: string[] = [x.user_id, ...x.author_ids];
        const uniqueAllAuthorsId: string[] = Array.from(new Set(allAuthorsId));
        const allAuthorsData: UserDTO[] = [];
        for (const authorId of uniqueAllAuthorsId) {
          /* eslint-disable no-await-in-loop */
          if (result.relations?.user[authorId]) {
            allAuthorsData.push(result.relations.user[authorId]);
          }
        }
        x.authors = allAuthorsData;
        dataWithAuthors.push(x);
      }
      result.data.results = dataWithAuthors;
      cb(result);
    } catch (e) {
      cb(null);
    }
  },
  500,
);

interface Props {
  commonData: CommonData;
}

const Index = ({ commonData }: Props) => {
  const router = useRouter();
  const [teamInfo, setTeamInfo] = useState<TeamInfoDto | null>(null);
  // MEMBERS
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  // REPORTS
  const [reportsResponse, setReportsResponse] = useState<NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> | null>(null);
  const [requestingReports, setRequestingReports] = useState<boolean>(true);
  // ACTIVITY FEED
  const [datetimeActivityFeed, setDatetimeActivityFeed] = useState<Date>(new Date());
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activityFeed, setActivityFeed] = useState<NormalizedResponseDTO<ActivityFeed[]> | null>(null);
  // PERMISSIONS
  const hasPermissionDeleteChannel: boolean = useMemo(() => checkPermissions(commonData, [OrganizationPermissionsEnum.ADMIN, TeamPermissionsEnum.ADMIN, TeamPermissionsEnum.DELETE]), [commonData]);
  // SEARCH USER
  const [searchUser, setSearchUser] = useState<SearchUser | null | undefined>(undefined);
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const api: Api = new Api();
        const resultKysoSetting: NormalizedResponseDTO<KysoSetting[]> = await api.getPublicSettings();
        const index: number = resultKysoSetting.data.findIndex((item: KysoSetting) => item.key === KysoSettingsEnum.HCAPTCHA_ENABLED);
        if (index !== -1) {
          setCaptchaIsEnabled(resultKysoSetting.data[index]!.value === 'true');
        }
      } catch (errorHttp: any) {
        console.error(errorHttp.response.data);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (commonData.permissions?.organizations && commonData.permissions?.teams) {
      const indexOrganization: number = commonData.permissions.organizations.findIndex((item: ResourcePermissions) => item.name === router.query.organizationName);
      if (indexOrganization === -1) {
        router.replace('/');
        return;
      }
      const indexTeam: number = commonData.permissions.teams.findIndex((item: ResourcePermissions) => item.name === router.query.teamName);
      if (indexTeam === -1) {
        router.replace(`/${router.query.organizationName}`);
      }
    }
  }, [commonData?.permissions?.organizations, commonData?.permissions?.teams]);

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
      getReports(1);
    }
  }, [commonData?.organization, commonData?.team, commonData?.user]);

  useEffect(() => {
    if (!commonData.organization || !commonData.team) {
      return;
    }
    getActivityFeed();
  }, [commonData?.organization, commonData?.team, datetimeActivityFeed]);

  const getReports = async (page: number, queryParams?: string) => {
    setRequestingReports(true);
    debouncedPaginatedReports(commonData.token, commonData.organization!, commonData.team!, page, queryParams ?? '', (data: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> | null) => {
      setReportsResponse(data);
      setRequestingReports(false);
    });
  };

  const getTeamsInfo = async () => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);
      const result: NormalizedResponseDTO<TeamInfoDto[]> = await api.getTeamsInfo(commonData!.team!.id);
      if (result?.data?.length > 0) {
        setTeamInfo(result.data[0]!);
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
            id: organizationMember.id,
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
            id: organizationMember.id,
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
            id: teamMember.id,
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
      console.error(e);
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
      console.log(e);
    }
  };

  const updateMemberRole = async (userId: string, organizationRole: string, teamRole?: string): Promise<void> => {
    const index: number = members.findIndex((m: Member) => m.id === userId);
    if (index === -1) {
      try {
        const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
        await api.addUserToOrganization({
          organizationId: commonData.organization!.id!,
          userId,
          role: organizationRole,
        });
      } catch (e) {
        console.error(e);
      }
      if (teamRole) {
        try {
          const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
          await api.updateTeamMemberRoles(commonData.team!.id!, {
            members: [
              {
                userId,
                role: teamRole,
              },
            ],
          });
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      if (!members[index]!.organization_roles.includes(organizationRole)) {
        try {
          const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
          await api.updateOrganizationMemberRoles(commonData.organization!.id!, {
            members: [
              {
                userId,
                role: organizationRole,
              },
            ],
          });
        } catch (e) {
          console.error(e);
        }
      }
      if (teamRole && !members[index]!.team_roles.includes(teamRole)) {
        try {
          const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
          await api.updateTeamMemberRoles(commonData.team!.id!, {
            members: [
              {
                userId,
                role: teamRole,
              },
            ],
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
    getTeamMembers();
  };

  const inviteNewUser = async (email: string, organizationRole: string): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      await api.inviteNewUser({
        email,
        organizationSlug: commonData.organization!.sluglified_name,
        organizationRole,
      });
      getTeamMembers();
    } catch (e) {
      console.error(e);
    }
  };

  const removeUser = async (userId: string, type: TeamMembershipOriginEnum): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      if (type === TeamMembershipOriginEnum.ORGANIZATION) {
        await api.removeUserFromOrganization(commonData!.organization!.id!, userId);
      } else {
        await api.deleteUserFromTeam(commonData.team!.id!, userId);
      }
      getTeamMembers();
    } catch (e) {
      console.error(e);
    }
  };

  // END TEAM MEMBERS

  // START REPORT ACTIONS

  const toggleUserStarReport = async (reportDto: ReportDTO) => {
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
      const { results: reports } = reportsResponse!.data;
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
      setReportsResponse({ ...reportsResponse!, data: { ...reportsResponse!.data, results: newReports } });
    } catch (e) {}
  };

  const toggleUserPinReport = async (reportDto: ReportDTO) => {
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
      const { results: reports } = reportsResponse!.data;
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
      setReportsResponse({ ...reportsResponse!, data: { ...reportsResponse!.data, results: newReports } });
    } catch (e) {}
  };

  const toggleGlobalPinReport = async (reportDto: ReportDTO) => {
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
      const { results: reports } = reportsResponse!.data;
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
      setReportsResponse({ ...reportsResponse!, data: { ...reportsResponse!.data, results: newReports } });
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
      const result: NormalizedResponseDTO<SearchUser> = await api.getSearchUser(commonData.organization!.id!, commonData.team!.id);
      if (result.data) {
        setSearchUser(result.data);
      } else {
        getReports(1);
      }
    } catch (e) {}
  };

  const createSearchUser = async (query: string, payload: ReportsFilter[]) => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      const searchUserDto: SearchUserDto = {
        organization_id: commonData.organization!.id!,
        team_id: commonData.team!.id!,
        query,
        payload,
      };
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
      <div className="w-1/6">
        <ChannelList basePath={router.basePath} commonData={commonData} />
      </div>
      <div className="w-4/6 flex flex-col space-y-4">
        {commonData.team && (
          <div className="flex flex-row w-full justify-between space-x-2">
            <div className="w-3/6 flex flex-col justify-between">
              <div className="text-xl font-medium">{commonData.team.display_name}</div>
              <div className="text-md">{commonData.team.bio}</div>
            </div>
            <div className="w-3/6 flex flex-row justify-end items-center space-x-2">
              <ManageUsers
                commonData={commonData}
                members={members}
                onInputChange={(query: string) => searchUsers(query)}
                users={users}
                showTeamRoles={true}
                onUpdateRoleMember={updateMemberRole}
                onInviteNewUser={inviteNewUser}
                onRemoveUser={removeUser}
              />

              <UnpureDeleteChannelDropdown commonData={commonData} hasPermissionDeleteChannel={hasPermissionDeleteChannel} captchaIsEnabled={captchaIsEnabled} />

              {commonData?.user && <PureNewReportPopover commonData={commonData} captchaIsEnabled={captchaIsEnabled} />}
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
          onFiltersChange={(query: string) => getReports(1, query)}
          searchUser={searchUser}
          user={commonData.user}
        />
        {requestingReports && (
          <div className="text-center">
            <PureSpinner size={12} />
          </div>
        )}
        {!requestingReports &&
          (reportsResponse && reportsResponse.data.results && reportsResponse.data.results.length > 0 ? (
            <React.Fragment>
              <div>
                <ul role="list" className="space-y-4">
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
                </ul>
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
            <p>No reports found</p>
          ))}
      </div>
      {commonData.user && (
        <div className="w-1/6">
          <ActivityFeedComponent activityFeed={activityFeed} hasMore={hasMore} getMore={getMoreActivityFeed} />
        </div>
      )}
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
