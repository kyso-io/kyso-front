import { useAppDispatch } from '@/hooks/redux-hooks';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import { createInlineCommentAction, deleteInlineCommentAction, getInlineCommentsAction, updateInlineCommentAction } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import { PureSpinner } from '@/components/PureSpinner';
import PureIframeRenderer from '@/components/PureIframeRenderer';
import { useFileToRender } from '@/hooks/use-file-to-render';
import { useUser } from '@/hooks/use-user';
import { PureCodeVisibilitySelectorDropdown } from '@/components/PureCodeVisibilitySelectorDropdown';
import type { InlineCommentDto, UserDTO } from '@kyso-io/kyso-model';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

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

const UnpureReportRender = () => {
  const router = useRouter();
  const report = useCommonReportData();
  const dispatch = useAppDispatch();
  const user: UserDTO = useUser();
  const [isShownInput, setIsShownInput] = useState(false);
  const [isShownOutput, setIsShownOutput] = useState(false);
  const [inlineCommentsActived] = useState(true);
  const [inlineComments, setInlineComments] = useState<InlineCommentDto[] | []>([]);

  let currentPath = '';
  if (router.query.path) {
    currentPath = (router.query.path as string) || '';
  }

  const fileToRender = useFileToRender({ path: currentPath });

  // const updateMainFileContent = async () => {
  //   // setRequesting(true);

  //   const result = await dispatch(
  //     updateMainFileReportAction({
  //       reportId: report.id as string,
  //       mainContent: fileContent as string,
  //     })
  //   );
  //   if (!result.payload) {
  //     // setRequesting(false);
  //     return;
  //   }
  //   // toaster.success("Report updated");
  //   // setRequesting(false);
  //   // router.push(`/${organizationName}/${teamName}/${reportName}`);
  // };

  useEffect(() => {
    if (report?.id) {
      const getReportInlineComments = async () => {
        const data = await dispatch(getInlineCommentsAction(report.id as string));
        if (data?.payload) {
          setInlineComments(data.payload);
        }
      };
      getReportInlineComments();
    }
  }, [report?.id]);

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
        <div className="prose p-3">
          <KysoMarkdownRenderer source={fileToRender.content} />
        </div>
      );
    } else if (isImage(fileToRender.path)) {
      render = <img src={`data:image/jpeg;base64,${fileToRender.content}`} alt="file image" />;
    } else if (fileToRender.path.endsWith('.ipynb')) {
      render = (
        <div className="flex flex-col relative">
          <PureCodeVisibilitySelectorDropdown inputShown={isShownInput} outputShown={isShownOutput} setInputShow={setIsShownInput} setOutputShow={setIsShownOutput} />
          <div className="px-4 pb-4">
            <div className="prose contents">
              {user && user.id && user.avatar_url && (
                <KysoJupyterRenderer
                  userId={user.id}
                  avatarUrl={user.avatar_url}
                  jupyterNotebook={JSON.parse(fileToRender.content as string)}
                  showInputs={isShownInput}
                  showOutputs={isShownOutput}
                  inlineCommentsActived={inlineCommentsActived}
                  enabledCreateInlineComment={inlineCommentsActived}
                  enabledDeleteInlineComment={inlineCommentsActived}
                  enabledEditInlineComment={inlineCommentsActived}
                  inlineComments={inlineComments}
                  createInlineComment={createInlineComment}
                  deleteInlineComment={deleteInlineComment}
                  editInlineComment={editInlineComment}
                />
              )}
            </div>
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
        <div className="prose contents">
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
