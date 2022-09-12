import React, { useState, useRef } from 'react';
import type { InlineCommentDto, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import { ChatAltIcon, CodeIcon, LinkIcon } from '@heroicons/react/outline';
import PureComments from '@/comments-container/components/pure-comments';
import { useHover } from 'usehooks-ts';
import { useNavigateToHashOnce } from '@/hooks/use-navigate-to-hash-once';
import type { CommonData } from '@/types/common-data';
import { Helper } from '@/helpers/Helper';
import Cell from './cell';
import type { Cell as ICell } from '../interfaces/jupyter-notebook';
import type { ReportContext } from '../../kyso-markdown-renderer/interfaces/context';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface Props {
  commonData: CommonData;
  report: ReportDTO;
  channelMembers: TeamMember[];
  cell: ICell;
  showInputs: boolean;
  navigatetoSelf?: boolean;
  showOutputs: boolean;
  first: boolean;
  last: boolean;
  inlineComments: InlineCommentDto[];
  createInlineComment: (cellId: string, user_ids: string[], text: string) => void;
  deleteInlineComment: (id: string) => void;
  editInlineComment: (id: string, user_ids: string[], text: string) => void;
  enabledCreateInlineComment: boolean;
  enabledDeleteInlineComment: boolean;
  enabledEditInlineComment: boolean;
  onlyVisibleCell?: string;
}

const CellWrapper = (props: Props) => {
  const {
    cell,
    inlineComments,
    showInputs,
    showOutputs,
    commonData,
    report,
    onlyVisibleCell,
    first,
    channelMembers,
    enabledCreateInlineComment,
    enabledDeleteInlineComment,
    createInlineComment,
    deleteInlineComment,
    editInlineComment,
  } = props;

  const reportContext: ReportContext = {
    organizationSlug: commonData.organization?.sluglified_name!,
    teamSlug: commonData.team?.sluglified_name!,
    reportSlug: Helper.slugify(report.title),
    version: report.last_version,
  };

  const inlineCommentDtos: InlineCommentDto[] = inlineComments.filter((inlineComment: InlineCommentDto) => inlineComment.cell_id === cell.id);

  const [inputShown, setInputShown] = useState(showInputs);
  const [outputShown, setOutputShown] = useState(showOutputs);
  const [commentsShown, setCommentsShown] = useState(false);

  useNavigateToHashOnce({ active: true });

  const showComments = cell?.id && cell.id.length > 0 && commentsShown;

  // dont both showing the code button for cells without code
  const showCodeToggle = cell?.cell_type === 'code' && (cell.source.length > 0 || (cell?.outputs && cell.outputs.length > 0));

  const hoverRef = useRef(null);
  const isHover = useHover(hoverRef);

  if (onlyVisibleCell && onlyVisibleCell !== cell?.id) {
    return <div />;
  }

  return (
    <div
      ref={hoverRef}
      className={classNames(
        'w-full flex lg:flex-row flex-col lg:space-y-0 p-2 break-all',
        isHover && !onlyVisibleCell && !first ? 'border border-inherit border-dashed' : 'border border-transparent',
        isHover && !onlyVisibleCell && first ? 'border border-inherit border-dashed' : 'border border-transparent',
        // last && !onlyVisibleCell ? "border-b border-b-inherit ": "",
        // onlyVisibleCell ? "border-b border-b-inherit ": "",
      )}
      id={cell?.id}
    >
      <div
        className={classNames(
          'w-9/12',
          // Eoin: I wrote this and I know its ugly code
          // (!onlyVisibleCell && isHover) ? "border-x border-y" : `border-x ${(onlyVisibleCell || last) ? " border-b border-b-inherit" : "border-y border-y-white"}`,
        )}
      >
        <Cell cell={cell} showInput={inputShown} showOutput={outputShown} context={reportContext} />
      </div>

      <div className={classNames('w-3/12 p-[1px]')}>
        <div className={classNames('flex flex-row w-fit mx-2 border rounded divide-x divide-x-1', isHover ? 'bg-gray-50' : '')}>
          {cell?.execution_count && (
            <button className={classNames('h-8 max-w-12 flex p-2 items-center justify-center text-xs text-gray-500', 'hover:bg-gray-200')}>In: [{cell.execution_count}]</button>
          )}

          {cell?.id && (
            <button
              className={classNames('h-8 max-w-12 flex p-2 items-center justify-center text-xs text-gray-500', commentsShown ? 'bg-gray-100 hover:bg-gray-200' : 'hover:bg-gray-50')}
              onClick={() => setCommentsShown(!commentsShown)}
            >
              <ChatAltIcon className="h-4 w-4 mr-1" aria-hidden="true" />
              {inlineCommentDtos.length > 0 && <span>{inlineCommentDtos.length}</span>}
            </button>
          )}

          {cell?.id && (
            <a
              className={classNames('h-8 max-w-12 flex p-2 items-center justify-center text-xs text-gray-500', inputShown ? 'bg-gray-100 hover:bg-gray-200' : 'hover:bg-gray-50')}
              href={`?cell=${cell?.id}`}
              // onClick={() => {
              //   if (cell?.id) {
              //     window.location.hash = cell?.id
              //   }
              // }}
            >
              <LinkIcon className="h-4 w-4" aria-hidden="true" />
            </a>
          )}

          {showCodeToggle && (
            <button
              className={classNames('h-8 max-w-12 flex p-2 items-center justify-center text-xs text-gray-500', inputShown ? 'bg-gray-100 hover:bg-gray-200' : 'hover:bg-gray-50')}
              onClick={() => {
                setInputShown(!inputShown);
                setOutputShown(!outputShown);
              }}
            >
              <CodeIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {showComments && (
          <PureComments
            commonData={commonData}
            report={report}
            channelMembers={channelMembers}
            hasPermissionCreateComment={enabledCreateInlineComment}
            hasPermissionDeleteComment={enabledDeleteInlineComment}
            comments={inlineCommentDtos}
            onDeleteComment={(commentId) => {
              deleteInlineComment(commentId);
            }}
            submitComment={(text?: string, user_ids?: string[], commentId?: string) => {
              if (!commentId) {
                createInlineComment(cell.id, user_ids!, text!);
              } else {
                editInlineComment(commentId, user_ids!, text!);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CellWrapper;
