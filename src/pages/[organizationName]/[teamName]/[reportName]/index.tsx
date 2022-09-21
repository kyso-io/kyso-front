/* eslint-disable @typescript-eslint/no-explicit-any */
import PureEditMetadata from '@/components/PureEditMetadata';
import { CommentPermissionsEnum, GithubFileHash, InlineCommentPermissionsEnum, KysoSettingsEnum, ReportPermissionsEnum, TeamMembershipOriginEnum, TeamVisibilityEnum } from '@kyso-io/kyso-model';
import moment from 'moment';
import { useRouter } from 'next/router';
import { dirname } from 'path';
import { useEffect, useMemo, useState } from 'react';

import type { Comment, KysoSetting, NormalizedResponseDTO, OrganizationMember, ReportDTO, TeamMember, User, UserDTO } from '@kyso-io/kyso-model';
import { Api, createCommentAction, deleteCommentAction, fetchReportCommentsAction, toggleUserStarReportAction, updateCommentAction } from '@kyso-io/kyso-store';

import classNames from '@/helpers/class-names';

import ManageUsers from '@/components/ManageUsers';
import PureComments from '@/components/PureComments';
import { PurePermissionDenied } from '@/components/PurePermissionDenied';
import PureReportHeader from '@/components/PureReportHeader';
import PureSideOverlayPanel from '@/components/PureSideOverlayPanel';
import PureTree from '@/components/PureTree';
import checkPermissions from '@/helpers/check-permissions';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { useChannelMembers } from '@/hooks/use-channel-members';
import type { FileToRender } from '@/hooks/use-file-to-render';
import { isImage } from '@/hooks/use-file-to-render';
import { useUserEntities } from '@/hooks/use-user-entities';
import type { Version } from '@/hooks/use-versions';
import { useVersions } from '@/hooks/use-versions';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import type { Member } from '@/types/member';
import type { ReportData } from '@/types/report-data';
import UnpureReportRender from '@/unpure-components/UnpureReportRender';
import { getReport } from '../../../../helpers/get-report';

interface Props {
  commonData: CommonData;
  setReportData: (data: ReportData | null) => void;
  reportData: ReportData | null;
}

const Index = ({ commonData, reportData, setReportData }: Props) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // const [reportData, setReportData] = useState<{ report: ReportDTO | null; authors: UserDTO[] } | null>(null);
  const [selfTree, setSelfTree] = useState<GithubFileHash[]>([]);
  const [parentTree, setParentTree] = useState<GithubFileHash[]>([]);
  const [fileToRender, setFileToRender] = useState<FileToRender | null>(null);
  const version = router.query.version ? (router.query.version as string) : undefined;
  const versions: Version[] = useVersions({
    report: reportData?.report ? reportData.report : null,
    commonData,
  });
  const channelMembers: TeamMember[] = useChannelMembers({ commonData });
  const allComments = useAppSelector((state) => state.comments.entities);
  const userEntities: User[] = useUserEntities();
  const onlyVisibleCell = router.query.cell ? (router.query.cell as string) : undefined;
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOpenMetadata, openMetadata] = useState(false);
  // useEffect(() => {
  //   if (commonData.team && router.query.reportName) {
  //     refreshReport();
  //   }
  // }, [commonData?.team, router.query?.reportName]);
  useEffect(() => {
    if (!reportData || !reportData.report) {
      return;
    }
    const getData = async () => {
      const t: GithubFileHash[] = await getTree({
        path: currentPath,
        version,
        report: reportData.report,
        commonData,
      });
      setSelfTree(t);
      const pt: GithubFileHash[] = await getTree({
        path: dirname(currentPath),
        version,
        report: reportData.report,
        commonData,
      });
      setParentTree(pt);
    };
    getData();
  }, [reportData?.report?.id, router.query.path]);

  const refreshReport = async () => {
    let versionNum: number = 0;
    if (version && !Number.isNaN(version as any)) {
      versionNum = parseInt(version as string, 10);
    }
    const rd: ReportData = await getReport({ commonData, reportName: router.query.reportName as string, version: versionNum });
    setReportData(rd);
  };

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
    const result: NormalizedResponseDTO<GithubFileHash | GithubFileHash[]> = await api.getReportFileTree(argsType);
    let tr = [result.data];
    if (result.data && Array.isArray(result.data)) {
      tr = [...result.data].sort((ta, tb) => {
        return Number(ta.type > tb.type);
      });
    }
    return tr as GithubFileHash[];
  };

  let currentPath = '';
  if (router.query.path) {
    if (Array.isArray(router.query.path)) {
      currentPath = (router.query.path as string[]).join('/') || '';
    } else {
      currentPath = (router.query.path as string) || '';
    }
  }

  useEffect(() => {
    if (!reportData || !reportData.report || !selfTree) {
      return;
    }

    const getData = async () => {
      const mainFile = currentPath === '' ? reportData.report!.main_file : undefined;
      const validFiles: GithubFileHash[] = selfTree.filter((item: GithubFileHash) => item.type === 'file');
      const allowedPaths = [currentPath, mainFile];

      const defaultRenderFiles: string[] = [
        'Readme.md',
        'readme.md',
        'index.md',
        'index.html',
        'index.ipynb',
        'index.pptx',
        'index.docx',
        'index.xlsx',
        'index.doc',
        'index.ppt',
        'index.xsl',
        'index.txt',
        'index.pdf',
      ];

      let validFile: GithubFileHash | undefined;

      if (mainFile) {
        validFile = new GithubFileHash(reportData.report?.main_file_id!, 'file', mainFile, '', '', reportData.report?.main_file_path_scs!, reportData.report?.main_file_version!);
      } else {
        validFile = validFiles?.find((item: GithubFileHash) => {
          return allowedPaths.includes(item.path);
        });

        if (!validFile) {
          // Check the defaults
          validFile = validFiles?.find((item: GithubFileHash) => {
            return defaultRenderFiles.includes(item.path);
          });
        }
      }

      try {
        let ftr: FileToRender | null = null;

        if (validFile) {
          ftr = {
            path: validFile!.path,
            id: validFile!.id,
            path_scs: validFile!.path_scs,
            percentLoaded: 0,
            isLoading: !validFile!.path.endsWith('.html'),
            content: null,
          };
        }
        setFileToRender(ftr);
        if (ftr && !ftr.path.endsWith('.html')) {
          setFileToRender({ ...ftr, isLoading: true });
          const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);
          const data: Buffer = await api.getReportFileContent(ftr.id, {
            onDownloadProgress(progressEvent) {
              if (progressEvent.lengthComputable) {
                const percentLoaded = progressEvent.loaded / progressEvent.total;
                setFileToRender({ ...(ftr as FileToRender), percentLoaded });
              } else {
                setFileToRender({ ...(ftr as FileToRender), percentLoaded: (fileToRender?.percentLoaded as number) + 1 });
              }
            },
          });
          let content = null;
          if (data && isImage(ftr.path)) {
            content = Buffer.from(data).toString('base64');
          } else if (data) {
            content = Buffer.from(data).toString('utf-8');
          }
          setFileToRender({ ...ftr, content, isLoading: false });
        }
      } catch (e) {
        // error fetching file
      }
    };
    getData();
  }, [selfTree]);

  useEffect(() => {
    if (commonData) {
      if (commonData.token === null && commonData.organization === null && !commonData.errorOrganization) {
        // An unautenticated user is trying to access an organization that does not have public teams
        router.replace('/');
        return;
      }
      if (commonData.token === null && commonData.organization && commonData.team && commonData.team.visibility !== TeamVisibilityEnum.PUBLIC) {
        // An unautenticated user is trying to access a non public team
        router.replace(`/${commonData.organization.sluglified_name}`);
        return;
      }
      if (commonData.organization && commonData.team == null) {
        // Autenticated user is trying to access a non public team
        router.replace(`/${commonData.organization.sluglified_name}`);
      }
    }
  }, [commonData]);

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

  useEffect(() => {
    if (!commonData.team) {
      return;
    }
    getTeamMembers();
  }, [commonData?.team, commonData?.user]);
  // END TEAM MEMBERS

  useEffect(() => {
    if (reportData?.report?.id) {
      dispatch(
        fetchReportCommentsAction({
          reportId: reportData.report.id as string,
          sort: '-created_at',
        }),
      );
    }
  }, [reportData?.report?.id]);

  // TODO -> confusion as to whether these are Conmment or CommentDTO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitComment = async (newComment: any, parentComment: any) => {
    if (parentComment && parentComment.id) {
      await dispatch(updateCommentAction({ commentId: parentComment.id, comment: newComment }));
    } else {
      await dispatch(createCommentAction(newComment));
    }

    if (reportData?.report) {
      await dispatch(
        fetchReportCommentsAction({
          reportId: reportData.report.id as string,
          sort: '-created_at',
        }),
      );
    }
  };

  const frontEndUrl = useAppSelector((s) => {
    const settings = s.kysoSettings?.publicSettings?.filter((x: KysoSetting) => x.key === KysoSettingsEnum.BASE_URL);
    if (settings && settings.length > 0) {
      return settings[0].value;
    }

    // Emergency case to just don't return undefined
    if (window) {
      return window.location.origin;
    }

    return '';
  });

  const hasPermissionCreateComment = useMemo(() => checkPermissions(commonData, CommentPermissionsEnum.CREATE), [commonData]);
  const hasPermissionReadComment = useMemo(() => checkPermissions(commonData, CommentPermissionsEnum.READ), [commonData]);
  const hasPermissionDeleteComment = useMemo(() => checkPermissions(commonData, CommentPermissionsEnum.DELETE), [commonData]);
  const hasPermissionReadReport = useMemo(() => (commonData.team?.visibility === TeamVisibilityEnum.PUBLIC ? true : checkPermissions(commonData, ReportPermissionsEnum.READ)), [commonData]);
  const hasPermissionDeleteReport = useMemo(() => checkPermissions(commonData, ReportPermissionsEnum.DELETE), [commonData]);
  const hasPermissionEditReport = useMemo(() => checkPermissions(commonData, ReportPermissionsEnum.EDIT), [commonData]);
  const hasPermissionEditReportOnlyMine = useMemo(() => checkPermissions(commonData, ReportPermissionsEnum.EDIT_ONLY_MINE), [commonData]);
  const hasPermissionCreateInlineComment = useMemo(() => checkPermissions(commonData, InlineCommentPermissionsEnum.CREATE), [commonData]);
  const hasPermissionEditInlineComment = useMemo(() => checkPermissions(commonData, InlineCommentPermissionsEnum.EDIT), [commonData]);
  const hasPermissionDeleteInlineComment = useMemo(() => checkPermissions(commonData, InlineCommentPermissionsEnum.DELETE), [commonData]);

  if (commonData.errorOrganization) {
    return <div className="text-center mt-4">{commonData.errorOrganization}</div>;
  }

  if (commonData.errorTeam) {
    return <div className="text-center mt-4">{commonData.errorTeam}</div>;
  }

  if (!reportData) {
    return null;
  }

  if (reportData.errorReport) {
    return <div className="text-center mt-4">{reportData.errorReport}</div>;
  }

  const { report, authors } = reportData;

  if (report && commonData && !hasPermissionReadReport) {
    return <PurePermissionDenied />;
  }

  const reportUrl = `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`;

  return (
    <div>
      {report && (
        <PureEditMetadata
          isOpen={isOpenMetadata}
          setOpen={() => openMetadata(!isOpenMetadata)}
          report={report}
          commonData={commonData}
          members={members}
          onInputChange={(query: string) => searchUsers(query)}
          users={users}
          showTeamRoles={true}
          onUpdateRoleMember={updateMemberRole}
          onInviteNewUser={inviteNewUser}
          onRemoveUser={removeUser}
          authors={authors}
        />
      )}
      <div className={classNames('z-0 fixed flex flex-col h-full overflow--auto top-0 border-r ', sidebarOpen ? 'bg-gray-50 top-0 ' : 'bg-white')}>
        <div>
          <div className="flex flex-1 flex-col pt-32 mt-2">
            <nav className="flex-1 space-y-1">
              <PureSideOverlayPanel key={report?.name} cacheKey={report?.name} setSidebarOpen={(p) => setSidebarOpen(p)}>
                <>
                  {report && (
                    <PureTree
                      path={currentPath}
                      basePath={router.basePath}
                      commonData={commonData}
                      report={report}
                      version={router.query.version as string}
                      selfTree={selfTree}
                      parentTree={parentTree}
                      // onNavigation={(e) => {
                      //   e.preventDefault()
                      //   router.push(e.currentTarget.href)
                      // }}
                    />
                  )}
                </>
              </PureSideOverlayPanel>
            </nav>
          </div>
        </div>
      </div>

      <div className={classNames('flex flex-1 flex-col', sidebarOpen ? 'pl-64' : 'pl-10')}>
        <main>
          <div className="w-full px-4 sm:px-6 md:px-10">
            {/* Replace with your content */}
            <div className="py-4">
              {report && (
                <>
                  <div className="w-full flex lg:flex-col flex-col justify-between rounded">
                    <div className="w-full p-4">
                      <PureReportHeader
                        reportUrl={`${reportUrl}`}
                        frontEndUrl={frontEndUrl}
                        versions={versions}
                        fileToRender={fileToRender}
                        report={report}
                        authors={authors}
                        version={version}
                        openMetadata={() => openMetadata(!isOpenMetadata)}
                        onUpvoteReport={async () => {
                          await dispatch(toggleUserStarReportAction(report.id as string));
                          refreshReport();
                        }}
                        hasPermissionEditReport={
                          hasPermissionEditReport || ((report.user_id === commonData.user?.id || report.author_ids.includes(commonData.user?.id as string)) && hasPermissionEditReportOnlyMine)
                        }
                        hasPermissionDeleteReport={hasPermissionDeleteReport}
                        commonData={commonData}
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
                        />
                      </PureReportHeader>
                    </div>

                    <div className="border-y p-0">
                      {fileToRender && onlyVisibleCell && (
                        <div className="w-full flex justify-end p-2 prose prose-sm text-xs max-w-none">
                          Showing only this cell.
                          <button
                            onClick={() => {
                              const qs = { ...router.query };
                              delete qs.cell;
                              return router.push({
                                query: { ...qs },
                              });
                            }}
                            className="ml-1 text-blue-500"
                          >
                            View entire notebook
                          </button>
                        </div>
                      )}

                      {fileToRender && (
                        <UnpureReportRender
                          key={fileToRender.id}
                          fileToRender={fileToRender}
                          report={report}
                          channelMembers={channelMembers}
                          commonData={commonData}
                          onlyVisibleCell={onlyVisibleCell}
                          frontEndUrl={frontEndUrl}
                          enabledCreateInlineComment={hasPermissionCreateInlineComment}
                          enabledEditInlineComment={hasPermissionEditInlineComment}
                          enabledDeleteInlineComment={hasPermissionDeleteInlineComment}
                        />
                      )}

                      {!fileToRender && (
                        <button
                          type="button"
                          className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <span className="mt-2 block text-sm font-medium text-gray-900">Please choose a file in the filebrowser on the left.</span>
                        </button>
                      )}
                    </div>

                    {hasPermissionReadComment && (
                      <div className="block pb-44 w-full p-4 pl-8">
                        <div className="prose max-w-none ">
                          <h2>Comments</h2>
                        </div>
                        <PureComments
                          report={report}
                          commonData={commonData}
                          hasPermissionCreateComment={hasPermissionCreateComment}
                          hasPermissionDeleteComment={hasPermissionDeleteComment}
                          channelMembers={channelMembers}
                          submitComment={submitComment}
                          defaultPlaceholderText="Write a new report's global comment"
                          userSelectorHook={(id?: string): UserDTO | undefined => {
                            return id ? (userEntities.find((u) => u.id === id) as UserDTO | undefined) : undefined;
                          }}
                          onDeleteComment={async (id: string) => {
                            await dispatch(deleteCommentAction(id as string));
                          }}
                          commentSelectorHook={(parentId: string | null = null) => {
                            const values: Comment[] = Object.values(allComments || []);
                            if (values.length === 0) {
                              return [];
                            }
                            const filtered: Comment[] = values.filter((comment: Comment) => {
                              return comment!.comment_id === parentId;
                            });
                            // Sort comments by created_at desc
                            filtered.sort((a: Comment, b: Comment) => {
                              return moment(a.created_at!).isAfter(moment(b.created_at!)) ? -1 : 1;
                            });
                            return filtered;
                          }}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
