import PureIframeRenderer from '@/components/PureIframeRenderer';
import { PureSpinner } from '@/components/PureSpinner';
import RenderBase64Image from '@/components/renderers/RenderBase64Image';
import RenderCode from '@/components/renderers/RenderCode';
import RenderGoogleDocs from '@/components/renderers/RenderGoogleDocs';
import RenderOffice365 from '@/components/renderers/RenderOffice365';
import { FileTypesHelper } from '@/helpers/FileTypesHelper';
import { useAppDispatch } from '@/hooks/redux-hooks';
import type { FileToRender } from '@/hooks/use-file-to-render';
import type { CommonData } from '@/types/common-data';
import type { InlineCommentDto, ReportDTO, TeamMember, UpdateInlineCommentDto } from '@kyso-io/kyso-model';
import { createInlineCommentAction, deleteInlineCommentAction, getInlineCommentsAction, updateInlineCommentAction } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

// const BASE_64_REGEX = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PureComments = dynamic<any>(() => import('@kyso-io/kyso-webcomponents').then((mod) => mod.PureComments), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center p-7 w-full">
      <PureSpinner />
    </div>
  ),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KysoMarkdownRenderer = dynamic<any>(() => import('@kyso-io/kyso-webcomponents').then((mod) => mod.KysoMarkdownRenderer), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center p-7 w-full">
      <PureSpinner />
    </div>
  ),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KysoJupyterRenderer = dynamic<any>(() => import('@kyso-io/kyso-webcomponents').then((mod) => mod.KysoJupyterRenderer), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center p-7 w-full">
      <PureSpinner />
    </div>
  ),
});

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
}

const UnpureReportRender = (props: Props) => {
  const { report, onlyVisibleCell, frontEndUrl, fileToRender, commonData, channelMembers, enabledCreateInlineComment, enabledEditInlineComment, enabledDeleteInlineComment } = props;
  const dispatch = useAppDispatch();
  // const [isShownInput, setIsShownInput] = useState(false);
  // const [isShownOutput, setIsShownOutput] = useState(false);
  const [inlineComments, setInlineComments] = useState<InlineCommentDto[] | []>([]);

  console.log('Plotly');
  console.log(Plot);

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

  const deleteInlineComment = async (id: string) => {
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

  if (fileToRender.content !== null) {
    if (FileTypesHelper.isTextBasedFiled(fileToRender.path)) {
      render = <KysoMarkdownRenderer source={fileToRender.content} />;
    } else if (FileTypesHelper.isImage(fileToRender.path)) {
      render = <RenderBase64Image base64={fileToRender.content as string} />;
    } else if (FileTypesHelper.isJupyterNotebook(fileToRender.path)) {
      render = (
        <KysoJupyterRenderer
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
    } else if (FileTypesHelper.isCode(fileToRender.path)) {
      render = <RenderCode code={fileToRender.content} showFileNumbers={true} />;
    } else if (FileTypesHelper.isOffice365(fileToRender.path) && frontEndUrl) {
      const fileUrl = `${frontEndUrl}/scs${fileToRender.path_scs}`;
      render = <RenderOffice365 fileUrl={fileUrl} token={localStorage.getItem('jwt')} />;
    } else if (FileTypesHelper.isGoogleDocs(fileToRender.path) && frontEndUrl) {
      const fileUrl = `${frontEndUrl}/scs${fileToRender.path_scs}`;
      render = <RenderGoogleDocs fileUrl={fileUrl} token={localStorage.getItem('jwt')} />;
    } else {
      render = (
        <div className="prose p-3">
          Kyso cannot render this type of file. Do you need it? Give us <a href="/feedback">feedback</a> and we will consider it! 🤓
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
            <div className={clsx('w-9/12', !fileToRender.path.endsWith('.html') ? 'p-4' : '')}>{render}</div>
            <div className="w-3/12 p-2 border-l">
              <PureComments
                commonData={commonData}
                report={report}
                channelMembers={channelMembers}
                hasPermissionCreateComment={enabledCreateInlineComment}
                hasPermissionDeleteComment={enabledDeleteInlineComment}
                comments={inlineComments}
                onDeleteComment={(commentId: string) => {
                  deleteInlineComment(commentId);
                }}
                submitComment={(text: string, user_ids: string[], commentId: string) => {
                  if (!commentId) {
                    createInlineComment(fileToRender.id, user_ids, text);
                  } else {
                    editInlineComment(commentId, user_ids, text);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UnpureReportRender;
