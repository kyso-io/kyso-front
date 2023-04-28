/* eslint-disable react/self-closing-comp */
import type { CommonData } from '@/types/common-data';
import type { InlineCommentDto, InlineCommentStatusEnum, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import React from 'react';
import CellWrapper from './components/cell-wrapper';
import type { Cell as ICell, JupyterNotebook } from './interfaces/jupyter-notebook';

interface Props {
  commonData: CommonData;
  report: ReportDTO;
  channelMembers: TeamMember[];
  jupyterNotebook: JupyterNotebook;
  onlyVisibleCell?: string;
  showInputs: boolean;
  showOutputs: boolean;
  inlineComments: InlineCommentDto[];
  createInlineComment: (cell_id: string, user_ids: string[], text: string, parent_id: string | null) => void;
  updateInlineComment: (id: string, user_ids: string[], text: string, status: InlineCommentStatusEnum) => void;
  deleteInlineComment: (id: string) => void;
  enabledCreateInlineComment: boolean;
  enabledDeleteInlineComment: boolean;
  enabledEditInlineComment: boolean;
  isLastVersion: boolean;
}

export const RenderJupyter = ({
  commonData,
  report,
  channelMembers,
  jupyterNotebook,
  showInputs,
  showOutputs,
  inlineComments,
  createInlineComment,
  deleteInlineComment,
  onlyVisibleCell,
  updateInlineComment,
  enabledCreateInlineComment,
  enabledDeleteInlineComment,
  enabledEditInlineComment,
  isLastVersion,
}: Props) => {
  if (!jupyterNotebook || !jupyterNotebook.cells || jupyterNotebook.cells.length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      {jupyterNotebook.cells.map((cell: ICell, index: number) => {
        const key: string = cell?.id && cell.id.length > 0 ? cell.id : index.toString();

        return (
          <CellWrapper
            index={index}
            key={key}
            onlyVisibleCell={onlyVisibleCell}
            last={index + 1 === jupyterNotebook.cells.length}
            first={index === 0}
            commonData={commonData}
            report={report}
            channelMembers={channelMembers}
            cell={cell}
            showInputs={showInputs}
            showOutputs={showOutputs}
            inlineComments={inlineComments}
            createInlineComment={(user_ids: string[], text: string, parent_id: string | null) => createInlineComment(key, user_ids, text, parent_id)}
            deleteInlineComment={deleteInlineComment}
            updateInlineComment={updateInlineComment}
            enabledCreateInlineComment={enabledCreateInlineComment}
            enabledDeleteInlineComment={enabledDeleteInlineComment}
            enabledEditInlineComment={enabledEditInlineComment}
            isLastVersion={isLastVersion}
          />
        );
      })}
    </React.Fragment>
  );
};
