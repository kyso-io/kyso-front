import React from 'react';
import type { Cell, Output } from '../interfaces/jupyter-notebook';
import OutputCell from './output-cell';

interface Props {
  cell: Cell;
  showOutput: boolean;
}

const OutputsCell = ({ cell, showOutput }: Props) => {
  if (!cell.outputs) {
    return null;
  }

  return (
    <div className="p-2">
      {cell.outputs.map((output: Output, index: number) => (
        <OutputCell key={index} showOutput={showOutput} output={output} />
      ))}
    </div>
  );
};

export default OutputsCell;
