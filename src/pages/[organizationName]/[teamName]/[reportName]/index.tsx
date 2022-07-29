import PureShareButton from '@/components/PureShareButton';
import PureUpvoteButton from '@/components/PureUpvoteButton';
import { useAuthors } from '@/hooks/use-authors';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useReport } from '@/hooks/use-report';
import { useTree } from '@/hooks/use-tree';
import UnpureReportActionDropdown from '@/unpure-components/UnpureReportActionDropdown';
import PureComments from '@/components/PureComments';
import type { GithubFileHash, Comment, User, UserDTO } from '@kyso-io/kyso-model';
import PureReportHeader from '@/components/PureReportHeader';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { createCommentAction, deleteCommentAction, fetchReportCommentsAction, toggleUserStarReportAction, updateCommentAction } from '@kyso-io/kyso-store';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import UnpureFileHeader from '@/unpure-components/UnpureFileHeader';
import PureTree from '@/components/PureTree';
import type { FileToRender } from '@/hooks/use-file-to-render';
import { useFileToRender } from '@/hooks/use-file-to-render';
import { useRouter } from 'next/router';
import { dirname } from 'path';
import checkPermissions from '@/helpers/check-permissions';
import { useEffect, useMemo } from 'react';
import { PurePermissionDenied } from '@/components/PurePermissionDenied';
import { useChannelMembers } from '@/hooks/use-channel-members';
import { useUserEntities } from '@/hooks/use-user-entities';
import moment from 'moment';
import UnpureReportRender from '@/unpure-components/UnpureReportRender';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';

const Index = () => {
  useRedirectIfNoJWT();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });

  const [report, refreshReport] = useReport({
    commonData,
    reportName: router.query.reportName as string,
  });

  const authors: User[] = useAuthors({ report });
  const channelMembers = useChannelMembers({ commonData });

  const userEntities = useUserEntities();

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
      version: router.query.version as string,
      report,
      commonData,
    },
    [router.query],
  );

  const parentTree: GithubFileHash[] = useTree(
    {
      path: dirname(currentPath),
      version: router.query.version as string,
      report,
      commonData,
    },
    [router.query],
  );

  const fileToRender: FileToRender | null = useFileToRender({
    path: currentPath,
    tree: selfTree,
    mainFile: currentPath === '' ? report?.main_file : undefined,
  });

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

  const allComments = useAppSelector((state) => state.comments.entities);

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

  const hasPermissionCreateComment = useMemo(() => checkPermissions(commonData, 'KYSO_IO_CREATE_COMMENT'), [commonData]);
  const hasPermissionReadComment = useMemo(() => checkPermissions(commonData, 'KYSO_IO_READ_COMMENT'), [commonData]);
  const hasPermissionDeleteComment = useMemo(() => checkPermissions(commonData, 'KYSO_IO_DELETE_COMMENT'), [commonData]);
  const hasPermissionReadReport = useMemo(() => (commonData.team?.visibility === 'public' ? true : checkPermissions(commonData, 'KYSO_IO_READ_REPORT')), [commonData]);
  const hasPermissionDeleteReport = useMemo(() => checkPermissions(commonData, 'KYSO_IO_DELETE_REPORT'), [commonData]);
  const hasPermissionEditReport = useMemo(() => checkPermissions(commonData, 'KYSO_IO_EDIT_REPORT'), [commonData]);
  const hasPermissionEditReportOnlyMine = useMemo(() => checkPermissions(commonData, 'KYSO_IO_EDIT_REPORT_ONLY_MINE'), [commonData]);

  const hasPermissionCreateInlineComment = useMemo(() => checkPermissions(commonData, 'KYSO_IO_CREATE_INLINE_COMMENT'), [commonData]);
  const hasPermissionEditInlineComment = useMemo(() => checkPermissions(commonData, 'KYSO_IO_EDIT_INLINE_COMMENT'), [commonData]);
  const hasPermissionDeleteInlineComment = useMemo(() => checkPermissions(commonData, 'KYSO_IO_DELETE_INLINE_COMMENT'), [commonData]);

  const onPushQuery = (newPath: string | null | undefined) => {
    if (!newPath) {
      const qs = { ...router.query };
      delete qs.path;
      return router.replace(`/${commonData.organization.sluglified_name}/${commonData.team.sluglified_name}/${report.name}`);
    }

    // return router.replace({ query: { ...router.query, path: newPath } });
    return router.replace(`/${commonData.organization.sluglified_name}/${commonData.team.sluglified_name}/${report.name}/${newPath}`);
  };

  if (report && commonData && !hasPermissionReadReport) {
    return <PurePermissionDenied />;
  }

  return (
    <div className="lg:mx-auto">
      <div className="grow flex lg:flex-row flex-col lg:space-y-0 space-y-2">
        <div className="flex-none lg:w-[350px] w-full rounded px-4">
          {selfTree && report && commonData && (
            <PureTree
              path={currentPath}
              basePath={router.basePath}
              commonData={commonData}
              report={report}
              version={router.query.version as string}
              onPushQuery={onPushQuery}
              selfTree={selfTree}
              parentTree={parentTree}
            />
          )}
        </div>

        <div className="grow w-full rounded">
          {report && commonData && (
            <>
              <div className="grow flex lg:flex-row container flex-col lg:space-y-0 space-y-2">
                <div className="lg:w-screen-lg w-full flex lg:flex-row flex-col justify-between rounded">
                  <PureReportHeader report={report} authors={authors} />
                  <div className="flex items-top pt-3 space-x-4">
                    {report?.id && (
                      <PureUpvoteButton
                        report={report}
                        upvoteReport={async () => {
                          await dispatch(toggleUserStarReportAction(report.id as string));
                          refreshReport();
                        }}
                      />
                    )}
                    <PureShareButton report={report} basePath={router.basePath} commonData={commonData} />
                    <UnpureReportActionDropdown
                      report={report}
                      commonData={commonData}
                      hasPermissionEditReport={
                        hasPermissionEditReport || ((report.user_id === commonData.user.id || report.author_ids.includes(commonData.user.id as string)) && hasPermissionEditReportOnlyMine)
                      }
                      hasPermissionDeleteReport={hasPermissionDeleteReport}
                    />
                  </div>
                </div>
                <div className="lg:max-w-xs w-full rounded"></div>
              </div>

              <div className="grow flex lg:flex-row container flex-col lg:space-y-0 space-y-2">
                <div className="lg:max-w-5xl lg:min-w-5xl w-full flex lg:flex-row flex-col justify-between rounded">
                  {fileToRender && (
                    <UnpureFileHeader
                      tree={selfTree}
                      report={report}
                      fileToRender={fileToRender}
                      basePath={router.basePath}
                      path={currentPath}
                      version={router.query.version as string}
                      commonData={commonData}
                    />
                  )}
                </div>
                <div className="lg:max-w-xs w-full rounded"></div>
              </div>

              <div className="grow flex lg:flex-col flex-col">
                {fileToRender && (
                  <UnpureReportRender
                    fileToRender={fileToRender}
                    report={report}
                    channelMembers={channelMembers}
                    commonData={commonData}
                    enabledCreateInlineComment={hasPermissionCreateInlineComment}
                    enabledEditInlineComment={hasPermissionEditInlineComment}
                    enabledDeleteInlineComment={hasPermissionDeleteInlineComment}
                  />
                )}

                {!fileToRender && (
                  <div className="prose prose-sm p-3">
                    <p>Please choose a file in the filebrowser on the left.</p>
                  </div>
                )}
              </div>

              <div className="grow flex lg:flex-row container flex-col lg:space-y-0 space-y-2">
                <div className="lg:max-w-5xl lg:min-w-5xl w-full flex lg:flex-row flex-col justify-between rounded">
                  {hasPermissionReadComment && (
                    <div className="block pb-44 w-full">
                      <div className="prose my-4 max-w-none ">
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
                <div className="lg:max-w-xs w-full rounded"></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
