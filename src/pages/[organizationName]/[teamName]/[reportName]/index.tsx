import KysoTopBar from '@/layouts/KysoTopBar';
import { useReport } from '@/hooks/use-report';
import UnpureReportRender from '@/unpure-components/UnpureReportRender';
import UnpureMain from '@/unpure-components/UnpureMain';
import { useAuthors } from '@/hooks/use-authors';
import PureUpvoteButton from '@/components/PureUpvoteButton';
import PureShareButton from '@/components/PureShareButton';
import UnpureReportActionDropdown from '@/unpure-components/UnpureReportActionDropdown';
import UnpureComments from '@/unpure-components/UnpureComments';
import type { GithubFileHash, User, UserDTO } from '@kyso-io/kyso-model';
import PureReportHeader from '@/components/PureReportHeader';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { toggleUserStarReportAction } from '@kyso-io/kyso-store';
import { useAppDispatch } from '@/hooks/redux-hooks';
import UnpureFileHeader from '@/unpure-components/UnpureFileHeader';
import PureTree from '@/components/PureTree';
import type { FileToRender } from '@/hooks/use-file-to-render';
import { useFileToRender } from '@/hooks/use-file-to-render';
import { useRouter } from 'next/router';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useTree } from '@/hooks/use-tree';
import { dirname } from 'path';
import checkPermissions from '@/helpers/check-permissions';
import { useMemo } from 'react';
import { PurePermissionDenied } from '@/components/PurePermissionDenied';

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

  let currentPath = '';
  if (router.query.path) {
    currentPath = (router.query.path as string) || '';
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

  const fileToRender: FileToRender | null = useFileToRender({ path: currentPath, tree: selfTree, mainFile: report?.main_file });

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
      return router.replace({ query: qs });
    }

    return router.replace({ query: { ...router.query, path: newPath } });
  };

  if (report && commonData && !hasPermissionReadReport) {
    return <PurePermissionDenied />;
  }

  return (
    <>
      <UnpureMain basePath={router.basePath} report={report} commonData={commonData}>
        <div className="flex flex-row space-x-10 ">
          <div className="flex flex-col h-screen w-[450px] space-y-6 truncate">
            {selfTree && report && commonData && (
              <PureTree
                path={router.query.path as string}
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

          {report && commonData && (
            <div className="flex flex-col h-screen w-full space-y-6 pt-6 ">
              <div className="flex justify-between">
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

              <div className="flex space-x-4">
                <div className="w-full">
                  {fileToRender && (
                    <>
                      <UnpureFileHeader
                        tree={selfTree}
                        report={report}
                        fileToRender={fileToRender}
                        basePath={router.basePath}
                        path={router.query.path as string}
                        version={router.query.version as string}
                        commonData={commonData}
                      />
                      <div className="bg-white border-b rounded-b border-x">
                        <UnpureReportRender
                          user={commonData.user as UserDTO}
                          fileToRender={fileToRender}
                          reportId={report?.id}
                          enabledCreateInlineComment={hasPermissionCreateInlineComment}
                          enabledEditInlineComment={hasPermissionEditInlineComment}
                          enabledDeleteInlineComment={hasPermissionDeleteInlineComment}
                        />
                      </div>
                    </>
                  )}

                  {!fileToRender && (
                    <div className="bg-white rounded border">
                      <div className="prose prose-sm p-3">Please choose a file in the filebrowser on the left.</div>
                    </div>
                  )}
                </div>
              </div>

              {hasPermissionReadComment && (
                <div className="block pb-44">
                  <div className="prose my-4">
                    <h1>Comments</h1>
                  </div>
                  <UnpureComments report={report} commonData={commonData} hasPermissionCreateComment={hasPermissionCreateComment} hasPermissionDeleteComment={hasPermissionDeleteComment} />
                </div>
              )}
            </div>
          )}
        </div>
      </UnpureMain>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
