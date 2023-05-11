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
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { KeyValue } from '@/model/key-value.model';
import type { CommonData } from '@/types/common-data';
import type { Member } from '@/types/member';
import type { ReportData } from '@/types/report-data';
import { ExclamationCircleIcon, TagIcon } from '@heroicons/react/solid';
import type {
  GithubFileHash,
  InlineCommentDto,
  InlineCommentStatusEnum,
  InlineCommentStatusHistoryDto,
  KysoSetting,
  NormalizedResponseDTO,
  OrganizationMember,
  ReportDTO,
  TeamMember,
  User,
  UserDTO,
  TeamMembershipOriginEnum,
} from '@kyso-io/kyso-model';
import { CreateInlineCommentDto, InlineCommentPermissionsEnum, KysoSettingsEnum, ReportPermissionsEnum, UpdateInlineCommentDto } from '@kyso-io/kyso-model';
import { Api, toggleUserStarReportAction } from '@kyso-io/kyso-store';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { dirname } from 'path';
import React, { useEffect, useMemo, useState } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import { v4 as uuidv4 } from 'uuid';
import PureAvatar from '../../../../../components/PureAvatar';
import PureInlineComments from '../../../../../components/inline-comments/components/pure-inline-comments';
import TagInlineComment from '../../../../../components/inline-comments/components/tag-inline-comment';
import { useChannelMembers } from '../../../../../hooks/use-channel-members';
import type { HttpExceptionDto } from '../../../../../interfaces/http-exception.dto';
import { TailwindFontSizeEnum } from '../../../../../tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '../../../../../tailwind/enum/tailwind-height.enum';

enum Tab {
  Files = 'files',
  Toc = 'toc',
}

const Index = ({ commonData, reportData, setReportData, showToaster, isCurrentUserSolvedCaptcha, isCurrentUserVerified }: IKysoApplicationLayoutProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [result, setResult] = useState<NormalizedResponseDTO<InlineCommentDto> | null>(null);
  const [requesting, setRequesting] = useState<boolean>(true);
  const { inlineCommentId } = router.query;
  const channelMembers: TeamMember[] = useChannelMembers({ commonData });
  const random: string = uuidv4();
  const hasPermissionCreateInlineComment: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, InlineCommentPermissionsEnum.CREATE), [commonData, random]);
  const hasPermissionDeleteInlineComment: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, InlineCommentPermissionsEnum.DELETE), [commonData, random]);
  const [httpExceptionDto, setHttpExceptionDto] = useState<HttpExceptionDto | null>(null);

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
  const hasPermissionEditReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.EDIT), [commonData, random]);
  const hasPermissionDeleteReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.DELETE), [commonData, random]);
  const hasPermissionEditReportOnlyMine: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.EDIT_ONLY_MINE), [commonData, random]);
  // END DATA REPORT

  const getInlineComment = async () => {
    try {
      const api: Api = new Api(commonData.token);
      const r: NormalizedResponseDTO<InlineCommentDto> = await api.getInlineComment(inlineCommentId as string);
      setResult(r);
    } catch (e: any) {
      const hedto: HttpExceptionDto = e.response.data;
      setHttpExceptionDto(hedto);
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    if (!commonData || !inlineCommentId) {
      return;
    }
    getInlineComment();
  }, [commonData, inlineCommentId]);

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

  const updateMemberRole = async (_userId: string, _organizationRole: string, _teamRole?: string): Promise<void> => {
    getTeamMembers();
  };

  const inviteNewUser = async (_email: string, _organizationRole: string): Promise<void> => {
    getTeamMembers();
  };

  const removeUser = async (_userId: string, _type: TeamMembershipOriginEnum): Promise<void> => {
    getTeamMembers();
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

  const createInlineComment = async (user_ids: string[], text: string, parent_id: string | null) => {
    if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
      return;
    }
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      const createInlineCommentDto: CreateInlineCommentDto = new CreateInlineCommentDto(result!.data.report_id, result!.data.file_id, result!.data.cell_id, text, user_ids, parent_id);
      await api.createInlineComment(createInlineCommentDto);
      await getInlineComment();
    } catch (e) {}
  };

  const updateInlineComment = async (id: string, user_ids: string[], text: string, status: InlineCommentStatusEnum) => {
    if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
      return;
    }
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      const updateInlineCommentDto: UpdateInlineCommentDto = new UpdateInlineCommentDto(result!.data.file_id, text, user_ids, status);
      await api.updateInlineComment(id, updateInlineCommentDto);
      await getInlineComment();
    } catch (e) {}
  };

  const deleteInlineComment = async (id: string) => {
    if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
      return;
    }
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      await api.deleteInlineComment(id);
      if (result!.data.id === id) {
        router.replace(`/${router.query.organizationName}/${router.query.teamName}/${router.query.reportName}/tasks`);
        return;
      }
      await getInlineComment();
    } catch (e) {}
  };

  const report = reportData?.report;
  const reportUrl = `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`;
  const authors = reportData ? reportData.authors : [];
  if (!report) {
    return null;
  }

  return (
    <div className="tasks">
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
            {/* TASKS */}
            {!result ? (
              <div className="py-4 px-8">
                <h1 className="text-3xl font-bold text-gray-900 my-4">Tasks</h1>
                {httpExceptionDto && (
                  <div className="bg-yellow-50 p-4" style={{ width: '50%' }}>
                    <div className="flex">
                      <div className="shrink-0">
                        <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">{httpExceptionDto.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 px-8 border-y">
                <div className="grid grid-cols-12">
                  <div className="col-span-8 pr-20">
                    <div className="flex flex-col content-center my-3">
                      <h1 className="text-3xl font-bold text-gray-900 my-4 grow">Task dashboard</h1>
                      <PureInlineComments
                        commonData={commonData}
                        report={report}
                        channelMembers={channelMembers}
                        hasPermissionCreateComment={hasPermissionCreateInlineComment}
                        hasPermissionDeleteComment={hasPermissionDeleteInlineComment}
                        comments={[result.data]}
                        createInlineComment={(user_ids: string[], text: string, parent_id: string | null) => createInlineComment(user_ids, text, parent_id)}
                        updateInlineComment={updateInlineComment}
                        deleteComment={deleteInlineComment}
                        showTitle={false}
                        showCreateNewComment={false}
                        isLastVersion={true}
                      />
                    </div>
                  </div>
                  <div className="col-span-4 pl-20">
                    <div className="flex flex-col content-center my-3">
                      <h1 className="text-3xl font-bold text-gray-900 my-4 grow">Status history</h1>
                      <div className="flow-root">
                        <ul role="list" className="-mb-8">
                          {result.data.status_history.reverse().map((inlineStatusHistory: InlineCommentStatusHistoryDto, index: number) => {
                            const user: User | null = result.relations!.user[inlineStatusHistory.user_id] ?? null;
                            if (!user) {
                              return null;
                            }
                            if (index === 0) {
                              return (
                                <React.Fragment key={0}>
                                  <li>
                                    <div className="relative pb-8">
                                      <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                      <div className="relative flex items-start space-x-3">
                                        <div className="relative px-1">
                                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                                            <TagIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                                          </div>
                                        </div>
                                        <div className="min-w-0 flex-1 py-0">
                                          <div className="text-sm leading-8 text-gray-500">
                                            <span className="mr-0.5">
                                              <a className="font-medium text-gray-900">Discussion started</a> at version
                                            </span>
                                            {inlineStatusHistory.report_version !== null && (
                                              <span className="mx-1">
                                                <span className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs text-gray-900 ring-1 ring-inset ring-gray-200 font-bold">
                                                  {inlineStatusHistory.report_version}
                                                </span>
                                              </span>
                                            )}
                                            <span className="whitespace-nowrap">{moment(inlineStatusHistory.date).fromNow()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                  <li>
                                    <div className="relative pb-8">
                                      {result.data.status_history.length >= 2 && <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />}
                                      <div className="relative flex items-start space-x-3">
                                        <div className="relative">
                                          <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H10} textSize={TailwindFontSizeEnum.XS} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div>
                                            <div className="text-sm">
                                              <Link href="" className="font-medium text-gray-900">
                                                {user.display_name}
                                              </Link>
                                            </div>
                                            <p className="mt-0.5 text-sm text-gray-500">Created the first comment {moment(inlineStatusHistory.date).fromNow()}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                </React.Fragment>
                              );
                            }
                            return (
                              <li key={index}>
                                <div className="relative pb-8">
                                  {index < result.data.status_history.length - 1 ? <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
                                  <div className="relative flex items-start space-x-3">
                                    <div className="relative">
                                      <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H10} textSize={TailwindFontSizeEnum.XS} />
                                      <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px"></span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div>
                                        <div className="text-sm">
                                          <Link href="" className="font-medium text-gray-900">
                                            {user.display_name}
                                          </Link>
                                        </div>
                                        <p className="mt-0.5 text-sm text-gray-500">
                                          Changed status to <TagInlineComment status={inlineStatusHistory.to_status} /> {moment(inlineStatusHistory.date).fromNow()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
