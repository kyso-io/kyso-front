import PureReportFilter from '@/components/PureReportFilter';
import checkPermissions from '@/helpers/check-permissions';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { useReports } from '@/hooks/use-reports';
import UnpureReportBadge from '@/unpure-components/UnpureReportBadge';
import type { NormalizedResponseDTO, OrganizationMember, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import { TeamMembershipOriginEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import ChannelList from '../../../components/ChannelList';
import ManageUsers from '../../../components/ManageUsers';
import PureNewReportPopover from '../../../components/PureNewReportPopover';
import { getLocalStorageItem } from '../../../helpers/get-local-storage-item';
import KysoApplicationLayout from '../../../layouts/KysoApplicationLayout';
import type { Member } from '../../../types/member';

const tags = ['plotly', 'multiqc', 'python', 'data-science', 'rstudio', 'genetics', 'physics'];
const token: string | null = getLocalStorageItem('jwt');

const pushQueryString = (router: NextRouter, newValue: object) => {
  let query: { tags?: string | string[]; search?: string; sort?: string } = {};
  if (router.query.tags) {
    query.tags = router.query.tags;
  }
  if (router.query.search) {
    query.search = router.query.search as string;
  }
  if (router.query.sort) {
    query.sort = router.query.sort as string;
  }

  query = {
    ...query,
    ...newValue,
  };

  router.push({
    pathname: `/${router.query.organizationName}/${router.query.teamName}`,
    query,
  });
};

const Index = () => {
  const router = useRouter();
  useRedirectIfNoJWT();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });

  const reports: ReportDTO[] | undefined = useReports({
    teamId: commonData.team?.id,
    perPage: router.query.per_page as string,
    page: router.query.page as string,
    search: router.query.search as string,
    sort: router.query.sort as string,
    tags: router.query.tags as string[],
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);

  const hasPermissionGlobalPinReport = useMemo(() => checkPermissions(commonData, 'KYSO_IO_REPORT_GLOBAL_PIN'), [commonData]);

  useEffect(() => {
    if (!commonData.team) {
      return;
    }
    getTeamMembers();
  }, [commonData?.team]);

  const sortOptions = [
    { name: 'Recently published', value: '-created_at' },
    { name: 'Recently updated', value: '-updated_at' },
  ];

  let activeFilters = [];
  if (router.query.search) {
    activeFilters.push(`${router.query.search}`);
  }
  if (router.query.tags) {
    if (Array.isArray(router.query.tags)) {
      activeFilters = activeFilters.concat(router.query.tags);
    } else {
      activeFilters.push(router.query.tags);
    }
  }

  let currentPage = 1;
  if (router.query.page && router.query.page.length > 0) {
    currentPage = parseInt(router.query.page as string, 10);
  }

  let reportsPerPage = 20;
  if (router.query.per_page && router.query.per_page.length > 0) {
    reportsPerPage = parseInt(router.query.per_page as string, 10);
  }

  let enabledNextPage = false;
  if (reports && reports.length === reportsPerPage) {
    enabledNextPage = true;
  }

  let extraParamsUrl = '';
  if (router.query.search && router.query.search.length > 0) {
    extraParamsUrl += `&search=${router.query.search}`;
  }
  if (router.query.sort && router.query.sort.length > 0) {
    extraParamsUrl += `&sort=${router.query.sort}`;
  }
  if (router.query.tags && router.query.tags.length > 0) {
    extraParamsUrl += `&tags=${router.query.tags}`;
  }

  if (router.query.per_page && router.query.per_page.length > 0) {
    extraParamsUrl += `&per_page=${router.query.per_page}`;
  }

  // START TEAM MEMBERS

  const getTeamMembers = async () => {
    let m: Member[] = [];
    try {
      const api: Api = new Api(token, commonData.organization.sluglified_name);
      const resultOrgMembers: NormalizedResponseDTO<OrganizationMember[]> = await api.getOrganizationMembers(commonData.organization!.id!);
      m = resultOrgMembers.data.map((organizationMember: OrganizationMember) => ({
        id: organizationMember.id,
        nickname: organizationMember.nickname,
        username: organizationMember.username,
        avatar_url: organizationMember.avatar_url,
        email: organizationMember.email,
        organization_roles: organizationMember.organization_roles,
        team_roles: [],
        membership_origin: TeamMembershipOriginEnum.ORGANIZATION,
      }));

      api.setTeamSlug(commonData.team!.sluglified_name);
      const resultTeamMembers: NormalizedResponseDTO<TeamMember[]> = await api.getTeamMembers(commonData.team!.id!);
      resultTeamMembers.data.forEach((teamMember: TeamMember) => {
        const member: Member | undefined = m.find((mem: Member) => mem.id === teamMember.id);
        if (member) {
          member.team_roles = teamMember.team_roles;
          member.membership_origin = TeamMembershipOriginEnum.TEAM;
        } else {
          m.push({
            id: teamMember.id,
            nickname: teamMember.nickname,
            username: teamMember.username,
            avatar_url: teamMember.avatar_url,
            email: teamMember.email,
            organization_roles: [],
            team_roles: teamMember.team_roles,
            membership_origin: TeamMembershipOriginEnum.TEAM,
          });
        }
      });

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
    let ms: Member[] = [...members];
    const index: number = ms.findIndex((m: Member) => m.id === userId);
    if (index === -1) {
      try {
        const api: Api = new Api(token, commonData.organization.sluglified_name);
        const result: NormalizedResponseDTO<OrganizationMember[]> = await api.addUserToOrganization({
          organizationId: commonData.organization.id!,
          userId,
          role: organizationRole,
        });
        ms = result.data.map((organizationMember: OrganizationMember) => ({
          id: organizationMember.id,
          nickname: organizationMember.nickname,
          username: organizationMember.username,
          avatar_url: organizationMember.avatar_url,
          email: organizationMember.email,
          organization_roles: organizationMember.organization_roles,
          team_roles: [],
          membership_origin: TeamMembershipOriginEnum.ORGANIZATION,
        }));
      } catch (e) {
        console.error(e);
      }
    } else {
      if (!ms[index]!.organization_roles.includes(organizationRole)) {
        try {
          const api: Api = new Api(token, commonData.organization.sluglified_name);
          const result: NormalizedResponseDTO<OrganizationMember[]> = await api.updateOrganizationMemberRoles(commonData.organization!.id!, {
            members: [
              {
                userId,
                role: organizationRole,
              },
            ],
          });
          ms = result.data.map((organizationMember: OrganizationMember) => ({
            id: organizationMember.id,
            nickname: organizationMember.nickname,
            username: organizationMember.username,
            avatar_url: organizationMember.avatar_url,
            email: organizationMember.email,
            organization_roles: organizationMember.organization_roles,
            team_roles: [],
            membership_origin: TeamMembershipOriginEnum.ORGANIZATION,
          }));
        } catch (e) {
          console.error(e);
        }
      }
      if (teamRole && !ms[index]!.team_roles.includes(teamRole)) {
        try {
          const api: Api = new Api(token, commonData.organization.sluglified_name, commonData.team.sluglified_name);
          const result: NormalizedResponseDTO<TeamMember[]> = await api.updateTeamMemberRoles(commonData.team!.id!, {
            members: [
              {
                userId,
                role: teamRole,
              },
            ],
          });
          result.data.forEach((teamMember: TeamMember) => {
            const member: Member | undefined = ms.find((mem: Member) => mem.id === teamMember.id);
            if (member) {
              member.team_roles = teamMember.team_roles;
              member.membership_origin = TeamMembershipOriginEnum.TEAM;
            } else {
              ms.push({
                id: teamMember.id,
                nickname: teamMember.nickname,
                username: teamMember.username,
                avatar_url: teamMember.avatar_url,
                email: teamMember.email,
                organization_roles: [],
                team_roles: teamMember.team_roles,
                membership_origin: TeamMembershipOriginEnum.TEAM,
              });
            }
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
    setMembers(ms);
  };

  const inviteNewUser = async (email: string, organizationRole: string): Promise<void> => {
    try {
      const api: Api = new Api(token, commonData.organization.sluglified_name);
      const result: NormalizedResponseDTO<{ organizationMembers: OrganizationMember[]; teamMembers: TeamMember[] }> = await api.inviteNewUser({
        email,
        organizationSlug: commonData.organization.sluglified_name,
        organizationRole,
      });
      const ms: Member[] = result.data.organizationMembers.map((organizationMember: OrganizationMember) => ({
        id: organizationMember.id,
        nickname: organizationMember.nickname,
        username: organizationMember.username,
        avatar_url: organizationMember.avatar_url,
        email: organizationMember.email,
        organization_roles: organizationMember.organization_roles,
        team_roles: [],
        membership_origin: TeamMembershipOriginEnum.ORGANIZATION,
      }));
      setMembers(ms);
    } catch (e) {
      console.error(e);
    }
  };
  // END TEAM MEMBERS

  return (
    <div className="flex flex-row space-x-8">
      <div className="w-2/12">
        <ChannelList basePath={router.basePath} commonData={commonData} />
      </div>
      <div className="w-8/12 flex flex-col space-y-8">
        {commonData.team && (
          <div className="flex flex-row w-full justify-between space-x-2">
            <div className="w-4/6 flex flex-col justify-between">
              <div className="text-xl font-medium">{commonData.team.display_name}</div>
              <div className="text-md">{commonData.team.bio}</div>
              <div className="mt-2">
                <ManageUsers
                  members={members}
                  onInputChange={(query: string) => searchUsers(query)}
                  users={users}
                  showTeamRoles={true}
                  onUpdateRoleMember={updateMemberRole}
                  onInviteNewUser={inviteNewUser}
                />
              </div>
            </div>
            <div className="w-2/6 flex flex-row justify-end items-center space-x-2">
              <PureNewReportPopover commonData={commonData} />
            </div>
          </div>
        )}

        <PureReportFilter
          defaultSearch={(router.query.search as string) || null}
          sortOptions={sortOptions}
          tags={tags}
          activeFilters={activeFilters}
          onSetSearch={(search: string) => {
            pushQueryString(router, { search });
          }}
          onSetTags={(newTags: string[]) => {
            pushQueryString(router, { tags: newTags });
          }}
          onSetSort={(sort: string) => {
            pushQueryString(router, { sort });
          }}
          currentSort={router.query.sort as string}
          onClear={() => {
            router.push({
              pathname: `/${router.query.organizationName}/${router.query.teamName}`,
              query: null,
            });
          }}
        />

        <div>
          <ul role="list" className="space-y-4">
            {reports?.map((report) => (
              <UnpureReportBadge key={report.id} report={report} commonData={commonData} hasPermissionGlobalPinReport={hasPermissionGlobalPinReport} />
            ))}
          </ul>
        </div>

        <div className="flex-1 flex justify-center">
          {!(currentPage - 1 < 1) && (
            <a
              href={currentPage - 1 < 1 ? '#' : `?page=${currentPage - 1}${extraParamsUrl}`}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </a>
          )}

          {enabledNextPage && <p className="px-6 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">Page {currentPage}</p>}

          {enabledNextPage && (
            <a
              href={enabledNextPage ? `?page=${currentPage + 1}${extraParamsUrl}` : '#'}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
