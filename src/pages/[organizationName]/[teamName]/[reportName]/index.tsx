import PureShareButton from '@/components/PureShareButton';
import PureUpvoteButton from '@/components/PureUpvoteButton';
import { useAuthors } from '@/hooks/use-authors';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useReport } from '@/hooks/use-report';
import { useTree } from '@/hooks/use-tree';
import UnpureReportActionDropdown from '@/unpure-components/UnpureReportActionDropdown';
import PureComments from '@/components/PureComments';
import type { GithubFileHash, Comment, User, UserDTO, KysoSetting } from '@kyso-io/kyso-model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
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
import classNames from '@/helpers/class-names';

const Index = () => {
  useRedirectIfNoJWT();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });

  const version = router.query.version ? (router.query.version as string) : undefined;

  const [report, refreshReport] = useReport({
    commonData,
    reportName: router.query.reportName as string,
  });

  const authors: User[] = useAuthors({ report });
  const channelMembers = useChannelMembers({ commonData });
  const allComments = useAppSelector((state) => state.comments.entities);

  const userEntities = useUserEntities();

  const onlyVisibleCell = router.query.cell ? (router.query.cell as string) : undefined;

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

  let frontEndUrl = useAppSelector((s) => {
    const settings = s.kysoSettings?.publicSettings?.filter((x: KysoSetting) => x.key === KysoSettingsEnum.BASE_URL);
    if (settings && settings.length > 0) {
      return settings[0].value;
    }
    return undefined;
  });

  // for testing
  frontEndUrl = 'https://dev.kyso.io';

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

  if (report && commonData && !hasPermissionReadReport) {
    return <PurePermissionDenied />;
  }

  return (
    <div className="flex flex-row space-x-24">
      {/* <div className="hidden bg-gray-50 bg-gray-100 bg-gray-200 bg-red-100 bg-blue-100 border-y-inherit border-y-white border-b-inherit border-y-transparent"></div> */}

      <div className="w-2/12">
        {selfTree && report && commonData && (
          <PureTree path={currentPath} basePath={router.basePath} commonData={commonData} report={report} version={router.query.version as string} selfTree={selfTree} parentTree={parentTree} />
        )}
      </div>

      <div className="w-10/12">
        {report && commonData && (
          <>
            <div className="w-9/12 flex lg:flex-row flex-col justify-between rounded">
              <PureReportHeader report={report} authors={authors} />
              <div className="flex flex-row items-start space-x-2">
                <a href="versions" className={classNames('text-gray-700', 'block text-sm hover:bg-gray-50')}>
                  {version ? `Version: #${version}` : 'Versions'}
                </a>
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

            <div className="w-9/12 flex container flex-col lg:space-y-0 space-y-2">
              <div>
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
            </div>

            <div className="w-12/12 flex lg:flex-col flex-col">
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
                <div className="prose prose-sm p-3">
                  <p>Please choose a file in the filebrowser on the left.</p>
                </div>
              )}
            </div>

            <div className="w-9/12 lg:max-w-5xl lg:min-w-5xl flex lg:flex-row flex-col justify-between rounded">
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
          </>
        )}
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
