import React, { useMemo } from 'react';
import { RenderMarkdown } from '../../kyso-markdown-renderer';
import type { Cell } from '../interfaces/jupyter-notebook';

interface Props {
  cell: Cell;
}

const InputCellMarkdown = ({ cell }: Props) => {
  const source: string = useMemo(() => {
    if (cell.source) {
      return Array.isArray(cell.source) ? cell.source.join('\n') : cell.source;
    }
    return '';
  }, [cell.source]);
  return <RenderMarkdown source={source} />;
};

export default InputCellMarkdown;
