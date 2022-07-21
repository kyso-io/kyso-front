import React from 'react';
import type { Cell } from '../interfaces/jupyter-notebook';
import InputCellCode from './input-cell-code';
import InputCellMarkdown from './input-cell-markdown';
import InputCellRaw from './input-cell-raw';

interface Props {
  cell: Cell;
  showInput: boolean;
}

const InputCell = ({ cell, showInput }: Props) => {
  if (showInput && cell.cell_type === 'code') {
    return <InputCellCode cell={cell} />;
  }
  if (cell.cell_type === 'markdown') {
    return <InputCellMarkdown cell={cell} />;
  }
  if (showInput && cell.cell_type === 'raw') {
    return <InputCellRaw cell={cell} />;
  }
  return null;
};

export default InputCell;
