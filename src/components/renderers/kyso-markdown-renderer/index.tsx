/* eslint-disable react/self-closing-comp */
import React from 'react';
import { useNavigateToHashOnce } from '@/hooks/use-navigate-to-hash-once';
import MarkdownWrapper from './components/markdown-wrapper';

interface Props {
  source: string | Buffer | undefined;
}

export const RenderMarkdown = ({ source }: Props) => {
  useNavigateToHashOnce({ active: true });
  if (source) {
    return <MarkdownWrapper source={source.toString()}></MarkdownWrapper>;
  }
  return <div>No content to show</div>;
};
