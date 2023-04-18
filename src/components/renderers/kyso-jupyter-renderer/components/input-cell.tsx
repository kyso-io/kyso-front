import { useMemo } from 'react';
import { Helper } from '../../../../helpers/Helper';
import RenderCode from '../../RenderCode';
import type { ReportContext } from '../../kyso-markdown-renderer/interfaces/context';
import type { Cell } from '../interfaces/jupyter-notebook';
import InputCellCode from './input-cell-code';
import InputCellMarkdown from './input-cell-markdown';
import InputCellRaw from './input-cell-raw';

interface Props {
  index: number;
  cell: Cell;
  showInput: boolean;
  context?: ReportContext;
}

const InputCell = (props: Props) => {
  const cellWithHeaders: { headers: string; content: string } | null = useMemo(() => {
    if (props.index !== 0) {
      return null;
    }
    if (props.cell.cell_type !== 'markdown' && props.cell.cell_type !== 'raw') {
      return null;
    }
    const content: string = (props.cell.source as string[]).join('\n');
    if (!content) {
      return null;
    }
    const result = Helper.getHeadersAndContentFromMarkdownFile(content);
    if (!result) {
      return null;
    }
    result.headers = result.headers.replace(/\n\n/g, '\n').trim();
    return result;
  }, [props.index]);

  if (cellWithHeaders) {
    return (
      <div className="pl-4 p-2 bg-gray-50 border">
        <RenderCode code={cellWithHeaders.headers} showFileNumbers={true} />
      </div>
    );
  }

  if (props.showInput && props.cell.cell_type === 'code') {
    return (
      <div className="pl-4 p-2 bg-gray-50 border">
        <InputCellCode cell={props.cell} />
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
