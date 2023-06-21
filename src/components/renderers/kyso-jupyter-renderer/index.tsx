/* eslint-disable react/self-closing-comp */
import type { CommonData } from '@/types/common-data';
import type { InlineCommentDto, InlineCommentStatusEnum, Relations, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
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
  relations: Relations;
  createInlineComment: (cell_id: string, user_ids: string[], text: string, parent_id: string | null) => void;
  updateInlineComment: (originalComment: InlineCommentDto, id: string, user_ids: string[], text: string, status: InlineCommentStatusEnum) => void;
  deleteInlineComment: (id: string) => void;
  hasPermissionCreateInlineComment: boolean;
  hasPermissionEditInlineComment: boolean;
  hasPermissionDeleteInlineComment: boolean;
  hasPermissionUpdateStatusInlineComment: boolean;
  isLastVersion: boolean;
  showToaster: (message: string, icon: JSX.Element) => void;
}

export const RenderJupyter = ({
  commonData,
  report,
  channelMembers,
  jupyterNotebook,
  showInputs,
  showOutputs,
  inlineComments,
  relations,
  createInlineComment,
  deleteInlineComment,
  onlyVisibleCell,
  updateInlineComment,
  hasPermissionCreateInlineComment,
  hasPermissionEditInlineComment,
  hasPermissionDeleteInlineComment,
  hasPermissionUpdateStatusInlineComment,
  isLastVersion,
  showToaster,
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
            relations={relations}
            createInlineComment={(user_ids: string[], text: string, parent_id: string | null) => createInlineComment(key, user_ids, text, parent_id)}
            deleteInlineComment={deleteInlineComment}
            updateInlineComment={updateInlineComment}
            hasPermissionCreateInlineComment={hasPermissionCreateInlineComment}
            hasPermissionEditInlineComment={hasPermissionEditInlineComment}
            hasPermissionDeleteInlineComment={hasPermissionDeleteInlineComment}
            hasPermissionUpdateStatusInlineComment={hasPermissionUpdateStatusInlineComment}
            isLastVersion={isLastVersion}
            showToaster={showToaster}
          />
        );
      })}
    </React.Fragment>
  );
};
