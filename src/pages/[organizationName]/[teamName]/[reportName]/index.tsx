import PureComments from '@/components/PureComments';
import { PurePermissionDenied } from '@/components/PurePermissionDenied';
import PureReportHeader from '@/components/PureReportHeader';
import PureSideOverlayPanel from '@/components/PureSideOverlayPanel';
import PureTree from '@/components/PureTree';
import checkPermissions from '@/helpers/check-permissions';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import type { FileToRender } from '@/hooks/use-file-to-render';
import { isImage } from '@/hooks/use-file-to-render';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import UnpureFileHeader from '@/unpure-components/UnpureFileHeader';
import UnpureReportRender from '@/unpure-components/UnpureReportRender';
import type { Comment, GithubFileHash, KysoSetting, NormalizedResponseDTO, ReportDTO, TeamMember, User, UserDTO } from '@kyso-io/kyso-model';
import { CommentPermissionsEnum, InlineCommentPermissionsEnum, KysoSettingsEnum, ReportPermissionsEnum, TeamVisibilityEnum } from '@kyso-io/kyso-model';
import { Api, createCommentAction, deleteCommentAction, fetchReportCommentsAction, toggleUserStarReportAction, updateCommentAction } from '@kyso-io/kyso-store';
import moment from 'moment';
import { useRouter } from 'next/router';
import { dirname } from 'path';
import { useEffect, useMemo, useState } from 'react';
import { useChannelMembers } from '../../../../hooks/use-channel-members';
import { useUserEntities } from '../../../../hooks/use-user-entities';
import type { Version } from '../../../../hooks/use-versions';
import { useVersions } from '../../../../hooks/use-versions';

interface Props {
  commonData: CommonData;
  setReportData: (data: { report: ReportDTO | null; authors: UserDTO[] } | null) => void;
  reportData: { report: ReportDTO | null; authors: UserDTO[] } | null;
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
  }, [reportData?.report, router.query]);

  const refreshReport = async () => {
    try {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<ReportDTO> = await api.getReportByTeamIdAndSlug(commonData.team!.id!, router.query.reportName as string);
      const authors: UserDTO[] = [];
      result.data.author_ids.forEach((authorId: string) => {
        if (result.relations?.user[authorId]) {
          authors.push(result.relations.user[authorId]);
        }
      });
      setReportData({ report: result.data, authors });
    } catch (e) {
      setReportData({ report: null, authors: [] });
    }
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
      const allowedPaths = [currentPath, mainFile, 'Readme.md'];
      const validFile: GithubFileHash | undefined = validFiles?.find((item: GithubFileHash) => {
        return allowedPaths.includes(item.path);
      });
      try {
        let ftr: FileToRender | null = null;

        if (validFile) {
          ftr = {
            path: validFile!.path,
            id: validFile!.id,
            path_scs: validFile!.path_scs,
            percentLoaded: 0,
            isLoading: false,
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
  }, [selfTree, router.query?.path]);

  useEffect(() => {
    if (commonData.organization && commonData.team && commonData.team.visibility !== TeamVisibilityEnum.PUBLIC && !commonData.user) {
      // Unauthenticated user trying to access a non public team
      router.replace(`/${commonData.organization?.sluglified_name}`);
    }
  }, [commonData?.team]);

  useEffect(() => {
    if (reportData?.report?.id) {
      dispatch(
        fetchReportCommentsAction({
          reportId: report.id as string,
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

  if (!reportData || !reportData.report) {
    return null;
  }

  const { report, authors } = reportData;

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
              />

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
