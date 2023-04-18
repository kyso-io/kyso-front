/* eslint-disable react/self-closing-comp */
import type { CommonData } from '@/types/common-data';
import type { InlineCommentDto, InlineCommentStatusEnum, ReportDTO, TableOfContentEntryDto, TeamMember } from '@kyso-io/kyso-model';
import React from 'react';
import TableOfContents from '../../TableOfContents';
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
  toc: TableOfContentEntryDto[];
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
  toc,
}: Props) => {
  if (!jupyterNotebook || !jupyterNotebook.cells || jupyterNotebook.cells.length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      {toc && toc.length > 0 && <TableOfContents title="Table of Contents" toc={toc} collapsible={false} openInNewTab={false} stickToRight={true} />}
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
          />
        );
      })}
    </React.Fragment>
  );
};
