/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CommonData } from '@/types/common-data';
import type { InlineCommentDto, InlineCommentStatusEnum, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import 'primereact/resources/primereact.min.css'; // core css
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // theme

import React from 'react';
import PureInlineComment from './pure-inline-comment';
import PureInlineCommentForm from './pure-inline-comment-form';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type IPureComments = {
  commonData: CommonData;
  report: ReportDTO;
  channelMembers: TeamMember[];
  comments: InlineCommentDto[];
  hasPermissionCreateComment: boolean;
  hasPermissionDeleteComment: boolean;
  createInlineComment: (user_ids: string[], text: string, parent_id: string | null) => void;
  updateInlineComment: (originalComment: InlineCommentDto, id: string, user_ids: string[], text: string, status: InlineCommentStatusEnum) => void;
  deleteComment: (id: string) => void;
  isLastVersion: boolean;
  showCreateNewComment: boolean;
  showToaster: (message: string, icon: JSX.Element) => void;
};

const PureInlineComments = (props: IPureComments) => {
  const {
    comments,
    commonData,
    report,
    channelMembers,
    hasPermissionDeleteComment,
    hasPermissionCreateComment,
    deleteComment,
    createInlineComment,
    updateInlineComment,
    isLastVersion,
    showCreateNewComment,
    showToaster,
  } = props;
  return (
    <div className={classNames('w-full flex flex-col')}>
      <div className="flex flex-col">
        {comments &&
          comments.map((inlineComment: InlineCommentDto) => (
            <React.Fragment key={inlineComment.id}>
              <PureInlineComment
                hasPermissionDeleteComment={hasPermissionDeleteComment}
                channelMembers={channelMembers}
                comment={inlineComment}
                report={report}
                hasPermissionCreateComment={hasPermissionCreateComment}
                commonData={commonData}
                deleteComment={deleteComment}
                createInlineComment={createInlineComment}
                updateInlineComment={updateInlineComment}
                parentInlineComment={null}
                isLastVersion={isLastVersion}
                showToaster={showToaster}
              />
              {inlineComment.inline_comments.map((childComment: InlineCommentDto) => (
                <PureInlineComment
                  key={childComment.id}
                  hasPermissionDeleteComment={hasPermissionDeleteComment}
                  channelMembers={channelMembers}
                  comment={childComment}
                  report={report}
                  hasPermissionCreateComment={hasPermissionCreateComment}
                  commonData={commonData}
                  deleteComment={deleteComment}
                  createInlineComment={createInlineComment}
                  updateInlineComment={updateInlineComment}
                  parentInlineComment={inlineComment}
                  isLastVersion={isLastVersion}
                  showToaster={showToaster}
                />
              ))}
            </React.Fragment>
          ))}
      </div>
      {commonData.user && hasPermissionCreateComment && isLastVersion && showCreateNewComment && (
        <div className={clsx({ 'mt-20': comments && comments.length > 0 })}>
          <PureInlineCommentForm
            user={commonData.user}
            submitComment={(text: string, userIds: string[]) => {
              createInlineComment(userIds, text, null);
            }}
            channelMembers={channelMembers}
          />
        </div>
      )}
    </div>
  );
};

export default PureInlineComments;
