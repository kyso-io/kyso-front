/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint no-empty: "off" */
import ChannelList from '@/components/ChannelList';
import Pagination from '@/components/Pagination';
import PureAvatar from '@/components/PureAvatar';
import PureNewReportPopover from '@/components/PureNewReportPopover';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import { XCircleIcon } from '@heroicons/react/solid';
import type { ActivityFeed, NormalizedResponseDTO, OrganizationInfoDto, OrganizationMember, PaginatedResponseDto, ReportDTO, ResourcePermissions, UserDTO } from '@kyso-io/kyso-model';
import {
  AddUserOrganizationDto,
  GlobalPermissionsEnum,
  InviteUserDto,
  KysoSettingsEnum,
  OrganizationPermissionsEnum,
  ReportPermissionsEnum,
  TeamMembershipOriginEnum,
  UpdateOrganizationMembersDTO,
  UserRoleDTO,
} from '@kyso-io/kyso-model';
// @ts-ignore
import ReadMoreReact from 'read-more-react';
import { Api } from '@kyso-io/kyso-store';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ActivityFeedComponent from '../../components/ActivityFeed';
import InfoActivity from '../../components/InfoActivity';
import ManageUsers from '../../components/ManageUsers';
import ReportBadge from '../../components/ReportBadge';
import { HelperPermissions } from '../../helpers/check-permissions';
import { checkReportAuthors } from '../../helpers/check-report-authors';
import { Helper } from '../../helpers/Helper';
import { useInterval } from '../../hooks/use-interval';
import type { PaginationParams } from '../../interfaces/pagination-params';
import type { KeyValue } from '../../model/key-value.model';
import type { CommonData } from '../../types/common-data';
import type { Member } from '../../types/member';
import UnpureDeleteOrganizationDropdown from '../../unpure-components/UnpureDeleteOrganizationDropdown';

const DAYS_ACTIVITY_FEED: number = 14;
const MAX_ACTIVITY_FEED_ITEMS: number = 15;
const ACTIVITY_FEED_POOLING_MS: number = 30 * 1000; // 30 seconds

interface Props {
  commonData: CommonData;
  setUser: (user: UserDTO) => void;
}

const Index = ({ commonData, setUser }: Props) => {
  const router = useRouter();
  const { join, organizationName } = router.query;
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
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);
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
    const getData = async () => {
      try {
        const publicKeys: KeyValue[] = await Helper.getKysoPublicSettings();
        const indexHcaptchaEnabled: number = publicKeys.findIndex((keyValue: KeyValue) => keyValue.key === KysoSettingsEnum.HCAPTCHA_ENABLED);
        if (indexHcaptchaEnabled !== -1) {
          setCaptchaIsEnabled(publicKeys[indexHcaptchaEnabled]!.value === 'true');
        }
        const indexShowEmail: number = publicKeys.findIndex((keyValue: KeyValue) => keyValue.key === KysoSettingsEnum.GLOBAL_PRIVACY_SHOW_EMAIL);
        if (indexShowEmail !== -1) {
          setShowEmails(publicKeys[indexShowEmail]!.value === 'true');
        }
      } catch (errorHttp: any) {
        Helper.logError(errorHttp.response.data, errorHttp);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (!commonData.permissions || !commonData.permissions.organizations || !organizationName) {
      return;
    }
    // A user is trying to access the organization page with an invitation link
    if (join) {
      // The user is...
      if (!commonData.token) {
        // Unauthorized, redirect to SignUp page
        window.location.href = `/signup?invitation=/${organizationName}?join=${join as string}`;
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
          window.location.href = `/${organizationName}`;
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
        window.location.href = '/';
      } else {
        router.replace(`/login?redirect=${encodeURIComponent(`/${router.query.organizationName as string}`)}`);
      }
    }
  }, [commonData?.permissions?.organizations, organizationName, join]);

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
      checkReportAuthors(result);
      setPaginatedResponseDto(result.data);
    } catch (e) {}
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

  const updateMemberRole = async (userId: string, organizationRole: string): Promise<void> => {
    const index: number = members.findIndex((m: Member) => m.id === userId);
    if (index === -1) {
      try {
        const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
        const addUserOrganizationDto: AddUserOrganizationDto = new AddUserOrganizationDto(commonData!.organization!.id!, userId, organizationRole);
        await api.addUserToOrganization(addUserOrganizationDto);
      } catch (e) {
        Helper.logError('Unexpected error', e);
      }
    } else if (!members[index]!.organization_roles.includes(organizationRole)) {
      try {
        const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
        const userRoleDTO: UserRoleDTO = new UserRoleDTO(userId, organizationRole);
        const updateOrganizationMembersDTO: UpdateOrganizationMembersDTO = new UpdateOrganizationMembersDTO([userRoleDTO]);
        await api.updateOrganizationMemberRoles(commonData!.organization!.id!, updateOrganizationMembersDTO);
      } catch (e) {
        Helper.logError('Unexpected error', e);
      }
    }
    getOrganizationMembers();
  };

  const inviteNewUser = async (email: string, organizationRole: string): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
      const inviteUserDto: InviteUserDto = new InviteUserDto(email, commonData!.organization!.sluglified_name, organizationRole);
      await api.inviteNewUser(inviteUserDto);
      getOrganizationMembers();
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
  };

  const removeUser = async (userId: string, type: TeamMembershipOriginEnum): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      if (type === TeamMembershipOriginEnum.ORGANIZATION) {
        await api.removeUserFromOrganization(commonData!.organization!.id!, userId);
      } else {
        await api.deleteUserFromTeam(commonData.team!.id!, userId);
      }
      getOrganizationMembers();
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
  };

  // END ORGANIZATION MEMBERS

  const onCaptchaSuccess = async () => {
    const api: Api = new Api(commonData.token);
    const result: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
    setUser(result.data);
  };

  if (commonData.errorOrganization) {
    return <div className="text-center mt-4">{commonData.errorOrganization}</div>;
  }

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="hidden md:block w-1/6">
        <ChannelList basePath={router.basePath} commonData={commonData} />
      </div>
      <div className="w-4/6">
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
                  captchaIsEnabled={captchaIsEnabled}
                  onCaptchaSuccess={onCaptchaSuccess}
                  showEmails={showEmails}
                />
                {hasPermissionDeleteOrganization && <UnpureDeleteOrganizationDropdown commonData={commonData} captchaIsEnabled={captchaIsEnabled} setUser={setUser} />}
                {commonData?.user && hasPermissionCreateReport && <PureNewReportPopover commonData={commonData} captchaIsEnabled={captchaIsEnabled} setUser={setUser} />}
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
