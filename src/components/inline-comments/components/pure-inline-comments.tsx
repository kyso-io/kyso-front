/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CommonData } from '@/types/common-data';
import type { InlineCommentDto, InlineCommentStatusEnum, Relations, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
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
  relations: Relations;
  hasPermissionCreateInlineComment: boolean;
  hasPermissionEditInlineComment: boolean;
  hasPermissionDeleteInlineComment: boolean;
  hasPermissionUpdateStatusInlineComment: boolean;
  createInlineComment: (user_ids: string[], text: string, parent_id: string | null) => void;
  updateInlineComment: (originalComment: InlineCommentDto, id: string, user_ids: string[], text: string, status: InlineCommentStatusEnum) => void;
  deleteComment: (id: string) => void;
  isLastVersion: boolean;
  showCreateNewComment: boolean;
  setShowCreateNewComment: (show: boolean) => void;
  showToaster: (message: string, icon: JSX.Element) => void;
};

const PureInlineComments = (props: IPureComments) => {
  const {
    comments,
    relations,
    commonData,
    report,
    channelMembers,
    hasPermissionCreateInlineComment,
    hasPermissionEditInlineComment,
    hasPermissionDeleteInlineComment,
    hasPermissionUpdateStatusInlineComment,
    deleteComment,
    createInlineComment,
    updateInlineComment,
    isLastVersion,
    showCreateNewComment,
    setShowCreateNewComment,
    showToaster,
  } = props;
  return (
    <div className={classNames('w-full flex flex-col')}>
      <div className="flex flex-col">
        {comments &&
          comments.map((inlineComment: InlineCommentDto) => (
            <React.Fragment key={inlineComment.id}>
              <PureInlineComment
                channelMembers={channelMembers}
                comment={inlineComment}
                relations={relations}
                report={report}
                hasPermissionCreateInlineComment={hasPermissionCreateInlineComment}
                hasPermissionEditInlineComment={hasPermissionEditInlineComment}
                hasPermissionDeleteInlineComment={hasPermissionDeleteInlineComment}
                hasPermissionUpdateStatusInlineComment={hasPermissionUpdateStatusInlineComment}
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
                  channelMembers={channelMembers}
                  comment={childComment}
                  relations={relations}
                  report={report}
                  hasPermissionCreateInlineComment={hasPermissionCreateInlineComment}
                  hasPermissionEditInlineComment={hasPermissionEditInlineComment}
                  hasPermissionDeleteInlineComment={hasPermissionDeleteInlineComment}
                  hasPermissionUpdateStatusInlineComment={hasPermissionUpdateStatusInlineComment}
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
      {commonData.user && hasPermissionCreateInlineComment && isLastVersion && showCreateNewComment && (
        <div className={clsx({ 'mt-10': comments && comments.length > 0 })}>
          <PureInlineCommentForm
            user={commonData.user}
            submitComment={(text: string, userIds: string[]) => createInlineComment(userIds, text, null)}
            onCancel={() => setShowCreateNewComment(false)}
            channelMembers={channelMembers}
          />
        </div>
      )}
    </div>
  );
};

export default PureInlineComments;
