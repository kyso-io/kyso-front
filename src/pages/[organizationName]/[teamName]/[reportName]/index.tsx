import type { OrganizationMember, TeamMember, NormalizedResponseDTO, Comment, GithubFileHash, KysoSetting, UserDTO } from '@kyso-io/kyso-model';

import { CommentPermissionsEnum, InlineCommentPermissionsEnum, KysoSettingsEnum, ReportPermissionsEnum, TeamVisibilityEnum } from '@kyso-io/kyso-model';

import { Api, createCommentAction, deleteCommentAction, fetchReportCommentsAction, toggleUserStarReportAction, updateCommentAction } from '@kyso-io/kyso-store';

import PureComments from '@/components/PureComments';
import { PurePermissionDenied } from '@/components/PurePermissionDenied';
import PureReportHeader from '@/components/PureReportHeader';
import PureSideOverlayPanel from '@/components/PureSideOverlayPanel';
import PureTree from '@/components/PureTree';
import checkPermissions from '@/helpers/check-permissions';
import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { useChannelMembers } from '@/hooks/use-channel-members';
import type { FileToRender } from '@/hooks/use-file-to-render';
import { useFileToRender } from '@/hooks/use-file-to-render';
import { useReport } from '@/hooks/use-report';
import { useTree } from '@/hooks/use-tree';
import { useUserEntities } from '@/hooks/use-user-entities';
import { useVersions } from '@/hooks/use-versions';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import type { Member } from '@/types/member';
import UnpureFileHeader from '@/unpure-components/UnpureFileHeader';
import UnpureReportRender from '@/unpure-components/UnpureReportRender';
import moment from 'moment';
import { useRouter } from 'next/router';
import { dirname } from 'path';
import { useEffect, useMemo, useState } from 'react';
import ManageUsers from '@/components/ManageUsers';

interface Props {
  commonData: CommonData;
}

const token: string | null = getLocalStorageItem('jwt');

const Index = ({ commonData }: Props) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const version = router.query.version ? (router.query.version as string) : undefined;

  const {
    report,
    authors,
    mutate: refreshReport,
  } = useReport({
    commonData,
    reportName: router.query.reportName as string,
  });

  const versions = useVersions({
    report,
    commonData,
  });

  const channelMembers = useChannelMembers({ commonData });
  const allComments = useAppSelector((state) => state.comments.entities);
  const userEntities = useUserEntities();
  const onlyVisibleCell = router.query.cell ? (router.query.cell as string) : undefined;
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);

  let currentPath = '';
  if (router.query.path) {
    if (Array.isArray(router.query.path)) {
      currentPath = (router.query.path as string[]).join('/') || '';
    } else {
      currentPath = (router.query.path as string) || '';
    }
  }

  const selfTree: GithubFileHash[] = useTree(
    {
      path: currentPath,
      version,
      report,
      commonData,
    },
    [router.query],
  );

  const parentTree: GithubFileHash[] = useTree(
    {
      path: dirname(currentPath),
      version,
      report,
      commonData,
    },
    [router.query],
  );

  const fileToRender: FileToRender | null = useFileToRender({
    path: currentPath,
    commonData,
    tree: selfTree,
    mainFile: currentPath === '' ? report?.main_file : undefined,
  });

  useEffect(() => {
    if (commonData.organization && commonData.team && commonData.team.visibility !== TeamVisibilityEnum.PUBLIC && !commonData.user) {
      // Unauthenticated user trying to access a non public team
      router.replace(`/${commonData.organization?.sluglified_name}`);
    }
  }, [commonData?.team]);

  // START TEAM MEMBERS

  const getTeamMembers = async () => {
    const m: Member[] = [];
    try {
      const api: Api = new Api(token, commonData.organization!.sluglified_name);
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
      const api: Api = new Api(token, commonData.organization!.sluglified_name);
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
        const api: Api = new Api(token, commonData.organization!.sluglified_name);
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
          const api: Api = new Api(token, commonData.organization!.sluglified_name);
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
          const api: Api = new Api(token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
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
      const api: Api = new Api(token, commonData.organization!.sluglified_name);
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

  const removeUser = async (userId: string): Promise<void> => {
    try {
      const api: Api = new Api(token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      await api.deleteUserFromTeam(commonData.team!.id!, userId);
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
    if (report) {
      dispatch(
        fetchReportCommentsAction({
          reportId: report.id as string,
          sort: '-created_at',
        }),
      );
    }
  }, [report?.id]);

  // TODO -> confusion as to whether these are Conmment or CommentDTO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitComment = async (newComment: any, parentComment: any) => {
    if (parentComment && parentComment.id) {
      await dispatch(updateCommentAction({ commentId: parentComment.id, comment: newComment }));
    } else {
      await dispatch(createCommentAction(newComment));
    }

    if (report) {
      await dispatch(
        fetchReportCommentsAction({
          reportId: report.id as string,
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
    return undefined;
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

  if (report && commonData && !hasPermissionReadReport) {
    return <PurePermissionDenied />;
  }

  const reportUrl = `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`;

  return (
    <div>
      {/* <div className="hidden bg-gray-50 bg-gray-100 w-3/12 bg-gray-200 bg-red-100 bg-blue-100 border-y-inherit border-y-white border-b-inherit border-y-transparent inline mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300 w-5 h-5"></div> */}
      <div className="flex flex-row">
        <PureSideOverlayPanel key={report?.name} cacheKey={report?.name}>
          <>
            {report && commonData && (
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

        {selfTree && report && commonData && (
          <>
            <div className="w-full p-4 flex lg:flex-col flex-col justify-between rounded">
              <PureReportHeader
                reportUrl={`${reportUrl}`}
                frontEndUrl={frontEndUrl}
                versions={versions}
                report={report}
                authors={authors}
                version={version}
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

              <UnpureFileHeader
                tree={selfTree}
                report={report}
                fileToRender={fileToRender}
                basePath={router.basePath}
                path={currentPath}
                version={router.query.version as string}
                commonData={commonData}
              />

              {fileToRender && onlyVisibleCell && (
                <div className="w-full border-x border-b flex justify-end p-2 prose prose-sm text-xs max-w-none">
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
                <div className="border-x border-b rounded-b">
                  <div className="prose p-3">Please choose a file in the filebrowser on the left.</div>
                </div>
              )}

              {hasPermissionReadComment && (
                <div className="block pb-44 w-full">
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
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
