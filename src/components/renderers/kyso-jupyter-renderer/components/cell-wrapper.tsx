import PureInlineComments from '@/components/inline-comments/components/pure-inline-comments';
import { Helper } from '@/helpers/Helper';
import { useNavigateToHashOnce } from '@/hooks/use-navigate-to-hash-once';
import type { CommonData } from '@/types/common-data';
import { ChatAltIcon, CodeIcon, LinkIcon } from '@heroicons/react/outline';
import type { InlineCommentDto, InlineCommentStatusEnum, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHover } from 'usehooks-ts';
import { Tooltip } from 'primereact/tooltip';
import type { ReportContext } from '../../kyso-markdown-renderer/interfaces/context';
import type { Cell as ICell } from '../interfaces/jupyter-notebook';
import Cell from './cell';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

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
  createInlineComment: (user_ids: string[], text: string, parent_id: string | null) => void;
  updateInlineComment: (originalComment: InlineCommentDto, id: string, user_ids: string[], text: string, status: InlineCommentStatusEnum) => void;
  deleteInlineComment: (id: string) => void;
  enabledCreateInlineComment: boolean;
  enabledDeleteInlineComment: boolean;
  enabledEditInlineComment: boolean;
  onlyVisibleCell?: string;
  isLastVersion: boolean;
  showToaster: (message: string, icon: JSX.Element) => void;
}

const CellWrapper = (props: Props) => {
  const {
    index,
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
    updateInlineComment,
    deleteInlineComment,
    isLastVersion,
    showToaster,
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
  const [commentsShown, setCommentsShown] = useState(true);

  useNavigateToHashOnce({ active: true });

  useEffect(() => {
    const commentsForCurrentCell = inlineComments.filter((inlineComment: InlineCommentDto) => inlineComment.cell_id === cell.id);
    if (inlineComments.length > 0 && commentsForCurrentCell && commentsForCurrentCell.length > 0) {
      setCommentsShown(true);
    } else {
      setCommentsShown(false);
    }
  }, [inlineComments]);

  const showIconComments: boolean = useMemo(() => {
    /* eslint-disable no-prototype-builtins */
    if (!cell.hasOwnProperty('id') || !cell.id) {
      return false;
    }
    if (!commonData.user) {
      // User is not logged, check if there are comments
      return inlineCommentDtos.length > 0;
    }
    return true;
  }, [commonData, cell]);

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
        'w-full flex lg:flex-row flex-col lg:space-y-0 break-words',
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
        <Cell index={index} cell={cell} showInput={inputShown} showOutput={outputShown} context={reportContext} />
      </div>

      <div className={classNames('w-3/12 p-[1px]')}>
        <div className={classNames('flex flex-row w-fit mx-2 border rounded divide-x divide-x-1', isHover ? 'bg-gray-50' : '')}>
          {cell?.execution_count && (
            <>
              <button className={classNames('h-8 max-w-12 flex p-2 items-center justify-center text-xs text-gray-500', 'hover:bg-gray-300')}>In: [{cell.execution_count}]</button>
            </>
          )}

          {showIconComments && (
            <>
              <Tooltip target="#showCommentsButton" autoHide position="bottom" content="Toggle tasks" />
              <button
                id="showCommentsButton"
                className={classNames('h-8 max-w-12 flex p-2 items-center justify-center text-xs text-gray-500', commentsShown ? 'bg-gray-200 hover:bg-gray-300' : 'hover:bg-gray-50')}
                onClick={() => setCommentsShown(!commentsShown)}
              >
                <ChatAltIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                {inlineCommentDtos.length > 0 && <span>{inlineCommentDtos.length}</span>}
              </button>
            </>
          )}

          {cell?.id && (
            <>
              <Tooltip target="#openLinkButton" autoHide position="bottom" content="Open link to this cell in a new window" />
              <a id="openLinkButton" className={classNames('h-8 max-w-12 flex p-2 items-center justify-center text-xs text-gray-500', 'hover:bg-gray-300')} href={`?cell=${cell?.id}`}>
                <LinkIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            </>
          )}

          {showCodeToggle && (
            <>
              <Tooltip target="#showCodeButton" autoHide position="bottom" content="Show code" />
              <button
                id="showCodeButton"
                className={classNames('tooltip-show-code h-8 max-w-12 flex p-2 items-center justify-center text-xs text-gray-500', 'hover:bg-gray-300')}
                onClick={() => {
                  setInputShown(!inputShown);
                  setOutputShown(!outputShown);
                }}
              >
                <CodeIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {commentsShown && (
          <PureInlineComments
            commonData={commonData}
            report={report}
            channelMembers={channelMembers}
            hasPermissionCreateComment={enabledCreateInlineComment}
            hasPermissionDeleteComment={enabledDeleteInlineComment}
            comments={inlineCommentDtos}
            createInlineComment={createInlineComment}
            updateInlineComment={updateInlineComment}
            deleteComment={deleteInlineComment}
            isLastVersion={isLastVersion}
            showCreateNewComment={true}
            showToaster={showToaster}
          />
        )}
      </div>
    </div>
  );
};

export default CellWrapper;
