import React, { useMemo } from 'react';
import type { Cell } from '../interfaces/jupyter-notebook';

interface Props {
  cell: Cell;
}

const InputCellRaw = ({ cell }: Props) => {
  const source: string = useMemo(() => {
    if (cell.source) {
      return Array.isArray(cell.source) ? cell.source.join('\n') : cell.source;
    }
    return '';
  }, [cell.source]);
  return <div className="my-4">{source}</div>;
};

export default InputCellRaw;
