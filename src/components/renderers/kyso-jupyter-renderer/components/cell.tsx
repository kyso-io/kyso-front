import React from 'react';
import type { ReportContext } from '../../kyso-markdown-renderer/interfaces/context';
import type { Cell as ICell } from '../interfaces/jupyter-notebook';
import InputCell from './input-cell';
import OutputsCell from './outputs-cell';

interface Props {
  showInput: boolean;
  showOutput: boolean;
  index: number;
  cell: ICell;
  context?: ReportContext;
}

const Cell = ({ cell, index, showInput, showOutput, context }: Props) => {
  const hasInput = cell.source.length > 0;
  const hasOutput = cell?.outputs && cell.outputs.length > 0;
  return (
    <div style={{ overflowX: 'auto' }}>
      {hasInput && <InputCell index={index} cell={cell} showInput={showInput} context={context} />}

      {hasOutput && <OutputsCell cell={cell} showOutput={showOutput} />}
    </div>
  );
};

export default Cell;
