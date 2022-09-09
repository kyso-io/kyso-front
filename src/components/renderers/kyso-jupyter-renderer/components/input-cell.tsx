import React from 'react';
import type { Cell } from '../interfaces/jupyter-notebook';
import InputCellCode from './input-cell-code';
import InputCellMarkdown from './input-cell-markdown';
import InputCellRaw from './input-cell-raw';

interface Props {
  cell: Cell;
  showInput: boolean;
}

const InputCell = (props: Props) => {
  if (props.showInput && props.cell.cell_type === 'code') {
    return <InputCellCode cell={props.cell} />;
  }

  if (props.cell.cell_type === 'markdown') {
    return (
      <div className="p-2">
        <InputCellMarkdown cell={props.cell} />
      </div>
    );
  }

  if (props.showInput && props.cell.cell_type === 'raw') {
    return <InputCellRaw cell={props.cell} />;
  }

  return null;
};

export default InputCell;
