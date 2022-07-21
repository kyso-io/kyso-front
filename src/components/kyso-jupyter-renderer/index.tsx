/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-prototype-builtins */
import type { InlineCommentDto } from '@kyso-io/kyso-model';
import React, { useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import CellCommentsContainer from '@/components/comments-container';
import Cell from './components/cell';
import type { DataType } from './interfaces/data-type';
import type { Cell as ICell, JupyterNotebook } from './interfaces/jupyter-notebook';

interface Props {
  userId: string;
  avatarUrl: string;
  jupyterNotebook: JupyterNotebook;
  showInputs: boolean;
  showOutputs: boolean;
  inlineCommentsActived: boolean;
  inlineComments: InlineCommentDto[];
  createInlineComment: (cellId: string, text: string) => void;
  deleteInlineComment: (id: string) => void;
  editInlineComment: (id: string, text: string) => void;
  enabledCreateInlineComment: boolean;
  enabledDeleteInlineComment: boolean;
  enabledEditInlineComment: boolean;
}

export const KysoJupyterRenderer = ({
  userId,
  avatarUrl,
  jupyterNotebook,
  showInputs,
  showOutputs,
  inlineCommentsActived,
  inlineComments,
  createInlineComment,
  deleteInlineComment,
  editInlineComment,
  enabledCreateInlineComment,
  enabledDeleteInlineComment,
  enabledEditInlineComment,
}: Props) => {
  const [showCommentsContainer, setShowCommentsContainer] = useState<{
    [cellId: string]: boolean;
  }>({});
  if (!jupyterNotebook || !jupyterNotebook.cells || jupyterNotebook.cells.length === 0) {
    return null;
  }
  return (
    <div className="d-flex flex-column my-2">
      {jupyterNotebook.cells.map((cell: ICell, index: number) => {
        const key: string = cell?.id && cell.id.length > 0 ? cell.id : index.toString();
        const inlineCommentDtos: InlineCommentDto[] = inlineComments.filter((inlineComment: InlineCommentDto) => inlineComment.cell_id === cell.id);
        let dataTypes: DataType[] = [];
        if (cell?.outputs && cell.outputs.length > 0) {
          for (const outputCell of cell.outputs) {
            if (outputCell?.data) {
              for (const type in outputCell.data) {
                if (outputCell.data.hasOwnProperty(type)) {
                  const outputs: any = outputCell.data[type];
                  dataTypes.push({
                    type,
                    outputs: Array.isArray(outputs) ? outputs : [outputs],
                  });
                }
              }
            }
            if (outputCell?.name) {
              dataTypes.push({
                type: outputCell.output_type,
                outputs: outputCell.text!,
              });
            }
            if (outputCell?.ename) {
              dataTypes.push({
                type: outputCell.output_type,
                outputs: [outputCell.evalue!],
              });
            }
            const plotlyOutput: DataType | undefined = dataTypes.find((d: DataType) => d.type === 'application/vnd.plotly.v1+json');
            if (plotlyOutput) {
              dataTypes = [plotlyOutput];
            }
          }
        }
        return (
          <div key={key} className="d-flex flex-row">
            <div className="grow-1 w-100">
              <Cell cell={cell} showInput={showInputs} showOutput={showOutputs} dataTypes={dataTypes} />
            </div>
            {cell?.id && cell.id.length > 0 && inlineCommentsActived && (showInputs || dataTypes.length > 0 || showOutputs) && (
              <div className="d-flex align-items-start ms-4 container-icon-message">
                {showCommentsContainer[cell.id] ? (
                  <OutsideClickHandler onOutsideClick={() => {}}>
                    <CellCommentsContainer
                      key={cell.id}
                      userId={userId}
                      avatarUrl={avatarUrl}
                      inlineCommentDtos={inlineCommentDtos}
                      createInlineComment={(text: string) => createInlineComment(cell.id, text)}
                      deleteInlineComment={deleteInlineComment}
                      editInlineComment={editInlineComment}
                      onClose={() =>
                        setShowCommentsContainer({
                          ...showCommentsContainer,
                          [cell.id]: false,
                        })
                      }
                      enabledCreateInlineComment={enabledCreateInlineComment}
                      enabledDeleteInlineComment={enabledDeleteInlineComment}
                      enabledEditInlineComment={enabledEditInlineComment}
                    />
                  </OutsideClickHandler>
                ) : (
                  <div
                    className="d-flex flex-row align-items-center"
                    onClick={() =>
                      setShowCommentsContainer({
                        ...showCommentsContainer,
                        [cell.id]: true,
                      })
                    }
                  >
                    <svg viewBox="0 0 16 16" className="icon-message">
                      <path d="M4.32 15.424c.39 0 .677-.192 1.149-.609l2.344-2.064h4.116c2.057 0 3.213-1.19 3.213-3.22V4.22c0-2.03-1.156-3.22-3.213-3.22H3.213C1.163 1 0 2.19 0 4.22V9.53c0 2.037 1.196 3.22 3.165 3.22h.28v1.675c0 .608.322.998.875.998zm.342-1.531v-1.949c0-.403-.178-.56-.56-.56H3.26c-1.285 0-1.9-.65-1.9-1.894V4.26c0-1.243.615-1.893 1.9-1.893h8.627c1.278 0 1.893.65 1.893 1.894v5.23c0 1.243-.615 1.893-1.893 1.893h-4.15c-.417 0-.622.068-.909.369l-2.167 2.14z"></path>
                    </svg>
                    {inlineCommentDtos.length > 0 && <span className="num-comments">({inlineCommentDtos.length})</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
