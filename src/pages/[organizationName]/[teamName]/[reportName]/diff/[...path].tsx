/* eslint-disable @typescript-eslint/no-explicit-any */
import Loader from '@/components/Loader';
import ManageUsers from '@/components/ManageUsers';
import PureReportHeader from '@/components/PureReportHeader';
import PureSideOverlayPanel from '@/components/PureSideOverlayPanel';
import PureTree from '@/components/PureTree';
import TableOfContents from '@/components/TableOfContents';
import { ToasterIcons } from '@/enums/toaster-icons';
import { Helper } from '@/helpers/Helper';
import { HelperPermissions } from '@/helpers/check-permissions';
import { getReport } from '@/helpers/get-report';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { usePublicSetting } from '@/hooks/use-public-setting';
import type { Version } from '@/hooks/use-versions';
import { useVersions } from '@/hooks/use-versions';
import type { HttpExceptionDto } from '@/interfaces/http-exception.dto';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { Member } from '@/types/member';
import type { ReportData } from '@/types/report-data';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
import type { File, GithubFileHash, File as KysoFile, KysoSetting, NormalizedResponseDTO, OrganizationMember, TeamMember, TeamMembershipOriginEnum, UserDTO } from '@kyso-io/kyso-model';
import { KysoSettingsEnum, ReportPermissionsEnum } from '@kyso-io/kyso-model';
import { Api, toggleUserStarReportAction } from '@kyso-io/kyso-store';
import type { AxiosError } from 'axios';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

enum Tab {
  Files = 'files',
  Toc = 'toc',
}

const Index = ({ commonData, reportData, setReportData, showToaster, isCurrentUserSolvedCaptcha, isCurrentUserVerified, hideToaster }: IKysoApplicationLayoutProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { path } = router.query;
  const [sourceFileId, setSourceFileId] = useState<string>('');
  const [targetFileId, setTargetFileId] = useState<string>('');
  const [fileVersions, setFileVersions] = useState<File[]>([]);
  const [showIframe, setShowIframe] = useState<boolean>(false);
  const [loadingIframe, setLoadingIframe] = useState<boolean>(false);
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [httpExceptionDto, setHttpExceptionDto] = useState<HttpExceptionDto | null>(null);
  const fileName: string = useMemo(() => {
    if (Array.isArray(router.query.path)) {
      return (router.query.path as string[]).join('/') || '';
    }
    return (router.query.path as string) || '';
  }, [path]);

  const globalPrivacyShowEmailStr: any | null = usePublicSetting(KysoSettingsEnum.GLOBAL_PRIVACY_SHOW_EMAIL);
  const [showEmails, setShowEmails] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Files);
  const [users, setUsers] = useState<UserDTO[]>([]);
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
  const [selfTree, setSelfTree] = useState<GithubFileHash[]>([]);
  const [reportFiles, setReportFiles] = useState<KysoFile[]>([]);
  const version: string | string[] | undefined = router.query.version ? (router.query.version as string | string[]) : undefined;
  const random: string = uuidv4();
  const hasPermissionEditReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.EDIT), [commonData, random]);
  const hasPermissionDeleteReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.DELETE), [commonData, random]);
  const hasPermissionEditReportOnlyMine: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.EDIT_ONLY_MINE), [commonData, random]);
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

  useEffect(() => {
    if (!globalPrivacyShowEmailStr) {
      return;
    }
    setShowEmails(globalPrivacyShowEmailStr === 'true');
  }, [globalPrivacyShowEmailStr]);

  useEffect(() => {
    if (!commonData.team) {
      return;
    }
    getTeamMembers();
  }, [commonData?.team, commonData?.user]);

  useEffect(() => {
    if (!reportData || !reportData.report || !commonData || !commonData.organization || !commonData.team) {
      return;
    }
    const getReportFiles = async () => {
      try {
        const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);
        const r: NormalizedResponseDTO<KysoFile[]> = await api.getReportFiles(reportData.report!.id!, version ? parseInt(version as string, 10) : undefined);
        setReportFiles(r.data);
      } catch (e) {
        Helper.logError('Unexpected error getting report files', e);
      }
    };
    getReportFiles();
  }, [reportData?.report?.id, commonData?.organization, commonData?.team]);

  useEffect(() => {
    if (reportFiles.length === 0) {
      return;
    }
    const st: GithubFileHash[] = Helper.getReportTree(reportFiles, path);
    setSelfTree(st);
  }, [path, reportFiles]);

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

  const refreshReport = async () => {
    const versionNum: number = 0;
    const rd: ReportData = await getReport({ token: commonData.token, team: commonData.team, reportName: router.query.reportName as string, version: versionNum });
    setReportData(rd);
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
    // Reloading of data is too fast, to retrieve the right value we need to wait a bit
    setTimeout(() => {
      getTeamMembers();
    }, 500);
  };

  const inviteNewUser = async (_email: string, _organizationRole: string): Promise<void> => {
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

  useEffect(() => {
    if (!commonData || !reportData || !fileName) {
      return;
    }
    getFileVersions();
  }, [commonData, reportData, fileName]);

  const getFileVersions = async () => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);
      const response: NormalizedResponseDTO<File[]> = await api.getFileVersions(reportData!.report!.id!, fileName);
      const fs: File[] = response.data;
      if (fs.length === 0) {
        return;
      }
      fs.sort((a: File, b: File) => b.version - a.version);
      setFileVersions(fs);
    } catch (e: any) {
      const axiosError: AxiosError = e;
      if (axiosError.response?.data) {
        setHttpExceptionDto(axiosError.response.data);
      }
    }
  };

  if (!commonData && !reportData && !fileName) {
    return <Loader />;
  }

  const report = reportData?.report;
  const reportUrl = `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`;
  const authors = reportData ? reportData.authors : [];
  if (!report) {
    return null;
  }

  return (
    <div>
      <div className={clsx('hidden z-0 fixed lg:flex lg:flex-col h-full overflow--auto top-0 border-r ', sidebarOpen ? 'bg-gray-50 top-0 ' : 'bg-white')}>
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
                            className={clsx(
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
                        <PureTree path={''} basePath={router.basePath} commonData={commonData} report={report} version={router.query.version as string} selfTree={selfTree} reportFiles={reportFiles} />
                      )}
                    </div>
                  </React.Fragment>
                )}
              </React.Fragment>
            </PureSideOverlayPanel>
          </nav>
        </div>
      </div>

      <div className={clsx('flex flex-1 flex-col', sidebarOpen ? 'pl-64' : 'lg:pl-16')}>
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

        {/* ERROR */}
        {httpExceptionDto ? (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                {/* <h3 className="text-sm font-medium text-yellow-800">Attention needed</h3> */}
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{httpExceptionDto.message}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full px-4 sm:px-6 md:px-10">
            {/* SELECTS */}
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm-col-span-3">
                <label htmlFor="source" className="block text-sm font-medium leading-6 text-gray-900">
                  Source
                </label>
                <select
                  value={sourceFileId}
                  onChange={(e) => setSourceFileId(e.target.value)}
                  id="source"
                  name="source"
                  className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Select a version</option>
                  {fileVersions.map((fileVersion: File) => (
                    <option key={fileVersion.id} value={fileVersion.id!}>
                      Version #{fileVersion.version}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm-col-span-3">
                <label htmlFor="target" className="block text-sm font-medium leading-6 text-gray-900">
                  Target
                </label>
                <select
                  value={targetFileId}
                  onChange={(e) => setTargetFileId(e.target.value)}
                  id="target"
                  name="target"
                  className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Select a version</option>
                  {fileVersions.map((fileVersion: File) => (
                    <option key={fileVersion.id} value={fileVersion.id!}>
                      Version #{fileVersion.version}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm-col-span-3">
                <div className="mt-8 flex items-end gap-x-6">
                  <button
                    type="button"
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      setSourceFileId(targetFileId);
                      setTargetFileId(sourceFileId);
                    }}
                  >
                    Swap versions
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!sourceFileId) {
                        showToaster('Please select a source version', ToasterIcons.ERROR);
                        return;
                      }
                      if (!targetFileId) {
                        showToaster('Please select a target version', ToasterIcons.ERROR);
                        return;
                      }
                      hideToaster();
                      setShowIframe(false);
                      setLoadingIframe(false);
                      setIframeUrl('');
                      setTimeout(() => {
                        // RELATIVE URL, requires jupyter-diff component to be properly deployed
                        // NOTE: dont remove the / before the ?, needed for react routing
                        setIframeUrl(`/kyjupdiff/?token=${commonData.token}&reportId=${reportData.report!.id}&sourceFileId=${sourceFileId}&targetFileId=${targetFileId}`);
                        setShowIframe(true);
                        setLoadingIframe(true);
                      }, 0);
                    }}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Compare
                  </button>
                </div>
              </div>
            </div>
            {/* IFRAME */}
            {loadingIframe && <Loader />}
            {showIframe && (
              <div className="mt-6">
                <iframe onLoad={() => setLoadingIframe(false)} src={iframeUrl} className="w-full h-screen" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
