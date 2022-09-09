/* eslint-disable react/self-closing-comp */
import React from 'react';
import { useNavigateToHashOnce } from '@/hooks/use-navigate-to-hash-once';
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
        s1 = s1?.substring(1);
        s1 = s1?.slice(0, -1);

        const newUrl = `/scs/${c.organizationSlug}/${c.teamSlug}/reports/${c.reportSlug}/${c.version}/${s1}`;

        const processedImage = image.replace(s1!, newUrl);

        finalContent = finalContent.replace(image, processedImage);
      }
    }
  }

  return finalContent;
};

export const RenderMarkdown = (props: Props) => {
  useNavigateToHashOnce({ active: true });
  let finalContent = null;

  if (props.source) {
    finalContent = props.source.toString();

    if (props.context) {
      finalContent = translateImagesToSCSUrl(props.source.toString(), props.context);
    }

    return <MarkdownWrapper source={finalContent}></MarkdownWrapper>;
  }
  return <div>No content to show</div>;
};
