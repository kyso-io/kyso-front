import PureIframeRenderer from '@/components/PureIframeRenderer';
import { PureSpinner } from '@/components/PureSpinner';
import PureInlineComments from '@/components/inline-comments/components/pure-inline-comments';
import RenderCode from '@/components/renderers/RenderCode';
import RenderMicroscopeSVS from '@/components/renderers/RenderMicroscopeSVS';
import { RenderAsciidoc } from '@/components/renderers/kyso-asciidoc-renderer';
import { RenderJupyter } from '@/components/renderers/kyso-jupyter-renderer';
import { RenderMarkdown } from '@/components/renderers/kyso-markdown-renderer';
import RenderOnlyOffice from '@/components/renderers/kyso-onlyoffice-renderer/RenderOnlyOffice';
import { FileTypesHelper } from '@/helpers/FileTypesHelper';
import { Helper } from '@/helpers/Helper';
import type { CommonData } from '@/types/common-data';
import { DocumentTextIcon } from '@heroicons/react/outline';
import type { InlineCommentDto, InlineCommentStatusEnum, NormalizedResponseDTO, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import { CreateInlineCommentDto, UpdateInlineCommentDto } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import { classNames } from 'primereact/utils';
import React, { useEffect, useState } from 'react';
import TableOfContents from '../components/TableOfContents';
import RenderCsvTsvInfiniteScroll from '../components/renderers/RenderCsvTsvInfiniteScroll';
import type { FileToRender } from '../types/file-to-render';
import PureSideOverlayCommentsPanel from './UnpureSideOverlayCommentsPanel';

// const BASE_64_REGEX = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

interface Props {
  fileToRender: FileToRender;
  commonData: CommonData;
  report: ReportDTO;
  frontEndUrl?: string;
  onlyVisibleCell?: string;
  channelMembers: TeamMember[];
  enabledCreateInlineComment: boolean;
  enabledEditInlineComment: boolean;
  enabledDeleteInlineComment: boolean;
  setUser: (user: UserDTO) => void;
  isCurrentUserSolvedCaptcha: () => boolean;
  isCurrentUserVerified: () => boolean;
  isLastVersion: boolean;
}

const UnpureReportRender = ({
  report,
  onlyVisibleCell,
  frontEndUrl,
  fileToRender,
  commonData,
  channelMembers,
  enabledCreateInlineComment,
  enabledEditInlineComment,
  enabledDeleteInlineComment,
  isCurrentUserVerified,
  isCurrentUserSolvedCaptcha,
  isLastVersion,
}: Props) => {
  // const [isShownInput, setIsShownInput] = useState(false);
  // const [isShownOutput, setIsShownOutput] = useState(false);
  const [inlineComments, setInlineComments] = useState<InlineCommentDto[] | []>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!report || !fileToRender) {
      return;
    }
    const getReportInlineComments = async () => {
      try {
        const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
        const response: NormalizedResponseDTO<InlineCommentDto[]> = await api.getInlineComments(report.id as string, fileToRender.id);
        setInlineComments(response.data);
      } catch (e) {}
    };
    getReportInlineComments();
  }, [report.id, fileToRender.id]);

  const createInlineComment = async (cell_id: string, user_ids: string[], text: string, parent_id: string | null) => {
    if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
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
    } catch (e) {
      // Helper.logError("Unexpected error", e);;
    }
  };

  const updateInlineComment = async (id: string, user_ids: string[], text: string, status: InlineCommentStatusEnum) => {
    if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
      return;
    }
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      const updateInlineCommentDto: UpdateInlineCommentDto = new UpdateInlineCommentDto(fileToRender.id, text, user_ids, status);
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
    } catch (e) {
      // Helper.logError("Unexpected error", e);;
    }
  };

  const deleteInlineComment = async (id: string) => {
    if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
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
    } catch (e) {
      // Helper.logError("Unexpected error", e);;
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
            showInputs={false}
            showOutputs={false}
            inlineComments={inlineComments}
            createInlineComment={createInlineComment}
            updateInlineComment={updateInlineComment}
            deleteInlineComment={deleteInlineComment}
            enabledCreateInlineComment={enabledCreateInlineComment}
            enabledEditInlineComment={enabledEditInlineComment}
            enabledDeleteInlineComment={enabledDeleteInlineComment}
            toc={fileToRender.toc}
            isLastVersion={isLastVersion}
          />
        )
      ) : (
        <div className="flex flex-col">
          <div className="flex flex-row">
            <div className={clsx(sidebarOpen ? 'w-9/12' : 'w-11/12', !fileToRender.path.endsWith('.html') ? 'p-4' : '')}>
              {fileToRender.path.endsWith('.html') ? (
                <PureIframeRenderer file={fileToRender} />
              ) : FileTypesHelper.isTextBasedFiled(fileToRender.path) && fileToRender.content ? (
                <RenderMarkdown
                  source={fileToRender.content}
                  context={{
                    organizationSlug: commonData.organization?.sluglified_name!,
                    teamSlug: commonData.team?.sluglified_name!,
                    reportSlug: Helper.slugify(report.title),
                    version: report.last_version,
                  }}
                />
              ) : (FileTypesHelper.isImage(fileToRender.path) || fileToRender.path.toLowerCase().endsWith('.webp') || fileToRender.path.toLowerCase().endsWith('.svg')) && frontEndUrl ? (
                <img src={`${frontEndUrl}/scs${fileToRender.path_scs}`} alt={fileToRender.path} />
              ) : FileTypesHelper.isAdoc(fileToRender.path) && fileToRender.content && frontEndUrl ? (
                <RenderAsciidoc fileUrl={`${frontEndUrl}/scs${fileToRender.path_scs}`} source={fileToRender.content} />
              ) : FileTypesHelper.isCode(fileToRender.path) && fileToRender.content ? (
                <RenderCode code={fileToRender.content} showFileNumbers={true} />
              ) : FileTypesHelper.isCsv(fileToRender.path) || FileTypesHelper.isTsv(fileToRender.path) ? (
                <RenderCsvTsvInfiniteScroll commonData={commonData} fileToRender={fileToRender} />
              ) : FileTypesHelper.isOnlyOffice(fileToRender.path) ? (
                <RenderOnlyOffice fileUrl={`http://kyso-scs/scs${fileToRender.path_scs}`} token={localStorage.getItem('jwt')} />
              ) : FileTypesHelper.isSVS(fileToRender.path) && frontEndUrl ? (
                <RenderMicroscopeSVS fileUrl={`http://kyso-scs/scs${fileToRender.path_scs}`} token={localStorage.getItem('jwt')} />
              ) : FileTypesHelper.isTextBasedFiled(fileToRender.path) && !fileToRender.content ? (
                <div></div>
              ) : (
                <div className="prose p-3">
                  Kyso cannot render this type of file. Do you need it? Give us{' '}
                  <a href="/feedback" className="font-medium text-indigo-600 hover:text-indigo-500">
                    feedback
                  </a>{' '}
                  and we will consider it! 🤓
                </div>
              )}
            </div>
            <div className={classNames(sidebarOpen ? 'w-3/12' : 'w-1/12', 'hidden lg:block p-2 min-w-fit border-l')}>
              {/* fileToRender.toc && fileToRender.toc.length > 0 && <TableOfContents title="Table of Contents" toc={fileToRender.toc} collapsible={false} openInNewTab={false} stickToRight={true} /> */}
              {fileToRender.toc && fileToRender.toc.length > 0 && (
                <PureSideOverlayCommentsPanel
                  key={report?.id!}
                  cacheKey={report?.id!}
                  setSidebarOpen={(p) => setSidebarOpen(p)}
                  commonData={commonData}
                  tooltipOpenText="Open ToC"
                  tooltipCloseText="Close ToC"
                  icon={<DocumentTextIcon className="h-4 w-4 mt-1" aria-hidden="true" />}
                >
                  <div className="">
                    <TableOfContents title="Table of Contents" toc={fileToRender.toc} collapsible={false} openInNewTab={false} stickToRight={true} />
                  </div>
                </PureSideOverlayCommentsPanel>
              )}
              <PureSideOverlayCommentsPanel
                key={report?.id!}
                cacheKey={report?.id!}
                setSidebarOpen={(p) => setSidebarOpen(p)}
                commonData={commonData}
                tooltipOpenText="Open file's comments"
                tooltipCloseText="Close file's comments"
              >
                <PureInlineComments
                  commonData={commonData}
                  report={report}
                  channelMembers={channelMembers}
                  hasPermissionCreateComment={enabledCreateInlineComment}
                  hasPermissionDeleteComment={enabledDeleteInlineComment}
                  comments={inlineComments}
                  createInlineComment={(user_ids: string[], text: string, parent_id: string | null) => createInlineComment(fileToRender.id, user_ids, text, parent_id)}
                  updateInlineComment={updateInlineComment}
                  deleteComment={deleteInlineComment}
                  isLastVersion={isLastVersion}
                  showTitle={true}
                  showCreateNewComment={true}
                />
              </PureSideOverlayCommentsPanel>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default UnpureReportRender;
