import React from 'react';
import type { ReportContext } from '../../kyso-markdown-renderer/interfaces/context';
import type { Cell } from '../interfaces/jupyter-notebook';
import InputCellCode from './input-cell-code';
import InputCellMarkdown from './input-cell-markdown';
import InputCellRaw from './input-cell-raw';

interface Props {
  cell: Cell;
  showInput: boolean;
  context?: ReportContext;
}
// change css here

const InputCell = (props: Props) => {
  if (props.showInput && props.cell.cell_type === 'code') {
    return (
      <div className="pl-4 p-2 bg-gray-50 border">
        <InputCellCode cell={props.cell} />;
      </div>
    );
  }

  if (props.cell.cell_type === 'markdown') {
    return (
      <div className="pl-4 p-2 ">
        <InputCellMarkdown cell={props.cell} context={props.context} />
      </div>
    );
  }

  if (props.showInput && props.cell.cell_type === 'raw') {
    return (
      <div className="pl-4 p-2">
        <InputCellRaw cell={props.cell} />
      </div>
    );
  }

  return null;
};

export default InputCell;
