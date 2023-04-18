/* eslint-disable @typescript-eslint/no-explicit-any */
import ManageUsers from '@/components/ManageUsers';
import PureReportHeader from '@/components/PureReportHeader';
import PureSideOverlayPanel from '@/components/PureSideOverlayPanel';
import PureTree from '@/components/PureTree';
import TableOfContents from '@/components/TableOfContents';
import { Helper } from '@/helpers/Helper';
import { HelperPermissions } from '@/helpers/check-permissions';
import classNames from '@/helpers/class-names';
import { getReport } from '@/helpers/get-report';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import type { Version } from '@/hooks/use-versions';
import { useVersions } from '@/hooks/use-versions';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import type { KeyValue } from '@/model/key-value.model';
import type { CommonData } from '@/types/common-data';
import type { Member } from '@/types/member';
import type { ReportData } from '@/types/report-data';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
import type { GithubFileHash, InlineCommentDto, KysoSetting, NormalizedResponseDTO, OrganizationMember, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import {
  AddUserOrganizationDto,
  InviteUserDto,
  KysoSettingsEnum,
  ReportPermissionsEnum,
  TeamMembershipOriginEnum,
  UpdateOrganizationMembersDTO,
  UpdateTeamMembersDTO,
  UserRoleDTO,
  InlineCommentStatusEnum,
} from '@kyso-io/kyso-model';
import { Api, toggleUserStarReportAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { dirname } from 'path';
import React, { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { ToasterIcons } from '@/enums/toaster-icons';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import clsx from 'clsx';
import 'react-tooltip/dist/react-tooltip.css';
import Pagination from '../../../../components/Pagination';
import TagInlineComment from '../../../../components/inline-comments/components/tag-inline-comment';

enum Tab {
  Files = 'files',
  Toc = 'toc',
}

enum TabsListView {
  Open = 'open',
  Closed = 'closed',
}

const LIMIT = 10;

const Index = ({ commonData, reportData, setReportData, showToaster, isCurrentUserSolvedCaptcha, isCurrentUserVerified }: IKysoApplicationLayoutProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [result, setResult] = useState<NormalizedResponseDTO<InlineCommentDto[]> | null>(null);
  const [requesting, setRequesting] = useState<boolean>(true);
  const [selectedTabListView, setSelectedTabListView] = useState<TabsListView>(TabsListView.Open);
  const [page, setPage] = useState<number>(1);

  // START DATA REPORT
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Toc);
  const [selfTree, setSelfTree] = useState<GithubFileHash[]>([]);
  const [parentTree, setParentTree] = useState<GithubFileHash[]>([]);
  const version = router.query.version ? (router.query.version as string) : undefined;
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showEmails, setShowEmails] = useState<boolean>(false);
  const frontEndUrl = useAppSelector((s) => {
    const settings = s.kysoSettings?.publicSettings?.filter((x: KysoSetting) => x.key === KysoSettingsEnum.BASE_URL);
    if (settings && settings.length > 0) {
      return settings[0].value;
    }
    // Emergency case to just don't return undefined
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  });
  const versions: Version[] = useVersions({
    report: reportData?.report ? reportData.report : null,
    commonData,
  });
  const random: string = uuidv4();
  const hasPermissionEditReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.EDIT), [commonData, random]);
  const hasPermissionDeleteReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.DELETE), [commonData, random]);
  const hasPermissionEditReportOnlyMine: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.EDIT_ONLY_MINE), [commonData, random]);
  // END DATA REPORT

  const inlineCommentDtos: InlineCommentDto[] = useMemo(() => {
    if (!result) {
      return [];
    }
    return result.data.filter((x: InlineCommentDto) => {
      if (selectedTabListView === TabsListView.Open) {
        return x.current_status === InlineCommentStatusEnum.OPEN || x.current_status === InlineCommentStatusEnum.TO_DO || x.current_status === InlineCommentStatusEnum.DOING;
      }
      return x.current_status === InlineCommentStatusEnum.CLOSED;
    });
  }, [result, selectedTabListView]);

  const paginatedInlineCommentDtos: InlineCommentDto[] = useMemo(() => {
    if (inlineCommentDtos.length === 0) {
      return [];
    }
    const start: number = (page - 1) * LIMIT;
    const end: number = start + LIMIT;
    return inlineCommentDtos.slice(start, end);
  }, [inlineCommentDtos, page]);

  const numPages: number = useMemo(() => {
    if (inlineCommentDtos.length === 0) {
      return 0;
    }
    return Math.ceil(inlineCommentDtos.length / LIMIT);
  }, [inlineCommentDtos]);

  useEffect(() => {
    if (!commonData.permissions || !commonData.permissions.organizations || !commonData.permissions.teams || !router.query.organizationName || !router.query.teamName) {
      return;
    }
    if (!HelperPermissions.belongsToOrganization(commonData, router.query.organizationName as string)) {
      if (commonData.token) {
        // If have a token, I want to show a "You have no permission" page. Because if I redirect directly the user
        // don't know what the hell happened
        // router.replace('/');
      } else {
        router.replace(`/login?redirect=${encodeURIComponent(`/${router.query.organizationName as string}/${router.query.teamName as string}/${router.query.reportName as string}`)}`);
      }
      return;
    }
    if (!HelperPermissions.belongsToTeam(commonData, router.query.organizationName as string, router.query.teamName as string)) {
      if (commonData.token) {
        // If have a token, I want to show a "You have no permission" page. Because if I redirect directly the user
        // don't know what the hell happened
        // router.replace(`/${router.query.organizationName as string}`);
      } else {
        router.replace(`/login?redirect=${encodeURIComponent(`/${router.query.organizationName as string}/${router.query.teamName as string}/${router.query.reportName as string}`)}`);
      }
    }
  }, [commonData?.permissions?.organizations, commonData?.permissions?.teams, router.query?.organizationName, router.query?.teamName]);

  useEffect(() => {
    if (!reportData || !reportData.report || !reportData.report.id) {
      return;
    }
    const getReportInlineComments = async () => {
      try {
        const api: Api = new Api(commonData.token);
        const response: NormalizedResponseDTO<InlineCommentDto[]> = await api.getInlineComments(reportData.report!.id!);
        setResult(response);
      } catch (e) {}
      setRequesting(false);
    };
    getReportInlineComments();
  }, [commonData, reportData]);

  useEffect(() => {
    const getData = async () => {
      try {
        const publicKeys: KeyValue[] = await Helper.getKysoPublicSettings();
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
    if (reportData?.report && reportData.report.toc && reportData.report.toc.length > 0) {
      setSelectedTab(Tab.Toc);
    } else {
      setSelectedTab(Tab.Files);
    }
  }, [reportData?.report]);

  useEffect(() => {
    if (!reportData || !reportData.report) {
      return;
    }
    const getData = async () => {
      let path = '';
      if (router.query.path) {
        if (Array.isArray(router.query.path)) {
          path = (router.query.path as string[]).join('/') || '';
        } else {
          path = (router.query.path as string) || '';
        }
      }
      const t: GithubFileHash[] = await getTree({
        path,
        version: undefined,
        report: reportData.report,
        commonData,
      });
      setSelfTree(t);
      const pt: GithubFileHash[] = await getTree({
        path: dirname(path),
        version: undefined,
        report: reportData.report,
        commonData,
      });
      setParentTree(pt);
    };
    getData();
  }, [reportData?.report?.id, router.query.path]);

  useEffect(() => {
    if (!commonData.team) {
      return;
    }
    getTeamMembers();
  }, [commonData?.team, commonData?.user]);

  const tabs: { title: string; tab: Tab }[] = useMemo(() => {
    const data: { title: string; tab: Tab }[] = [
      {
        title: 'Files',
        tab: Tab.Files,
      },
    ];
    if (reportData?.report && reportData.report.toc && reportData.report.toc.length > 0) {
      data.splice(0, 0, {
        title: 'Index',
        tab: Tab.Toc,
      });
    }
    return data;
  }, [reportData?.report]);

  const getTree = async (args: { path: string; report: ReportDTO | null | undefined; version?: string; commonData: CommonData }): Promise<GithubFileHash[]> => {
    const { report, version: v, commonData: cd } = args;
    let { path } = args;
    if (!report || !commonData) {
      return [];
    }
    if (path === null) {
      path = '';
    } else if (path === '.') {
      path = '';
    }
    interface ArgType {
      reportId: string;
      filePath: string;
      version?: number;
    }
    const argsType: ArgType = {
      reportId: report!.id as string,
      filePath: (path as string) || '',
    };
    if (v && !Number.isNaN(v)) {
      argsType.version = parseInt(v as string, 10);
    }
    const api: Api = new Api(commonData.token, cd.organization?.sluglified_name, cd.team?.sluglified_name);
    const r: NormalizedResponseDTO<GithubFileHash | GithubFileHash[]> = await api.getReportFileTree(argsType);
    let tr = [r.data];
    if (r.data && Array.isArray(r.data)) {
      tr = [...r.data].sort((ta, tb) => {
        return Number(ta.type > tb.type);
      });
    }
    return tr as GithubFileHash[];
  };

  const refreshReport = async () => {
    let versionNum: number = 0;
    if (version && !Number.isNaN(version as any)) {
      versionNum = parseInt(version as string, 10);
    }
    const rd: ReportData = await getReport({ token: commonData.token, team: commonData.team, reportName: router.query.reportName as string, version: versionNum });
    setReportData(rd);
  };

  const searchUsers = async (query: string): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const r: NormalizedResponseDTO<UserDTO[]> = await api.getUsers({
        userIds: [],
        page: 1,
        per_page: 1000,
        sort: '',
        search: query,
      });
      setUsers(r.data);
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
  };

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
          userMember.team_roles = teamMember.team_roles;
          userMember.membership_origin = teamMember.membership_origin;
        } else if (member) {
          member.team_roles = teamMember.team_roles;
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
      Helper.logError('Unexpected error', e);
    }
  };

  const updateMemberRole = async (userId: string, organizationRole: string, teamRole?: string): Promise<void> => {
    const index: number = members.findIndex((m: Member) => m.id === userId);
    if (index === -1) {
      try {
        const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
        const addUserOrganizationDto: AddUserOrganizationDto = new AddUserOrganizationDto(commonData.organization!.id!, userId, organizationRole);
        await api.addUserToOrganization(addUserOrganizationDto);

        showToaster('User invited successfully', ToasterIcons.SUCCESS);
      } catch (e) {
        showToaster('We are sorry! Something happened updating the role of this member. Please try again.', ToasterIcons.SUCCESS);
        Helper.logError('Unexpected error', e);
      }
    } else {
      if (!members[index]!.organization_roles.includes(organizationRole)) {
        try {
          const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
          const userRoleDTO: UserRoleDTO = new UserRoleDTO(userId, organizationRole);
          const updateOrganizationMembersDTO: UpdateOrganizationMembersDTO = new UpdateOrganizationMembersDTO([userRoleDTO]);
          await api.updateOrganizationMemberRoles(commonData.organization!.id!, updateOrganizationMembersDTO);
        } catch (e) {
          Helper.logError('Unexpected error', e);
        }
      }
      if (teamRole && !members[index]!.team_roles.includes(teamRole)) {
        try {
          const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
          const userRoleDTO: UserRoleDTO = new UserRoleDTO(userId, teamRole);
          const updateTeamMembersDTO: UpdateTeamMembersDTO = new UpdateTeamMembersDTO([userRoleDTO]);
          await api.updateTeamMemberRoles(commonData.team!.id!, updateTeamMembersDTO);
        } catch (e) {
          Helper.logError('Unexpected error', e);
        }
      }
    }
    getTeamMembers();
  };

  const inviteNewUser = async (email: string, organizationRole: string): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const inviteUserDto: InviteUserDto = new InviteUserDto(email, organizationRole, organizationRole);
      await api.inviteNewUser(inviteUserDto);
      getTeamMembers();

      showToaster('User invited successfully', ToasterIcons.SUCCESS);
    } catch (e) {
      showToaster('We are sorry! Something happened inviting an user. Please try again.', ToasterIcons.ERROR);
      Helper.logError('Unexpected error', e);
    }
  };

  const removeUser = async (userId: string, type: TeamMembershipOriginEnum): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      if (type === TeamMembershipOriginEnum.ORGANIZATION) {
        await api.removeUserFromOrganization(commonData!.organization!.id!, userId);
      } else {
        api.setTeamSlug(commonData.team!.sluglified_name);
        await api.deleteUserFromTeam(commonData.team!.id!, userId);
      }
      getTeamMembers();
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
  };

  if (requesting) {
    return (
      <div className="flex flex-col h-screen justify-center items-center">
        <div className="text-center">
          <div role="status">
            <svg aria-hidden="true" className="inline w-14 h-14 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const report = reportData?.report;
  const reportUrl = `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`;
  const authors = reportData ? reportData.authors : [];
  if (!report) {
    return null;
  }

  return (
    <React.Fragment>
      <div className={classNames('hidden lg:block z-0 fixed lg:flex lg:flex-col h-full overflow--auto top-0 border-r ', sidebarOpen ? 'bg-gray-50 top-0 ' : 'bg-white')}>
        <div className="flex flex-1 flex-col pt-32 mt-2">
          <nav className="flex-1 space-y-1">
            <PureSideOverlayPanel key={report?.name} cacheKey={report?.name} setSidebarOpen={(p) => setSidebarOpen(p)}>
              <React.Fragment>
                {report && (
                  <React.Fragment>
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((element: { title: string; tab: Tab }) => (
                          <a
                            key={element.tab}
                            onClick={() => setSelectedTab(element.tab)}
                            className={classNames(
                              element.tab === selectedTab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer',
                            )}
                          >
                            {element.title}
                          </a>
                        ))}
                      </nav>
                    </div>
                    <div className="py-2">
                      {selectedTab === Tab.Toc && <TableOfContents title="" toc={report.toc} collapsible={true} openInNewTab={false} />}
                      {selectedTab === Tab.Files && (
                        <PureTree path={''} basePath={router.basePath} commonData={commonData} report={report} version={router.query.version as string} selfTree={selfTree} parentTree={parentTree} />
                      )}
                    </div>
                  </React.Fragment>
                )}
              </React.Fragment>
            </PureSideOverlayPanel>
          </nav>
        </div>
      </div>
      <div className={classNames('flex flex-1 flex-col', sidebarOpen ? 'pl-64' : 'lg:pl-10')}>
        <main>
          <div className="w-full px-4 sm:px-6 md:px-10">
            {/* HEADER */}
            <div className="w-full flex lg:flex-col flex-col justify-between rounded">
              <div className="w-full p-4">
                <PureReportHeader
                  reportUrl={`${reportUrl}`}
                  frontEndUrl={frontEndUrl}
                  versions={versions}
                  fileToRender={null}
                  report={report}
                  authors={authors}
                  version={undefined}
                  onUpvoteReport={async () => {
                    await dispatch(toggleUserStarReportAction(report.id as string));
                    refreshReport();
                  }}
                  hasPermissionEditReport={hasPermissionEditReport || (report.author_ids.includes(commonData.user?.id as string) && hasPermissionEditReportOnlyMine)}
                  hasPermissionDeleteReport={hasPermissionDeleteReport}
                  commonData={commonData}
                  onSetFileAsMainFile={() => {}}
                  isCurrentUserSolvedCaptcha={isCurrentUserSolvedCaptcha}
                  isCurrentUserVerified={isCurrentUserVerified}
                  showToaster={showToaster}
                >
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
                </PureReportHeader>
              </div>
            </div>
            {/* TODO */}
            {!result ? (
              <div className="py-4 px-8">
                <h1 className="text-3xl font-bold text-gray-900 my-4">Tasks</h1>
                <div className="bg-yellow-50 p-4" style={{ width: '50%' }}>
                  <div className="flex">
                    <div className="shrink-0">
                      <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">There is no data available for this report yet.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 px-8 border-y">
                <h1 className="text-3xl font-bold text-gray-900 my-4">{selectedTabListView === TabsListView.Open ? 'Ongoing tasks' : 'Finished tasks'}</h1>
                <div className="hidden sm:block">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                      {[TabsListView.Open, TabsListView.Closed].map((tab: TabsListView) => (
                        <span
                          key={tab}
                          onClick={() => setSelectedTabListView(tab)}
                          className={clsx(
                            'cursor-pointer',
                            tab === selectedTabListView ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                            'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                          )}
                          aria-current={tab === selectedTabListView ? 'page' : undefined}
                        >
                          {Helper.ucFirst(tab)}
                        </span>
                      ))}
                    </nav>
                  </div>
                </div>
                <div className="overflow-hidden bg-white shadow sm:rounded-md my-4">
                  <ul role="list" className="divide-y divide-gray-200">
                    {paginatedInlineCommentDtos.map((inlineCommentDto: InlineCommentDto) => {
                      const participants: { [key: string]: boolean } = {
                        [inlineCommentDto.user_id]: true,
                      };
                      inlineCommentDto.inline_comments.forEach((inlineComment: InlineCommentDto) => {
                        participants[inlineComment.user_id] = true;
                      });
                      return (
                        <li key={inlineCommentDto.id}>
                          <a href="#" className="block hover:bg-gray-50">
                            <div className="p-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <p className="truncate text-sm font-medium text-indigo-600">{inlineCommentDto.text}</p>
                                <div className="ml-2 flex shrink-0">
                                  <TagInlineComment status={inlineCommentDto.current_status} />
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                      />
                                    </svg>
                                    {Object.keys(participants).length} participans
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:ml-6 sm:mt-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                                      />
                                    </svg>
                                    {inlineCommentDto.inline_comments.length} answers
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:ml-6 sm:mt-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                                      />
                                    </svg>
                                    {inlineCommentDto.status_history.length - 1} status changes
                                  </p>
                                  {/* <p className="mt-2 flex items-center text-sm text-gray-500 sm:ml-6 sm:mt-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                                      />
                                    </svg>
                                    {inlineCommentDto.cell_id} - {inlineCommentDto.report_id} source
                                  </p> */}
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                                    />
                                  </svg>
                                  <p>{moment(inlineCommentDto.created_at).fromNow()}</p>
                                </div>
                              </div>
                            </div>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {numPages > 1 && <Pagination numPages={numPages} onPageChange={(p: number) => setPage(p)} page={page} />}
              </div>
            )}
          </div>
        </main>
      </div>
    </React.Fragment>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
