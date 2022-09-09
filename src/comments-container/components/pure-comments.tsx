/* eslint-disable import/no-cycle */
import type { CommonData } from '@/types/common-data';
import type { InlineCommentDto, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import React from 'react';
import PureComment from './pure-comment';
import PureCommentForm from './pure-comment-form';

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
  onDeleteComment: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitComment: (text: string, user_ids: string[], commentId?: string) => void;
};

const PureComments = (props: IPureComments) => {
  const { comments, submitComment, commonData, report, channelMembers, hasPermissionDeleteComment, hasPermissionCreateComment, onDeleteComment } = props;

  return (
    <div className={classNames('w-full flex flex-col')}>
      <div className="flex flex-col">
        {comments &&
          comments.map((comment) => (
            <PureComment
              onDeleteComment={onDeleteComment}
              hasPermissionDeleteComment={hasPermissionDeleteComment}
              channelMembers={channelMembers}
              key={`comment-${comment.id}`}
              submitComment={submitComment}
              comment={comment}
              report={report}
              hasPermissionCreateComment={hasPermissionCreateComment}
              commonData={commonData}
            />
          ))}
      </div>

      {commonData.user && <PureCommentForm user={commonData.user} submitComment={submitComment} channelMembers={channelMembers} />}
    </div>
  );
};

export default PureComments;
