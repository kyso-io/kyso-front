import React, { useMemo } from 'react';
import { RenderMarkdown } from '../../kyso-markdown-renderer';
import type { ReportContext } from '../../kyso-markdown-renderer/interfaces/context';
import type { Cell } from '../interfaces/jupyter-notebook';

interface Props {
  cell: Cell;
  context?: ReportContext;
}

const InputCellMarkdown = ({ cell, context }: Props) => {
  const source: string = useMemo(() => {
    if (cell.source) {
      return Array.isArray(cell.source) ? cell.source.join('\n') : cell.source;
    }
    return '';
  }, [cell.source]);
  return <RenderMarkdown source={source} context={context} />;
};

export default InputCellMarkdown;
