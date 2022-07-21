/* eslint-disable react/self-closing-comp */
import React from 'react';
import { CodeRenderer } from './components/_codeRenderer';
import type { Props } from './components/_codeRenderer';

export const KysoCodeRenderer = ({ code }: Props) => {
  return <CodeRenderer code={code}></CodeRenderer>;
};
