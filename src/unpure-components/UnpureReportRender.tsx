import PureInlineComments from '@/components/inline-comments/components/pure-inline-comments';
import PureIframeRenderer from '@/components/PureIframeRenderer';
import { PureSpinner } from '@/components/PureSpinner';
import { RenderAsciidoc } from '@/components/renderers/kyso-asciidoc-renderer';
import { RenderJupyter } from '@/components/renderers/kyso-jupyter-renderer';
import { RenderMarkdown } from '@/components/renderers/kyso-markdown-renderer';
import RenderOnlyOffice from '@/components/renderers/kyso-onlyoffice-renderer/RenderOnlyOffice';
import RenderCode from '@/components/renderers/RenderCode';
import RenderMicroscopeSVS from '@/components/renderers/RenderMicroscopeSVS';
import { FileTypesHelper } from '@/helpers/FileTypesHelper';
import { Helper } from '@/helpers/Helper';
import { useAppDispatch } from '@/hooks/redux-hooks';
import type { CommonData } from '@/types/common-data';
import type { InlineCommentDto, NormalizedResponseDTO, ReportDTO, TeamMember, UpdateInlineCommentDto, UserDTO } from '@kyso-io/kyso-model';
import { CreateInlineCommentDto } from '@kyso-io/kyso-model';
import { Api, createInlineCommentAction, deleteInlineCommentAction, getInlineCommentsAction, updateInlineCommentAction } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import { classNames } from 'primereact/utils';
import React, { useEffect, useState } from 'react';
import CaptchaModal from '../components/CaptchaModal';
import CsvTsvRenderer from '../components/CsvTsvRenderer';
import TableOfContents from '../components/TableOfContents';
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
  captchaIsEnabled: boolean;
  setUser: (user: UserDTO) => void;
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
  captchaIsEnabled,
  setUser,
}: Props) => {
  const dispatch = useAppDispatch();
  // const [isShownInput, setIsShownInput] = useState(false);
  // const [isShownOutput, setIsShownOutput] = useState(false);
  const [inlineComments, setInlineComments] = useState<InlineCommentDto[] | []>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCaptchaModal, setShowCaptchaModal] = useState<boolean>(false);

  useEffect(() => {
    if (report.id) {
      const getReportInlineComments = async () => {
        const data = await dispatch(getInlineCommentsAction(report.id as string));
        if (data?.payload) {
          if (fileToRender.path.endsWith('.ipynb')) {
            setInlineComments(data.payload);
          } else {
            setInlineComments(data.payload.filter((c: InlineCommentDto) => c.cell_id === fileToRender.id));
          }
        }
      };
      getReportInlineComments();
    }
  }, [report.id, fileToRender.id]);

  const createInlineComment = async (cell_id: string, user_ids: string[], text: string) => {
    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowCaptchaModal(true);
      return;
    }
    try {
      const createInlineCommentDto: CreateInlineCommentDto = new CreateInlineCommentDto(report.id as string, cell_id, text, user_ids);
      const data = await dispatch(createInlineCommentAction(createInlineCommentDto));
      if (data?.payload) {
        setInlineComments([...inlineComments, data.payload]);
      }
    } catch (e) {
      // Helper.logError("Unexpected error", e);;
    }
  };

  const editInlineComment = async (id: string, user_ids: string[], text: string) => {
    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowCaptchaModal(true);
      return;
    }
    try {
      const data = await dispatch(
        updateInlineCommentAction({
          inlineCommentId: id,
          updateInlineCommentDto: {
            text,
            mentions: user_ids,
          } as UpdateInlineCommentDto,
        }),
      );
      if (data?.payload) {
        setInlineComments(
          inlineComments.map((inlineComment) => {
            if (inlineComment.id === id) {
              return data.payload;
            }
            return inlineComment;
          }),
        );
      }
    } catch (e) {
      // Helper.logError("Unexpected error", e);;
    }
  };

  const onCloseCaptchaModal = async (refreshUser: boolean) => {
    setShowCaptchaModal(false);
    if (refreshUser) {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
      setUser(result.data);
    }
  };

  const deleteInlineComment = async (id: string) => {
    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowCaptchaModal(true);
      return;
    }
    try {
      const data = await dispatch(deleteInlineCommentAction(id));
      if (data?.payload) {
        setInlineComments(inlineComments.filter((inlineComment) => inlineComment.id !== id));
      }
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
            deleteInlineComment={deleteInlineComment}
            editInlineComment={editInlineComment}
            enabledCreateInlineComment={enabledCreateInlineComment}
            enabledEditInlineComment={enabledEditInlineComment}
            enabledDeleteInlineComment={enabledDeleteInlineComment}
            toc={fileToRender.toc}
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
              ) : FileTypesHelper.isTsv(fileToRender.path) ? (
                <CsvTsvRenderer fileToRender={fileToRender} delimiter={'\t'} />
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
              {fileToRender.toc && fileToRender.toc.length > 0 && <TableOfContents title="Table of Contents" toc={fileToRender.toc} collapsible={false} openInNewTab={false} stickToRight={true} />}
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
                  onDeleteComment={(commentId: string) => {
                    deleteInlineComment(commentId);
                  }}
                  submitComment={(text?: string, user_ids?: string[], commentId?: string) => {
                    if (!commentId) {
                      createInlineComment(fileToRender.id, user_ids!, text!);
                    } else {
                      editInlineComment(commentId, user_ids!, text!);
                    }
                  }}
                />
              </PureSideOverlayCommentsPanel>
            </div>
          </div>
        </div>
      )}
      {commonData.user && <CaptchaModal user={commonData.user!} open={showCaptchaModal} onClose={onCloseCaptchaModal} />}
    </React.Fragment>
  );
};

export default UnpureReportRender;
