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

export const RenderMarkdown = (props: Props) => {
  useNavigateToHashOnce({ active: true });
  let finalContent = null;

  if (props.source) {
    finalContent = props.source.toString();

    if (props.context) {
      const results = props.source.toString().match(imageRegex);

      if (results) {
        for (const image of results) {
          const imageUrl = image.match(extractFromParenthesis);
          console.log(imageUrl);
          if (imageUrl) {
            let s1 = imageUrl.pop();
            s1 = s1?.substring(1);
            s1 = s1?.slice(0, -1);

            if (s1?.startsWith('.') || s1?.startsWith('/')) {
              s1 = s1?.substring(1);
            } else if (s1?.startsWith('./')) {
              s1 = s1?.substring(2);
            }

            const newUrl = `/scs/${props.context?.organizationSlug}/${props.context?.teamSlug}/reports/${props.context?.reportSlug}/${props.context?.version}/${s1}`;

            const processedImage = image.replace(s1!, newUrl);

            finalContent = finalContent.replace(image, processedImage);
          }
        }
      }
    }

    return <MarkdownWrapper source={finalContent}></MarkdownWrapper>;
  }
  return <div>No content to show</div>;
};
