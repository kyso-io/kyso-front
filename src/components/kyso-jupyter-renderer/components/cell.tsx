import React from 'react';
import type { DataType } from '../interfaces/data-type';
import type { Cell as ICell } from '../interfaces/jupyter-notebook';
import InputCell from './input-cell';
import OutputsCell from './outputs-cell';

interface Props {
  showInput: boolean;
  showOutput: boolean;
  cell: ICell;
  dataTypes: DataType[];
}

const Cell = ({ cell, showInput, showOutput, dataTypes }: Props) => {
  return (
    <div className="d-flex flex-column">
      {cell.source.length > 0 && <InputCell cell={cell} showInput={showInput} />}
      {cell?.outputs && cell.outputs.length > 0 && <OutputsCell cell={cell} showOutput={showOutput} dataTypes={dataTypes} />}
    </div>
  );
};

export default Cell;
