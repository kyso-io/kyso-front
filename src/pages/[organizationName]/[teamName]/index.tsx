import checkPermissions from '@/helpers/check-permissions';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import UnpureDeleteChannelDropdown from '@/unpure-components/UnpureDeleteChannelDropdown';
import type { ActivityFeed, NormalizedResponseDTO, OrganizationMember, PaginatedResponseDto, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import ActivityFeedComponent from '../../../components/ActivityFeed';
import ChannelList from '../../../components/ChannelList';
import ManageUsers from '../../../components/ManageUsers';
import PureNewReportPopover from '../../../components/PureNewReportPopover';
import ReportBadge from '../../../components/ReportBadge';
import ReportsSearchBar from '../../../components/ReportsSearchBar';
import { getLocalStorageItem } from '../../../helpers/get-local-storage-item';
import KysoApplicationLayout from '../../../layouts/KysoApplicationLayout';
import type { Member } from '../../../types/member';

const token: string | null = getLocalStorageItem('jwt');
const LIMIT_REPORTS = 10;
const DAYS_ACTIVITY_FEED: number = 14;
const MAX_ACTIVITY_FEED_ITEMS: number = 15;

const Index = () => {
  const router = useRouter();
  useRedirectIfNoJWT();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });
  // MEMBERS
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  // REPORTS
  const [reportsResponse, setReportsResponse] = useState<NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> | null>(null);
  // ACTIVITY FEED
  const [datetimeActivityFeed, setDatetimeActivityFeed] = useState<Date>(new Date());
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activityFeed, setActivityFeed] = useState<NormalizedResponseDTO<ActivityFeed[]> | null>(null);
  // PERMISSIONS
  const hasPermissionDeleteChannel = useMemo(() => checkPermissions(commonData, 'KYSO_IO_DELETE_TEAM'), [commonData]);

  useEffect(() => {
    if (!commonData.team || !commonData.user) {
      return;
    }
    getTeamMembers();
  }, [commonData?.team, commonData?.user]);

  useEffect(() => {
    if (!commonData.organization || !commonData.team) {
      return;
    }
    getReports(1);
  }, [commonData?.organization, commonData?.team]);

  useEffect(() => {
    if (!commonData.organization || !commonData.team) {
      return;
    }
    getActivityFeed();
  }, [commonData?.organization, commonData?.team, datetimeActivityFeed]);

  const getReports = async (page: number, queryParams?: string) => {
    try {
      const api: Api = new Api(token, commonData.organization.sluglified_name, commonData.team.sluglified_name);
      let query = `team_id=${commonData.team.id}&skip=${(page - 1) * LIMIT_REPORTS}&limit=${LIMIT_REPORTS}`;
      if (queryParams) {
        query += `&${queryParams}`;
      }
      const result: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> = await api.getPaginatedReports(query);
      setReportsResponse(result);
    } catch (e) {
      console.error(e);
    }
  };

  // START TEAM MEMBERS

  const getTeamMembers = async () => {
    const m: Member[] = [];
    try {
      const api: Api = new Api(token, commonData.organization.sluglified_name);
      const resultOrgMembers: NormalizedResponseDTO<OrganizationMember[]> = await api.getOrganizationMembers(commonData.organization!.id!);
      let userMember: Member | null = null;
      resultOrgMembers.data.forEach((organizationMember: OrganizationMember) => {
        if (organizationMember.id === commonData.user.id) {
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
          userMember.team_roles = teamMember.team_roles;
          userMember.membership_origin = teamMember.membership_origin;
        } else if (member) {
          member.team_roles = teamMember.team_roles;
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
            team_roles: teamMember.team_roles,
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
      const api: Api = new Api(token, commonData.organization.sluglified_name);
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
        const api: Api = new Api(token, commonData.organization.sluglified_name);
        await api.addUserToOrganization({
          organizationId: commonData.organization.id!,
          userId,
          role: organizationRole,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      if (!members[index]!.organization_roles.includes(organizationRole)) {
        try {
          const api: Api = new Api(token, commonData.organization.sluglified_name);
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
          const api: Api = new Api(token, commonData.organization.sluglified_name, commonData.team.sluglified_name);
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
      const api: Api = new Api(token, commonData.organization.sluglified_name);
      await api.inviteNewUser({
        email,
        organizationSlug: commonData.organization.sluglified_name,
        organizationRole,
      });
      getTeamMembers();
    } catch (e) {
      console.error(e);
    }
  };

  const removeUser = async (userId: string): Promise<void> => {
    try {
      const api: Api = new Api(token, commonData.organization.sluglified_name, commonData.team.sluglified_name);
      await api.deleteUserFromTeam(commonData.team.id!, userId);
      getTeamMembers();
    } catch (e) {
      console.error(e);
    }
  };

  // END TEAM MEMBERS

  // START REPORT ACTIONS

  const toggleUserStarReport = async (reportId: string) => {
    try {
      const api: Api = new Api(token, commonData.organization.sluglified_name, commonData.team.sluglified_name);
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleUserStarReport(reportId);
      const { data: report } = result;
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

  const toggleUserPinReport = async (reportId: string) => {
    try {
      const api: Api = new Api(token, commonData.organization.sluglified_name, commonData.team.sluglified_name);
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleUserPinReport(reportId);
      const { data: report } = result;
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

  const toggleGlobalPinReport = async (reportId: string) => {
    try {
      const api: Api = new Api(token, commonData.organization.sluglified_name, commonData.team.sluglified_name);
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleGlobalPinReport(reportId);
      const { data: report } = result;
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
    if (!token) {
      return;
    }
    try {
      const api: Api = new Api(token, commonData.organization.sluglified_name, commonData.team.sluglified_name);
      const startDatetime: Date = moment(datetimeActivityFeed).add(-DAYS_ACTIVITY_FEED, 'day').toDate();
      const result: NormalizedResponseDTO<ActivityFeed[]> = await api.getTeamActivityFeed(commonData.organization.sluglified_name, commonData.team.sluglified_name, {
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

  return (
    <div className="flex flex-row space-x-8">
      <div className="w-1/6">
        <ChannelList basePath={router.basePath} commonData={commonData} />
      </div>
      <div className="w-4/6 flex flex-col space-y-8">
        {commonData.team && (
          <div className="flex flex-row w-full justify-between space-x-2">
            <div className="w-4/6 flex flex-col justify-between">
              <div className="text-xl font-medium">{commonData.team.display_name}</div>
              <div className="text-md">{commonData.team.bio}</div>
            </div>
            <div className="w-2/6 flex flex-row justify-end items-center space-x-2">
              <ManageUsers
                members={members}
                onInputChange={(query: string) => searchUsers(query)}
                users={users}
                showTeamRoles={true}
                onUpdateRoleMember={updateMemberRole}
                onInviteNewUser={inviteNewUser}
                onRemoveUser={removeUser}
              />

              <UnpureDeleteChannelDropdown commonData={commonData} hasPermissionDeleteChannel={hasPermissionDeleteChannel} />

              <PureNewReportPopover commonData={commonData} />
            </div>
          </div>
        )}

        <ReportsSearchBar members={members} onSaveSearch={() => {}} onFiltersChange={(query: string) => getReports(1, query)} />

        {reportsResponse && reportsResponse.data.results && reportsResponse.data.results.length > 0 ? (
          <React.Fragment>
            <div>
              <ul role="list" className="space-y-4">
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
        )}
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
