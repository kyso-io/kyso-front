import { KysoCodeRenderer } from '@/components/kyso-code-renderer';
import React, { useMemo } from 'react';
// import { UnControlled as CodeMirror } from 'react-codemirror2'
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
  return (
    <div className="my-4">
      <KysoCodeRenderer code={value} />
    </div>
  );
};

export default InputCellCode;
