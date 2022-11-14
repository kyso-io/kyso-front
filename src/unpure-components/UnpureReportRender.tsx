import PureInlineComments from '@/components/inline-comments/components/pure-inline-comments';
import PureIframeRenderer from '@/components/PureIframeRenderer';
import { PureSpinner } from '@/components/PureSpinner';
import { RenderAsciidoc } from '@/components/renderers/kyso-asciidoc-renderer';
import { RenderJupyter } from '@/components/renderers/kyso-jupyter-renderer';
import { RenderMarkdown } from '@/components/renderers/kyso-markdown-renderer';
import type { ReportContext } from '@/components/renderers/kyso-markdown-renderer/interfaces/context';
import RenderOnlyOffice from '@/components/renderers/kyso-onlyoffice-renderer/RenderOnlyOffice';
import RenderCode from '@/components/renderers/RenderCode';
import { FileTypesHelper } from '@/helpers/FileTypesHelper';
import { Helper } from '@/helpers/Helper';
import { useAppDispatch } from '@/hooks/redux-hooks';
import type { CommonData } from '@/types/common-data';
import type { InlineCommentDto, NormalizedResponseDTO, ReportDTO, TeamMember, UpdateInlineCommentDto, UserDTO } from '@kyso-io/kyso-model';
import { Api, createInlineCommentAction, deleteInlineCommentAction, getInlineCommentsAction, updateInlineCommentAction } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import { classNames } from 'primereact/utils';
import { useEffect, useState } from 'react';
import CaptchaModal from '../components/CaptchaModal';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      const data = await dispatch(
        createInlineCommentAction({
          report_id: report.id as string,
          cell_id,
          mentions: user_ids,
          text,
        }),
      );
      if (data?.payload) {
        setInlineComments([...inlineComments, data.payload]);
      }
    } catch (e) {
      // console.error(e);
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
      // console.error(e);
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
      // console.error(e);
    }
  };

  if (!fileToRender) {
    return <div />;
  }

  let render = null;

  if (fileToRender.content) {
    if (FileTypesHelper.isTextBasedFiled(fileToRender.path)) {
      const markdownContext: ReportContext = {
        organizationSlug: commonData.organization?.sluglified_name!,
        teamSlug: commonData.team?.sluglified_name!,
        reportSlug: Helper.slugify(report.title),
        version: report.last_version,
      };

      render = <RenderMarkdown source={fileToRender.content} context={markdownContext} />;
    } else if (FileTypesHelper.isImage(fileToRender.path)) {
      render = <img src={`${frontEndUrl}/scs${fileToRender.path_scs}`} alt={fileToRender.path} />;
    } else if (fileToRender.path.toLowerCase().endsWith('.webp') || fileToRender.path.toLowerCase().endsWith('.svg')) {
      render = <img src={`${frontEndUrl}/scs${fileToRender.path_scs}`} alt={fileToRender.path} />;
    } else if (FileTypesHelper.isJupyterNotebook(fileToRender.path)) {
      render = (
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
        />
      );
    } else if (FileTypesHelper.isAdoc(fileToRender.path)) {
      const fileUrl = `${frontEndUrl}/scs${fileToRender.path_scs}`;
      const source = fileToRender.content;
      render = <RenderAsciidoc fileUrl={fileUrl} source={source} />;
    } else if (FileTypesHelper.isCode(fileToRender.path)) {
      render = <RenderCode code={fileToRender.content} showFileNumbers={true} />;
    } else if (FileTypesHelper.isOnlyOffice(fileToRender.path) && frontEndUrl) {
      // const fileUrl = `${frontEndUrl}/scs${fileToRender.path_scs}`;

      // To use internal URLs as is rendered by document-server
      const fileUrl = `http://kyso-scs/scs${fileToRender.path_scs}`;
      render = <RenderOnlyOffice fileUrl={fileUrl} token={localStorage.getItem('jwt')} />;
    } /* else if (FileTypesHelper.isGoogleDocs(fileToRender.path) && frontEndUrl) {
      const fileUrl = `${frontEndUrl}/scs${fileToRender.path_scs}`;
      render = <RenderGoogleDocs fileUrl={fileUrl} token={localStorage.getItem('jwt')} />;
    } */ else {
      render = (
        <div className="prose p-3">
          Kyso cannot render this type of file. Do you need it? Give us{' '}
          <a href="/feedback" className="font-medium text-indigo-600 hover:text-indigo-500">
            feedback
          </a>{' '}
          and we will consider it! 🤓
        </div>
      );
    }
  } else if (fileToRender.path.endsWith('.html')) {
    render = <PureIframeRenderer file={fileToRender} />;
  }

  return (
    <>
      {fileToRender.isLoading && (
        <div className="prose flex justify-center p-10">
          <PureSpinner />
        </div>
      )}
      {!fileToRender.content && <div />}
      {!fileToRender.isLoading && fileToRender.path.endsWith('.ipynb') && render}
      {!fileToRender.isLoading && !fileToRender.path.endsWith('.ipynb') && (
        <div className="flex flex-col">
          <div className="flex flex-row">
            <div className={clsx(sidebarOpen ? 'w-9/12' : 'w-11/12', !fileToRender.path.endsWith('.html') ? 'p-4' : '')}>{render}</div>
            <div className={classNames(sidebarOpen ? 'w-3/12' : 'w-1/12', 'p-2 min-w-fit border-l')}>
              <PureSideOverlayCommentsPanel key={report?.id} cacheKey={report?.id} setSidebarOpen={(p) => setSidebarOpen(p)} commonData={commonData}>
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
    </>
  );
};

export default UnpureReportRender;
