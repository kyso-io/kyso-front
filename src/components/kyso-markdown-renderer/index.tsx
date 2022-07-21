/* eslint-disable react/self-closing-comp */
import React from 'react';
import _Markdown from './components/_markdown';

interface Props {
  source: string;
}

export const KysoMarkdownRenderer = ({ source }: Props) => {
  return <_Markdown source={source}></_Markdown>;
};
