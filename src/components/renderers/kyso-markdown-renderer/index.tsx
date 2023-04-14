/* eslint-disable react/self-closing-comp */
import { useNavigateToHashOnce } from '@/hooks/use-navigate-to-hash-once';
import React, { useMemo } from 'react';
import { Helper } from '../../../helpers/Helper';
import RenderCode from '../RenderCode';
import MarkdownWrapper from './components/markdown-wrapper';
import type { ReportContext } from './interfaces/context';

const imageRegex = /!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g;
const extractFromParenthesis = /\(.*?\)/g;
interface Props {
  source: string | Buffer | undefined;
  context?: ReportContext;
}

const translateImagesToSCSUrl = (source: string, c: ReportContext) => {
  const results = source.match(imageRegex);
  let finalContent = source;

  if (results) {
    for (const image of results) {
      const imageUrl = image.match(extractFromParenthesis);

      if (imageUrl) {
        let s1 = imageUrl.pop();

        // Remove parenthesis
        s1 = s1?.substring(1);
        s1 = s1?.slice(0, -1);

        if (s1?.startsWith('http') || s1?.startsWith('https')) {
          // Global URL, do nothing
        } else {
          const newUrl = `/scs/${c.organizationSlug}/${c.teamSlug}/reports/${c.reportSlug}/${c.version}/${s1}`;

          const processedImage = image.replace(s1!, newUrl);

          finalContent = finalContent.replace(image, processedImage);
        }
      }
    }
  }

  return finalContent;
};

export const RenderMarkdown = (props: Props) => {
  useNavigateToHashOnce({ active: true });
  const finalContent: string = useMemo(() => {
    if (props.source) {
      let content: string = props.source.toString();
      if (props.context) {
        content = translateImagesToSCSUrl(props.source.toString(), props.context);
      }
      return content;
    }
    return '';
  }, [props.source, props.context]);

  const fileWithHeaders: { headers: string; content: string } | null = useMemo(() => {
    if (!finalContent) {
      return null;
    }
    return Helper.getHeadersAndContentFromMarkdownFile(finalContent);
  }, [finalContent]);

  if (finalContent) {
    if (fileWithHeaders) {
      return (
        <React.Fragment>
          <div className="mb-4">
            <RenderCode code={fileWithHeaders.headers} showFileNumbers={true} />
          </div>
          <MarkdownWrapper source={fileWithHeaders.content}></MarkdownWrapper>
        </React.Fragment>
      );
    }
    return <MarkdownWrapper source={finalContent}></MarkdownWrapper>;
  }
  return <div>No content to show</div>;
};
