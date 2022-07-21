import React from 'react';
import type { DataType } from '../interfaces/data-type';
import type { Cell, Output } from '../interfaces/jupyter-notebook';
import OutputCell from './output-cell';

interface Props {
  cell: Cell;
  showOutput: boolean;
  dataTypes: DataType[];
}

const OutputsCell = ({ cell, showOutput, dataTypes }: Props) => {
  if (!cell.outputs) {
    return null;
  }
  return (
    <React.Fragment>
      {cell.outputs.map((output: Output, index: number) => (
        <OutputCell key={index} output={output} showOutput={showOutput} dataTypes={dataTypes} />
      ))}
    </React.Fragment>
  );
};

export default OutputsCell;
