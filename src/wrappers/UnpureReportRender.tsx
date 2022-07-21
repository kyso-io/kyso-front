import { useAppDispatch } from '@/hooks/redux-hooks';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import { createInlineCommentAction, deleteInlineCommentAction, fetchFileContentAction, getInlineCommentsAction, updateInlineCommentAction } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import { PureSpinner } from '@/components/PureSpinner';
import PureIframeRenderer from '@/components/PureIframeRenderer';
import { useFileToRender } from '@/hooks/use-file-to-render';
import { useUser } from '@/hooks/use-user';
import { PureCodeVisibilitySelectorDropdown } from '@/components/PureCodeVisibilitySelectorDropdown';
import { KysoJupyterRenderer } from '@/components/kyso-jupyter-renderer';
import { KysoMarkdownRenderer } from '@/components/kyso-markdown-renderer';
import type { InlineCommentDto, User } from '@kyso-io/kyso-model';

const isImage = (name: string) => {
  return (
    name != null &&
    (name.toLowerCase().endsWith('.png') || name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg') || name.toLowerCase().endsWith('.gif') || name.toLowerCase().endsWith('.svg'))
  );
};

const UnpureReportRender = () => {
  const report = useCommonReportData();
  const dispatch = useAppDispatch();
  const user: User = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isShownInput, setIsShownInput] = useState(false);
  const [isShownOutput, setIsShownOutput] = useState(false);
  const [inlineCommentsActived] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [inlineComments, setInlineComments] = useState<InlineCommentDto[] | []>([]);

  const fileToRender = useFileToRender();

  useEffect(() => {
    const asyncFn = async () => {
      if (!fileToRender || !report) {
        return;
      }
      if (fileToRender.path.endsWith('.html')) {
        return;
      }

      setIsLoading(true);
      const result = await dispatch(fetchFileContentAction(fileToRender.id));

      if (result?.payload) {
        if (isImage(fileToRender.path)) {
          setFileContent(Buffer.from(result.payload).toString('base64'));
        } else {
          setFileContent(Buffer.from(result.payload).toString('utf-8'));
        }
      }
      setIsLoading(false);
    };
    asyncFn();
  }, [report?.id]);

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

  if (fileContent !== null) {
    if (fileToRender.path.endsWith('.md')) {
      render = (
        <div className="prose prose-sm p-3">
          <KysoMarkdownRenderer source={fileContent} />
        </div>
      );
    } else if (isImage(fileToRender.path)) {
      render = <img src={`data:image/jpeg;base64,${fileContent}`} alt="file image" />;
    } else if (fileToRender.path.endsWith('.ipynb')) {
      render = (
        <div className="p-3 flex flex-col">
          <div className="flex justify-end">
            <PureCodeVisibilitySelectorDropdown inputShown={isShownInput} outputShown={isShownOutput} setInputShow={setIsShownInput} setOutputShow={setIsShownOutput} />
          </div>
          <div className="prose prose-sm contents">
            {user && user.id && user.avatar_url && (
              <KysoJupyterRenderer
                userId={user.id}
                avatarUrl={user.avatar_url}
                jupyterNotebook={JSON.parse(fileContent)}
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
      // Text based files can be rendered with the Markdown editor as well
      // console.log("nav" + navigator)
      render = (
        <div className="prose prose-sm contents">
          <pre>
            <KysoMarkdownRenderer source={fileContent} />
          </pre>
        </div>
      );
    } else {
      render = (
        <div className="prose prose-sm p-3">
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
      {isLoading && (
        <div className="prose prose-sm flex justify-center p-10">
          <PureSpinner />
        </div>
      )}
      {!fileContent && <div />}
      {!isLoading && render}
    </>
  );
};

export default UnpureReportRender;
