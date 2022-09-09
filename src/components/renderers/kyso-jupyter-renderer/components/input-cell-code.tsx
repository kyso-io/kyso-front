import React, { useMemo } from 'react';
import RenderCode from '../../RenderCode';
import type { Cell } from '../interfaces/jupyter-notebook';

interface Props {
  cell: Cell;
}

const InputCellCode = ({ cell }: Props) => {
  const value: string = useMemo(() => {
    if (cell.source) {
      return Array.isArray(cell.source) ? cell.source.join('\n') : cell.source;
    }
    return '';
  }, [cell.source]);
  return <RenderCode code={value} />;
};

export default InputCellCode;
