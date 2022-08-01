import { useAppDispatch } from '@/hooks/redux-hooks';
import { createInlineCommentAction, deleteInlineCommentAction, getInlineCommentsAction, updateInlineCommentAction } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import { PureSpinner } from '@/components/PureSpinner';
import PureIframeRenderer from '@/components/PureIframeRenderer';
import type { FileToRender } from '@/hooks/use-file-to-render';
import type { InlineCommentDto, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import dynamic from 'next/dynamic';
import type { CommonData } from '@/hooks/use-common-data';

// const BASE_64_REGEX = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KysoCodeRenderer = dynamic<any>(() => import('@kyso-io/kyso-webcomponents').then((mod) => mod.KysoCodeRenderer), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center p-7 w-full">
      <PureSpinner />
    </div>
  ),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KysoOffice365Renderer = dynamic<any>(() => import('@kyso-io/kyso-webcomponents').then((mod) => mod.KysoOffice365Renderer), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center p-7 w-full">
      <PureSpinner />
    </div>
  ),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KysoGoogleDocsRenderer = dynamic<any>(() => import('@kyso-io/kyso-webcomponents').then((mod) => mod.KysoGoogleDocsRenderer), {
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
        <div className="w-9/12 p-2 border-x border-b rounded-b">
          <KysoMarkdownRenderer source={fileToRender.content} />
        </div>
      );
    } else if (isImage(fileToRender.path)) {
      render = (
        <div className="w-9/12 p-2 border-x border-b rounded-b">
          <img
            // className="w-full"
            src={`data:image/jpeg;base64,${fileToRender.content}`}
            alt="file image"
          />
        </div>
      );
    } else if (fileToRender.path.endsWith('.ipynb')) {
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
        <div className="w-9/12 border-x border-b rounded-b p-2">
          <KysoCodeRenderer embedded={false} code={fileToRender.content} />
        </div>
      );
    } else if (
      (fileToRender.path.toLowerCase().endsWith('.pptx') ||
        fileToRender.path.toLowerCase().endsWith('.ppt') ||
        fileToRender.path.toLowerCase().endsWith('.xlsx') ||
        fileToRender.path.toLowerCase().endsWith('.xls') ||
        fileToRender.path.toLowerCase().endsWith('.docx') ||
        fileToRender.path.toLowerCase().endsWith('.doc')) &&
      frontEndUrl
    ) {
      const fileUrl = `${frontEndUrl}/scs${fileToRender.path_scs}`;
      render = (
        <div className="w-9/12 border-x border-b rounded-b">
          <KysoOffice365Renderer fileUrl={fileUrl} token={localStorage.getItem('jwt')} />
        </div>
      );
    } else if (
      (fileToRender.path.toLowerCase().endsWith('.rtf') ||
        fileToRender.path.toLowerCase().endsWith('.pdf') ||
        fileToRender.path.toLowerCase().endsWith('.txt') ||
        fileToRender.path.toLowerCase().endsWith('.webm') ||
        fileToRender.path.toLowerCase().endsWith('.mpeg4') ||
        fileToRender.path.toLowerCase().endsWith('.3gpp') ||
        fileToRender.path.toLowerCase().endsWith('.mov') ||
        fileToRender.path.toLowerCase().endsWith('.avi') ||
        fileToRender.path.toLowerCase().endsWith('.mpegps') ||
        fileToRender.path.toLowerCase().endsWith('.wmv') ||
        fileToRender.path.toLowerCase().endsWith('.flv') ||
        fileToRender.path.toLowerCase().endsWith('.pages') ||
        fileToRender.path.toLowerCase().endsWith('.ai') ||
        fileToRender.path.toLowerCase().endsWith('.psd') ||
        fileToRender.path.toLowerCase().endsWith('.tiff') ||
        fileToRender.path.toLowerCase().endsWith('.dxf') ||
        fileToRender.path.toLowerCase().endsWith('.svg') ||
        fileToRender.path.toLowerCase().endsWith('.eps') ||
        fileToRender.path.toLowerCase().endsWith('.ps') ||
        fileToRender.path.toLowerCase().endsWith('.ttf') ||
        fileToRender.path.toLowerCase().endsWith('.xps') ||
        fileToRender.path.toLowerCase().endsWith('.zip') ||
        fileToRender.path.toLowerCase().endsWith('.rar')) &&
      frontEndUrl
    ) {
      const fileUrl = `${frontEndUrl}/scs${fileToRender.path_scs}`;
      render = (
        <div className="w-9/12 border-x border-b rounded-b">
          <KysoGoogleDocsRenderer fileUrl={fileUrl} token={localStorage.getItem('jwt')} />
        </div>
      );
    } else {
      render = (
        <div className="w-9/12 border-x border-b rounded-b">
          <div className="prose p-3">
            Kyso cannot render this type of file. Do you need it? Give us <a href="/feedback">feedback</a> and we will consider it! 🤓
          </div>
        </div>
      );
    }
  } else if (fileToRender.path.endsWith('.html')) {
    render = (
      <div className="w-9/12">
        <PureIframeRenderer file={fileToRender} />
      </div>
    );
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
