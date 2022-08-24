/* eslint no-empty: "off" */
import ChannelList from '@/components/ChannelList';
import Pagination from '@/components/Pagination';
import PureAvatar from '@/components/PureAvatar';
import PureNewReportPopover from '@/components/PureNewReportPopover';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { ActivityFeed, NormalizedResponseDTO, OrganizationInfoDto, OrganizationMember, PaginatedResponseDto, ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import ActivityFeedComponent from '../../components/ActivityFeed';
import InfoActivity from '../../components/InfoActivity';
import ManageUsers from '../../components/ManageUsers';
import PureSideOverlayPanel from '../../components/PureSideOverlayPanel';
import ReportBadge from '../../components/ReportBadge';
import { useInterval } from '../../hooks/use-interval';
import type { CommonData } from '../../types/common-data';
import type { Member } from '../../types/member';

const DAYS_ACTIVITY_FEED: number = 14;
const MAX_ACTIVITY_FEED_ITEMS: number = 15;
const ACTIVITY_FEED_POOLING_MS: number = 30 * 1000; // 30 seconds

interface PaginationParams {
  page: number;
  limit: number;
  sort: string;
}

interface Props {
  commonData: CommonData;
}

const Index = ({ commonData }: Props) => {
  const router = useRouter();
  const [paginatedResponseDto, setPaginatedResponseDto] = useState<PaginatedResponseDto<ReportDTO> | null>(null);
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfoDto | null>(null);
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    sort: '-created_at',
  });
  const [datetimeActivityFeed, setDatetimeActivityFeed] = useState<Date>(new Date());
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activityFeed, setActivityFeed] = useState<NormalizedResponseDTO<ActivityFeed[]> | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);

  useEffect(() => {
    if (commonData !== null && commonData.token === null && commonData.organization === null && !commonData.errorOrganization) {
      // An unautenticated user is trying to access an organization that does not have public teams
      router.replace('/');
    }
  }, [commonData]);

  useEffect(() => {
    if (!commonData.organization) {
      return;
    }
    getReports();
  }, [commonData.organization, paginationParams]);

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

  const getReports = async () => {
    try {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> = await api.getOrganizationReports(
        commonData.organization!.sluglified_name,
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
          if (result.relations?.user[authorId]) {
            allAuthorsData.push(result.relations.user[authorId]);
          }
        }
        x.authors = allAuthorsData;
        dataWithAuthors.push(x);
      }
      result.data.results = dataWithAuthors;
      setPaginatedResponseDto(result.data);
    } catch (e) {}
  };

  const getOrganizationsInfo = async () => {
    try {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<OrganizationInfoDto[]> = await api.getOrganizationsInfo(commonData!.organization!.id);
      if (result?.data?.length > 0) {
        setOrganizationInfo(result.data[0]!);
      }
    } catch (e) {}
  };

  const toggleUserStarReport = async (reportId: string) => {
    const api: Api = new Api(commonData.token);
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

  const toggleUserPinReport = async (reportId: string) => {
    const api: Api = new Api(commonData.token);
    try {
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleUserPinReport(reportId);
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

  const toggleGlobalPinReport = async (reportId: string) => {
    const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name);
    try {
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleGlobalPinReport(reportId);
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
      console.log(e);
    }
  };

  const updateMemberRole = async (userId: string, organizationRole: string): Promise<void> => {
    const index: number = members.findIndex((m: Member) => m.id === userId);
    if (index === -1) {
      try {
        const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
        await api.addUserToOrganization({
          organizationId: commonData!.organization!.id!,
          userId,
          role: organizationRole,
        });
      } catch (e) {
        console.error(e);
      }
    } else if (!members[index]!.organization_roles.includes(organizationRole)) {
      try {
        const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
        await api.updateOrganizationMemberRoles(commonData!.organization!.id!, {
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
    getOrganizationMembers();
  };

  const inviteNewUser = async (email: string, organizationRole: string): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
      await api.inviteNewUser({
        email,
        organizationSlug: commonData!.organization!.sluglified_name,
        organizationRole,
      });
      getOrganizationMembers();
    } catch (e) {
      console.error(e);
    }
  };

  const removeUser = async (userId: string): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
      await api.removeUserFromOrganization(commonData!.organization!.id!, userId);
      getOrganizationMembers();
    } catch (e) {
      console.error(e);
    }
  };

  // END ORGANIZATION MEMBERS

  if (commonData.errorOrganization) {
    return <div className="text-center mt-4">{commonData.errorOrganization}</div>;
  }

  return (
    <div className="flex flex-row space-x-8 p-2">
      <PureSideOverlayPanel key="teams-list" cacheKey="teams-list">
        <ChannelList basePath={router.basePath} commonData={commonData} />
      </PureSideOverlayPanel>
      <div className="w-4/6">
        <div className="flex items-center w justify-between p-2">
          <div className="shrink-0 flex flex-row items-center space-x-2">
            <PureAvatar src={commonData.organization?.avatar_url || ''} title={commonData.organization?.display_name || ''} size={TailwindHeightSizeEnum.H12} textSize={TailwindFontSizeEnum.XL} />
            <h1 className="text-2xl font-bold text-gray-900">{commonData.organization?.display_name}</h1>
            <p className="text-sm font-medium text-gray-500">{commonData.organization?.bio}</p>
          </div>
          <div className="flex items-center space-x-2">
            <ManageUsers
              commonData={commonData}
              members={members}
              onInputChange={(query: string) => searchUsers(query)}
              users={users}
              showTeamRoles={false}
              onUpdateRoleMember={updateMemberRole}
              onInviteNewUser={inviteNewUser}
              onRemoveUser={removeUser}
            />
            {commonData?.user && <PureNewReportPopover commonData={commonData} />}
          </div>
        </div>
        {organizationInfo && (
          <div className="flex items-center justify-between p-2">
            <div className="mb-10">
              <InfoActivity info={organizationInfo} />
            </div>
          </div>
        )}
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
                toggleUserStarReport={() => toggleUserStarReport(report.id!)}
                toggleUserPinReport={() => toggleUserPinReport(report.id!)}
                toggleGlobalPinReport={() => toggleGlobalPinReport(report.id!)}
              />
            ))}
        </div>
        {paginatedResponseDto && paginatedResponseDto.totalPages > 1 && (
          <div className="pt-10">
            <Pagination page={paginatedResponseDto.currentPage} numPages={paginatedResponseDto.totalPages} onPageChange={(page: number) => setPaginationParams({ ...paginationParams, page })} />
          </div>
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
