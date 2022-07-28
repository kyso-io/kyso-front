import { useAppDispatch } from '@/hooks/redux-hooks';
import { createInlineCommentAction, deleteInlineCommentAction, getInlineCommentsAction, updateInlineCommentAction } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import { PureSpinner } from '@/components/PureSpinner';
import PureIframeRenderer from '@/components/PureIframeRenderer';
import type { FileToRender } from '@/hooks/use-file-to-render';
import type { InlineCommentDto, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import dynamic from 'next/dynamic';
import type { CommonData } from '@/hooks/use-common-data';

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

const isImage = (name: string) => {
  return (
    name != null &&
    (name.toLowerCase().endsWith('.png') || name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg') || name.toLowerCase().endsWith('.gif') || name.toLowerCase().endsWith('.svg'))
  );
};

interface Props {
  fileToRender: FileToRender;
  commonData: CommonData;
  report: ReportDTO;
  channelMembers: TeamMember[];
  enabledCreateInlineComment: boolean;
  enabledEditInlineComment: boolean;
  enabledDeleteInlineComment: boolean;
}

const UnpureReportRender = (props: Props) => {
  const { report, fileToRender, commonData, channelMembers, enabledCreateInlineComment, enabledEditInlineComment, enabledDeleteInlineComment } = props;
  const dispatch = useAppDispatch();
  // const [isShownInput, setIsShownInput] = useState(false);
  // const [isShownOutput, setIsShownOutput] = useState(false);
  const [inlineComments, setInlineComments] = useState<InlineCommentDto[] | []>([]);

  useEffect(() => {
    if (report.id) {
      const getReportInlineComments = async () => {
        const data = await dispatch(getInlineCommentsAction(report.id as string));
        if (data?.payload) {
          setInlineComments(data.payload);
        }
      };
      getReportInlineComments();
    }
  }, [report.id]);

  const createInlineComment = async (cell_id: string, text: string) => {
    try {
      const data = await dispatch(
        createInlineCommentAction({
          report_id: report.id as string,
          cell_id,
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

  const editInlineComment = async (id: string, text: string) => {
    try {
      const data = await dispatch(
        updateInlineCommentAction({
          inlineCommentId: id,
          updateInlineCommentDto: {
            text,
          },
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
    if (fileToRender.path.endsWith('.md')) {
      render = (
        <div className="p-3">
          <KysoMarkdownRenderer source={fileToRender.content} />
        </div>
      );
    } else if (isImage(fileToRender.path)) {
      render = <img src={`data:image/jpeg;base64,${fileToRender.content}`} alt="file image" />;
    } else if (fileToRender.path.endsWith('.ipynb')) {
      render = (
        <div className="flex flex-col w-full relative">
          <div className="w-full max-w-full">
            {commonData.user && (
              <KysoJupyterRenderer
                commonData={commonData}
                report={report}
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
            )}
          </div>
        </div>
      );
    } else if (
      fileToRender.path.endsWith('.txt') ||
      fileToRender.path.endsWith('.json') ||
      fileToRender.path.endsWith('.yaml') ||
      fileToRender.path.endsWith('.yml') ||
      fileToRender.path.endsWith('.js') ||
      fileToRender.path.endsWith('.py') ||
      fileToRender.path.endsWith('.css')
    ) {
      render = (
        <div>
          <pre>
            <KysoMarkdownRenderer source={fileToRender.content} />
          </pre>
        </div>
      );
    } else {
      render = (
        <div className="prose p-3">
          Kyso cannot render this type of file. Do you need it? Give us <a href="/feedback">feedback</a> and we will consider it! 🤓
        </div>
      );
    }
  }

  if (fileToRender.path.endsWith('.html')) {
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
      {!fileToRender.isLoading && render}
    </>
  );
};

export default UnpureReportRender;
