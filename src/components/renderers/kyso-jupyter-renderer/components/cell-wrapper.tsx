import PureInlineComments from '@/components/inline-comments/components/pure-inline-comments';
import { Helper } from '@/helpers/Helper';
import { useNavigateToHashOnce } from '@/hooks/use-navigate-to-hash-once';
import type { CommonData } from '@/types/common-data';
import { InformationCircleIcon, LinkIcon } from '@heroicons/react/outline';
import type { InlineCommentDto, InlineCommentStatusEnum, Relations, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { Tooltip } from 'primereact/tooltip';
import React, { useMemo, useRef, useState } from 'react';
import { useHover } from 'usehooks-ts';
import KAddTasksIcon from '../../../../icons/KAddTaskIcon';
import type { ReportContext } from '../../kyso-markdown-renderer/interfaces/context';
import type { Cell as ICell } from '../interfaces/jupyter-notebook';
import Cell from './cell';

interface Props {
  commonData: CommonData;
  report: ReportDTO;
  channelMembers: TeamMember[];
  index: number;
  cell: ICell;
  showInputs: boolean;
  navigatetoSelf?: boolean;
  showOutputs: boolean;
  first: boolean;
  last: boolean;
  inlineComments: InlineCommentDto[];
  relations: Relations;
  createInlineComment: (user_ids: string[], text: string, parent_id: string | null) => void;
  updateInlineComment: (originalComment: InlineCommentDto, id: string, user_ids: string[], text: string, status: InlineCommentStatusEnum) => void;
  deleteInlineComment: (id: string) => void;
  hasPermissionCreateInlineComment: boolean;
  hasPermissionEditInlineComment: boolean;
  hasPermissionDeleteInlineComment: boolean;
  hasPermissionUpdateStatusInlineComment: boolean;
  onlyVisibleCell?: string;
  isLastVersion: boolean;
  showToaster: (message: string, icon: JSX.Element) => void;
}

const CellWrapper = (props: Props) => {
  const {
    index,
    cell,
    inlineComments,
    relations,
    showInputs,
    showOutputs,
    commonData,
    report,
    onlyVisibleCell,
    channelMembers,
    hasPermissionCreateInlineComment,
    hasPermissionEditInlineComment,
    hasPermissionDeleteInlineComment,
    hasPermissionUpdateStatusInlineComment,
    createInlineComment,
    updateInlineComment,
    deleteInlineComment,
    isLastVersion,
    showToaster,
  } = props;
  const router = useRouter();
  const reportContext: ReportContext = {
    organizationSlug: commonData.organization?.sluglified_name!,
    teamSlug: commonData.team?.sluglified_name!,
    reportSlug: Helper.slugify(report.title),
    version: report.last_version,
  };
  const inlineCommentDtos: InlineCommentDto[] = inlineComments.filter((inlineComment: InlineCommentDto) => inlineComment.cell_id === cell.id);
  const [showCreateNewComment, setShowCreateNewComment] = useState<boolean>(false);

  useNavigateToHashOnce({ active: true });

  const showCreateInlineComment: boolean = useMemo(() => {
    /* eslint-disable no-prototype-builtins */
    if (!cell.hasOwnProperty('id') || !cell.id) {
      return false;
    }
    if (!commonData.user || !isLastVersion) {
      return false;
    }
    return true;
  }, [commonData, cell, isLastVersion]);

  const hoverRef = useRef(null);
  const isHover = useHover(hoverRef);

  if (onlyVisibleCell && onlyVisibleCell !== cell?.id) {
    return <div />;
  }

  return (
    <div
      ref={hoverRef}
      className={clsx('w-full flex lg:flex-row flex-col lg:space-y-0 break-words', isHover && !onlyVisibleCell ? 'border border-inherit border-dashed' : 'border border-transparent')}
      id={cell?.id}
    >
      <div className={clsx('w-9/12')}>
        <Cell index={index} cell={cell} showInput={showInputs} showOutput={showOutputs} context={reportContext} />
      </div>
      <div className={clsx('w-3/12')}>
        <div className="ml-1">
          <div className={clsx('flex flex-row w-fit rounded divide-x divide-x-1', isHover ? 'border bg-gray-50' : '')} style={{ height: isHover ? 'auto' : '34px' }}>
            {isHover && (
              <React.Fragment>
                {showCreateInlineComment && (
                  <React.Fragment>
                    <Tooltip target="#showCreateNewTask" autoHide position="bottom" content="Create a new task" />
                    <button
                      id="showCreateNewTask"
                      className={clsx('h-8 max-w-12 flex p-2 items-center justify-center text-xs text-gray-500', 'hover:bg-gray-300')}
                      onClick={() => {
                        if (showCreateNewComment) {
                          return;
                        }
                        setShowCreateNewComment(true);
                      }}
                    >
                      <KAddTasksIcon className="w-6 h-6" />
                    </button>
                  </React.Fragment>
                )}
                {!showCreateInlineComment && commonData.user && inlineComments.length > 0 && (
                  <div className="relative items-center flex flex-row w-full justify-start">
                    <Tooltip target=".overlay-inline-comments-info" />
                    <button
                      data-pr-position="bottom"
                      data-pr-tooltip="You can not create, edit, change the status or delete tasks in lower versions of the report."
                      type="button"
                      className="overlay-inline-comments-info p-1 border h-fit rounded-md text-gray-900 hover:text-gray-700 focus:outline-none focus:ring-0 hover:bg-gray-50"
                    >
                      <InformationCircleIcon className="h-6 w-6" aria-hidden="true" color="gray" />
                    </button>
                  </div>
                )}
                {cell?.id && (
                  <React.Fragment>
                    <Tooltip target="#openLinkButton" autoHide position="bottom" content="Open link to this cell in a new window" />
                    <a
                      onClick={() => {
                        router.query.cell = cell?.id;
                        router.push(router);
                      }}
                      id="openLinkButton"
                      className={clsx('h-8 max-w-12 flex p-2 items-center justify-center text-xs text-gray-500 hover:bg-gray-300 cursor-pointer')}
                    >
                      <LinkIcon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
          </div>
          <PureInlineComments
            commonData={commonData}
            report={report}
            channelMembers={channelMembers}
            hasPermissionCreateInlineComment={hasPermissionCreateInlineComment}
            hasPermissionEditInlineComment={hasPermissionEditInlineComment}
            hasPermissionDeleteInlineComment={hasPermissionDeleteInlineComment}
            hasPermissionUpdateStatusInlineComment={hasPermissionUpdateStatusInlineComment}
            comments={inlineCommentDtos}
            relations={relations}
            createInlineComment={(user_ids: string[], text: string, parent_id: string | null) => {
              createInlineComment(user_ids, text, parent_id);
              setShowCreateNewComment(false);
            }}
            updateInlineComment={updateInlineComment}
            deleteComment={deleteInlineComment}
            isLastVersion={isLastVersion}
            showCreateNewComment={showCreateNewComment}
            setShowCreateNewComment={setShowCreateNewComment}
            showToaster={showToaster}
          />
        </div>
      </div>
    </div>
  );
};

export default CellWrapper;
