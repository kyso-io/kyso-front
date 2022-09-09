import React from 'react';
import type { Cell as ICell } from '../interfaces/jupyter-notebook';
import InputCell from './input-cell';
import OutputsCell from './outputs-cell';

interface Props {
  showInput: boolean;
  showOutput: boolean;
  cell: ICell;
}

const Cell = ({ cell, showInput, showOutput }: Props) => {
  const hasInput = cell.source.length > 0;
  const hasOutput = cell?.outputs && cell.outputs.length > 0;
  // const hasInputOrOutput = cell.source.length > 0 || (cell?.outputs && cell.outputs.length > 0)

  return (
    <div style={{ overflowX: 'auto' }}>
      {hasInput && <InputCell cell={cell} showInput={showInput} />}

      {hasOutput && <OutputsCell cell={cell} showOutput={showOutput} />}
    </div>
  );
};

export default Cell;
