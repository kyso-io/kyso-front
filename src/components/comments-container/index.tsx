/* eslint-disable @typescript-eslint/no-explicit-any */
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { InlineCommentDto } from '@kyso-io/kyso-model';
import React, { useEffect, useMemo, useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import CellCommentContainer from './components/cell-comment-container';
import CellCommentInput from './components/cell-comment-input';
import CellShowMoreComments from './components/cell-show-more-comments';

interface Props {
  userId: string;
  avatarUrl: string;
  inlineCommentDtos: InlineCommentDto[];
  createInlineComment: (text: string) => void;
  editInlineComment: (commentId: string, text: string) => void;
  deleteInlineComment: (commentId: string) => void;
  onClose: () => void;
  enabledCreateInlineComment: boolean;
  enabledDeleteInlineComment: boolean;
  enabledEditInlineComment: boolean;
}

const CellCommentsContainer = ({
  userId,
  inlineCommentDtos,
  avatarUrl,
  createInlineComment,
  editInlineComment,
  deleteInlineComment,
  onClose,
  enabledCreateInlineComment,
  enabledDeleteInlineComment,
  enabledEditInlineComment,
}: Props) => {
  const [focused, setFocused] = useState<boolean>(false);
  const [showCommentsSummary, setShowCommentsSummary] = useState<boolean>(true);
  const components: any[] = useMemo(() => {
    const fnComponents: any[] = [];
    let numHiddenComments: number = 0;
    inlineCommentDtos.forEach((inlineCommentDto: InlineCommentDto, index: number) => {
      if (!showCommentsSummary || index === 0 || index === inlineCommentDtos.length - 1) {
        fnComponents.push(
          <CellCommentContainer
            key={inlineCommentDto.id}
            userId={userId}
            inlineCommentDto={inlineCommentDto}
            editInlineComment={(text: string) => editInlineComment(inlineCommentDto.id, text)}
            deleteInlineComment={() => deleteInlineComment(inlineCommentDto.id)}
            enabledDeleteInlineComment={enabledDeleteInlineComment}
            enabledEditInlineComment={enabledEditInlineComment}
          />,
        );
      } else {
        numHiddenComments += 1;
      }
    });
    if (showCommentsSummary && numHiddenComments > 0) {
      fnComponents.splice(1, 0, <CellShowMoreComments key="cellShowMoreComments" numComments={numHiddenComments} showAllComments={() => setShowCommentsSummary(false)} />);
    }
    return fnComponents;
  }, [inlineCommentDtos, showCommentsSummary]);

  useEffect(() => {
    if (!focused) {
      if (inlineCommentDtos.length > 2) {
        setShowCommentsSummary(true);
      }
    } else {
      setShowCommentsSummary(false);
    }
  }, [focused, inlineCommentDtos]);

  return (
    <OutsideClickHandler
      onOutsideClick={(e: any) => {
        if (e?.target?.classList && Array.isArray(e.target.classList) && e.target.classList.indexOf('overlay') > -1) {
          return;
        }
        if (focused) {
          setFocused(false);
        }
      }}
    >
      <div
        className="comments-container position-relative d-flex flex-column"
        onClick={() => {
          if (!focused) {
            setFocused(true);
          }
        }}
      >
        <div className="d-flex justify-content-end">
          <FontAwesomeIcon icon={faXmark} color="#CACAC7" title="Hide comments" onClick={onClose} />
        </div>
        {components.length === 0 && !enabledCreateInlineComment ? <div className="no-comments">There are has no comments</div> : components}
        {enabledCreateInlineComment && <CellCommentInput numComments={inlineCommentDtos.length} avatarUrl={avatarUrl} createInlineComment={createInlineComment} parentFocused={focused} />}
      </div>
    </OutsideClickHandler>
  );
};

export default CellCommentsContainer;
