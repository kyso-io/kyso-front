/* eslint no-prototype-builtins: "off" */
import PureIframeRenderer from '@/components/PureIframeRenderer';
import { PureSpinner } from '@/components/PureSpinner';
import PureInlineComments from '@/components/inline-comments/components/pure-inline-comments';
import RenderCode from '@/components/renderers/RenderCode';
import RenderMicroscopeSVS from '@/components/renderers/RenderMicroscopeSVS';
import { RenderAsciidoc } from '@/components/renderers/kyso-asciidoc-renderer';
import { RenderJupyter } from '@/components/renderers/kyso-jupyter-renderer';
import { RenderMarkdown } from '@/components/renderers/kyso-markdown-renderer';
import RenderOnlyOffice from '@/components/renderers/kyso-onlyoffice-renderer/RenderOnlyOffice';
import { ToasterIcons } from '@/enums/toaster-icons';
import { FileTypesHelper } from '@/helpers/FileTypesHelper';
import { Helper } from '@/helpers/Helper';
import type { CommonData } from '@/types/common-data';
import type { InlineCommentDto, NormalizedResponseDTO, Relations, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import { CreateInlineCommentDto, InlineCommentStatusEnum, KysoEventEnum, UpdateInlineCommentDto } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Tooltip } from 'primereact/tooltip';
import { classNames } from 'primereact/utils';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import RenderCsvTsvInfiniteScroll from '../components/renderers/RenderCsvTsvInfiniteScroll';
import eventBus from '../helpers/event-bus';
import KAddTasksIcon from '../icons/KAddTaskIcon';
import type { FileToRender } from '../types/file-to-render';

interface Props {
  fileToRender: FileToRender;
  commonData: CommonData;
  report: ReportDTO;
  frontEndUrl?: string;
  onlyVisibleCell?: string;
  channelMembers: TeamMember[];
  hasPermissionCreateInlineComment: boolean;
  hasPermissionEditInlineComment: boolean;
  hasPermissionDeleteInlineComment: boolean;
  hasPermissionUpdateStatusInlineComment: boolean;
  setUser: (user: UserDTO) => void;
  isCurrentUserSolvedCaptcha: () => boolean;
  isCurrentUserVerified: () => boolean;
  isLastVersion: boolean;
  showToaster: (message: string, icon: JSX.Element) => void;
}

const UnpureReportRender = ({
  report,
  onlyVisibleCell,
  frontEndUrl,
  fileToRender,
  commonData,
  channelMembers,
  hasPermissionCreateInlineComment,
  hasPermissionEditInlineComment,
  hasPermissionDeleteInlineComment,
  hasPermissionUpdateStatusInlineComment,
  isCurrentUserVerified,
  isCurrentUserSolvedCaptcha,
  isLastVersion,
  showToaster,
}: Props) => {
  const router = useRouter();
  const { taskId } = router.query;
  const [inlineComments, setInlineComments] = useState<InlineCommentDto[] | []>([]);
  const [relations, setRelations] = useState<Relations>({});
  const [showCreateNewComment, setShowCreateNewComment] = useState<boolean>(false);

  const getReportInlineComments = async () => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      const response: NormalizedResponseDTO<InlineCommentDto[]> = await api.getInlineComments(report.id as string, fileToRender.id);
      setInlineComments(
        response.data.filter((inlineComment: InlineCommentDto) => {
          if (taskId) {
            // We want to show all the inline comments that are not CLOSED, but if we receive
            // a taskId from the url, that means the user wants to see that specific comment
            // and we must return it
            return inlineComment.current_status !== InlineCommentStatusEnum.CLOSED || inlineComment.id === taskId;
          }
          return inlineComment.current_status !== InlineCommentStatusEnum.CLOSED;
        }),
      );
      setRelations(response.relations!);
    } catch (e) {}
  };

  useEffect(() => {
    if (!report || !fileToRender) {
      return;
    }

    getReportInlineComments();
  }, [report.id, fileToRender.id]);

  const createInlineComment = async (cell_id: string, user_ids: string[], text: string, parent_id: string | null) => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      const createInlineCommentDto: CreateInlineCommentDto = new CreateInlineCommentDto(report.id as string, fileToRender.id, cell_id, text, user_ids, parent_id);
      const response: NormalizedResponseDTO<InlineCommentDto> = await api.createInlineComment(createInlineCommentDto);
      const newInlineComment: InlineCommentDto = response.data;
      const copyInlineComments: InlineCommentDto[] = [...inlineComments];
      if (newInlineComment.parent_comment_id) {
        const index: number = copyInlineComments.findIndex((inlineComment: InlineCommentDto) => inlineComment.id === newInlineComment.parent_comment_id);
        if (index !== -1) {
          copyInlineComments[index]!.inline_comments.unshift(newInlineComment);
        } else {
          copyInlineComments[index]!.inline_comments = [newInlineComment];
        }
      } else {
        copyInlineComments.push(response.data);
      }
      setInlineComments(copyInlineComments);
      const copyRelations = { ...relations };
      for (const key in response.relations) {
        if (response.relations.hasOwnProperty(key)) {
          copyRelations[key] = { ...copyRelations[key], ...response.relations[key] };
        } else {
          copyRelations[key] = response.relations[key];
        }
      }
      setRelations(copyRelations);
      eventBus.dispatch(KysoEventEnum.INLINE_COMMENTS_CREATE, newInlineComment);
    } catch (e) {
      // Helper.logError("Unexpected error", e);;
      showToaster('Error creating. Please try again', ToasterIcons.ERROR);
      // Force update
      const copy = Array.from(inlineComments);
      setInlineComments([]);

      setTimeout(() => {
        setInlineComments(copy);
      }, 100);
    }
  };

  const updateInlineComment = async (originalComment: InlineCommentDto, id: string, user_ids: string[], text: string, status: InlineCommentStatusEnum) => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      const updateInlineCommentDto: UpdateInlineCommentDto = new UpdateInlineCommentDto(fileToRender.id, text, user_ids, status, originalComment.orphan);
      const response: NormalizedResponseDTO<InlineCommentDto> = await api.updateInlineComment(id, updateInlineCommentDto);
      const updatedInlineComment: InlineCommentDto = response.data;
      const copyInlineComments: InlineCommentDto[] = [...inlineComments];
      if (updatedInlineComment.parent_comment_id) {
        const index: number = copyInlineComments.findIndex((inlineComment: InlineCommentDto) => inlineComment.id === updatedInlineComment.parent_comment_id);
        const indexChild: number = copyInlineComments[index]!.inline_comments.findIndex((inlineComment: InlineCommentDto) => inlineComment.id === id);
        copyInlineComments[index]!.inline_comments[indexChild] = updatedInlineComment;
      } else {
        const index: number = copyInlineComments.findIndex((inlineComment: InlineCommentDto) => inlineComment.id === id);
        copyInlineComments[index] = updatedInlineComment;
      }
      setInlineComments(copyInlineComments);
      const copyRelations = { ...relations };
      for (const key in response.relations) {
        if (response.relations.hasOwnProperty(key)) {
          copyRelations[key] = { ...copyRelations[key], ...response.relations[key] };
        } else {
          copyRelations[key] = response.relations[key];
        }
      }
      setRelations(copyRelations);
      eventBus.dispatch(KysoEventEnum.INLINE_COMMENTS_UPDATE, updatedInlineComment);
    } catch (e) {
      showToaster('Error updating. Please try again', ToasterIcons.ERROR);
      // Force update
      const copy = Array.from(inlineComments);
      setInlineComments([]);

      setTimeout(() => {
        setInlineComments(copy);
      }, 100);
    }
  };

  const deleteInlineComment = async (id: string) => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    let deletedInlineComment: InlineCommentDto | null = null;
    for (const inlineCommentItem of inlineComments) {
      if (inlineCommentItem.id === id) {
        deletedInlineComment = inlineCommentItem;
        break;
      }
      if (inlineCommentItem.inline_comments.length > 0) {
        for (const inlineCommentChild of inlineCommentItem.inline_comments) {
          if (inlineCommentChild.id === id) {
            deletedInlineComment = inlineCommentChild;
            break;
          }
        }
      }
    }
    if (!deletedInlineComment) {
      return;
    }
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      await api.deleteInlineComment(id);
      const copyInlineComments: InlineCommentDto[] = [...inlineComments];
      if (deletedInlineComment.parent_comment_id) {
        const index: number = copyInlineComments.findIndex((inlineComment: InlineCommentDto) => inlineComment.id === deletedInlineComment!.parent_comment_id);
        const indexChild: number = copyInlineComments[index]!.inline_comments.findIndex((inlineComment: InlineCommentDto) => inlineComment.id === id);
        copyInlineComments[index]!.inline_comments.splice(indexChild, 1);
      } else {
        const index: number = copyInlineComments.findIndex((inlineComment: InlineCommentDto) => inlineComment.id === id);
        copyInlineComments.splice(index, 1);
      }
      setInlineComments(copyInlineComments);
      eventBus.dispatch(KysoEventEnum.INLINE_COMMENTS_DELETE, deletedInlineComment);
    } catch (e) {
      // Helper.logError("Unexpected error", e);;
      showToaster('Error deleting. Please try again', ToasterIcons.ERROR);
      // Force update
      const copy = Array.from(inlineComments);
      setInlineComments([]);

      setTimeout(() => {
        setInlineComments(copy);
      }, 100);
    }
  };

  if (!fileToRender) {
    return null;
  }

  if (fileToRender.isLoading) {
    return (
      <div className="prose flex justify-center p-10">
        <PureSpinner />
      </div>
    );
  }

  return (
    <React.Fragment>
      {FileTypesHelper.isJupyterNotebook(fileToRender.path) ? (
        fileToRender.content && (
          <RenderJupyter
            commonData={commonData}
            report={report}
            onlyVisibleCell={onlyVisibleCell}
            channelMembers={channelMembers}
            jupyterNotebook={JSON.parse(fileToRender.content as string)}
            inlineComments={inlineComments}
            relations={relations}
            createInlineComment={createInlineComment}
            updateInlineComment={updateInlineComment}
            deleteInlineComment={deleteInlineComment}
            hasPermissionCreateInlineComment={hasPermissionCreateInlineComment}
            hasPermissionEditInlineComment={hasPermissionEditInlineComment}
            hasPermissionDeleteInlineComment={hasPermissionDeleteInlineComment}
            hasPermissionUpdateStatusInlineComment={hasPermissionUpdateStatusInlineComment}
            isLastVersion={isLastVersion}
            showToaster={showToaster}
          />
        )
      ) : (
        <div className="flex flex-col">
          <div className="flex flex-row">
            <div className={clsx('w-9/12', !fileToRender.path.endsWith('.html') ? 'p-4' : '')}>
              {fileToRender.path.endsWith('.html') ? (
                <PureIframeRenderer file={fileToRender} />
              ) : FileTypesHelper.isMarkdown(fileToRender.path) && fileToRender.content ? (
                <RenderMarkdown
                  source={fileToRender.content}
                  context={{
                    organizationSlug: commonData.organization?.sluglified_name!,
                    teamSlug: commonData.team?.sluglified_name!,
                    reportSlug: Helper.slugify(report.title),
                    version: report.last_version,
                  }}
                />
              ) : FileTypesHelper.isPlainTextFile(fileToRender.path) && fileToRender.content ? (
                <code style={{ maxWidth: '100%', contentVisibility: 'auto', display: 'block', whiteSpace: 'break-spaces' }}>{fileToRender.content}</code>
              ) : (FileTypesHelper.isImage(fileToRender.path) || fileToRender.path.toLowerCase().endsWith('.webp') || fileToRender.path.toLowerCase().endsWith('.svg')) && frontEndUrl ? (
                <img src={`${frontEndUrl}/scs${fileToRender.path_scs}`} alt={fileToRender.path} />
              ) : FileTypesHelper.isAdoc(fileToRender.path) && fileToRender.content && frontEndUrl ? (
                <RenderAsciidoc fileUrl={`${frontEndUrl}/scs${fileToRender.path_scs}`} source={fileToRender.content} />
              ) : FileTypesHelper.isDockerfile(fileToRender.path) && fileToRender.content && frontEndUrl ? (
                <RenderCode code={fileToRender.content} showFileNumbers={true} />
              ) : FileTypesHelper.isCode(fileToRender.path) && fileToRender.content ? (
                <RenderCode code={fileToRender.content} showFileNumbers={true} />
              ) : FileTypesHelper.isCsv(fileToRender.path) || FileTypesHelper.isTsv(fileToRender.path) ? (
                <RenderCsvTsvInfiniteScroll commonData={commonData} fileToRender={fileToRender} />
              ) : FileTypesHelper.isOnlyOffice(fileToRender.path) ? (
                <RenderOnlyOffice fileUrl={`http://kyso-scs/scs${fileToRender.path_scs}`} token={localStorage.getItem('jwt')} />
              ) : FileTypesHelper.isSVS(fileToRender.path) && frontEndUrl ? (
                <RenderMicroscopeSVS fileUrl={`http://kyso-scs/scs${fileToRender.path_scs}`} token={localStorage.getItem('jwt')} />
              ) : FileTypesHelper.isPlainTextFile(fileToRender.path) && !fileToRender.content ? (
                <div></div>
              ) : FileTypesHelper.isMarkdown(fileToRender.path) && !fileToRender.content ? (
                <div></div>
              ) : FileTypesHelper.isVideo(fileToRender.path) && frontEndUrl ? (
                <ReactPlayer url={`${frontEndUrl}/scs${fileToRender.path_scs}`} controls={true} />
              ) : (
                <div className="prose p-3">
                  Kyso cannot render this type of file. Do you need it? Give us{' '}
                  <Link href="/feedback" className="font-medium text-indigo-600 hover:text-indigo-500">
                    feedback
                  </Link>{' '}
                  and we will consider it! 🤓
                </div>
              )}
            </div>
            <div className={classNames('w-3/12', 'hidden lg:block p-2 min-w-fit border-l')}>
              <div className="relative items-center flex flex-row w-full justify-start">
                <Tooltip target=".overlay-comments-info" />
                <button
                  data-pr-position="bottom"
                  data-pr-tooltip="Create a new task"
                  type="button"
                  className="overlay-comments-info p-1 border h-fit rounded-md text-gray-900 hover:text-gray-700 focus:outline-none focus:ring-0 hover:bg-gray-50"
                  onClick={() => setShowCreateNewComment(true)}
                >
                  <KAddTasksIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <PureInlineComments
                commonData={commonData}
                report={report}
                channelMembers={channelMembers}
                hasPermissionCreateInlineComment={hasPermissionCreateInlineComment}
                hasPermissionEditInlineComment={hasPermissionEditInlineComment}
                hasPermissionDeleteInlineComment={hasPermissionDeleteInlineComment}
                hasPermissionUpdateStatusInlineComment={hasPermissionUpdateStatusInlineComment}
                comments={inlineComments}
                relations={relations}
                createInlineComment={(user_ids: string[], text: string, parent_id: string | null) => {
                  createInlineComment(fileToRender.id, user_ids, text, parent_id);
                  setShowCreateNewComment(false);
                }}
                updateInlineComment={updateInlineComment}
                deleteComment={deleteInlineComment}
                isLastVersion={isLastVersion}
                showCreateNewComment={showCreateNewComment}
                setShowCreateNewComment={setShowCreateNewComment}
                showToaster={showToaster}
              />
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default UnpureReportRender;
