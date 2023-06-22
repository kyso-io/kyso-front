/* eslint-disable react/self-closing-comp */
import type { CommonData } from '@/types/common-data';
import { Switch } from '@headlessui/react';
import type { InlineCommentDto, InlineCommentStatusEnum, Relations, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import { useState } from 'react';
import CellWrapper from './components/cell-wrapper';
import type { Cell as ICell, JupyterNotebook } from './interfaces/jupyter-notebook';

interface Props {
  commonData: CommonData;
  report: ReportDTO;
  channelMembers: TeamMember[];
  jupyterNotebook: JupyterNotebook;
  onlyVisibleCell?: string;
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
  const [showInputs, setShowInputs] = useState<boolean>(false);

  if (!jupyterNotebook || !jupyterNotebook.cells || jupyterNotebook.cells.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="w-full flex lg:flex-row flex-col lg:space-y-0 break-words my-2">
        <div className="w-9/12"></div>
        <div className="w-3/12 flex flex-row items-center">
          <label className="text-sm font-medium text-gray-700 mr-3">Show inputs</label>
          <Switch
            checked={showInputs}
            onChange={setShowInputs}
            className={clsx(
              showInputs ? 'bg-indigo-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
            )}
          >
            <span className="sr-only">Show inputs</span>
            <span
              aria-hidden="true"
              className={clsx(showInputs ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out')}
            />
          </Switch>
        </div>
      </div>
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
            showOutputs={true}
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
    </div>
  );
};
