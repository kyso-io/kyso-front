/* eslint-disable import/no-cycle */
/* eslint-disable no-restricted-globals */

import React, { useState } from 'react';
import type { CommonData } from '@/types/common-data';
import moment from 'moment';
import type { ReportDTO, TeamMember, InlineCommentDto } from '@kyso-io/kyso-model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import { RenderMarkdown } from '@/components/renderers/kyso-markdown-renderer';
import PureAvatar from '@/components/PureAvatar';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import PureCommentForm from './pure-comment-form';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type IPureComment = {
  hasPermissionCreateComment: boolean;
  hasPermissionDeleteComment: boolean;
  commonData: CommonData;
  comment: InlineCommentDto;
  channelMembers: TeamMember[];
  onCancel?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitComment: (text: string, user_ids: string[], commentId?: string) => void;
  report: ReportDTO;
  onDeleteComment: (id: string) => void;
};

const PureComment = (props: IPureComment) => {
  const { commonData, submitComment, report, channelMembers, onDeleteComment, hasPermissionDeleteComment, hasPermissionCreateComment, comment } = props;

  console.log(report.id);

  const [isEditing, setIsEditing] = useState(false);

  let isUserAuthor = false;
  if (commonData.user && commonData.user.id === comment?.user_id) {
    isUserAuthor = true;
  }

  return (
    <div className="not-prose">
      {comment && isEditing ? (
        <PureCommentForm
          user={commonData.user!}
          submitComment={submitComment}
          comment={comment}
          channelMembers={channelMembers}
          onSubmitted={() => setIsEditing(!isEditing)}
          onCancel={() => setIsEditing(!isEditing)}
          hasPermissionCreateComment={hasPermissionCreateComment}
        />
      ) : (
        <div className={classNames('flex py-2 border rounded my-1 px-4 flex-col')}>
          <div className="flex flex-row justify-end space-x-2 text-xs font-light text-gray-400">
            {isUserAuthor && hasPermissionCreateComment && (
              <button className="hover:underline" onClick={() => setIsEditing(!isEditing)}>
                Edit
              </button>
            )}
            {(isUserAuthor || hasPermissionDeleteComment) && (
              <button
                className="hover:underline"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this comment?')) {
                    onDeleteComment(comment.id as string);
                  }
                }}
              >
                Delete
              </button>
            )}
          </div>
          <RenderMarkdown source={comment?.text} />

          <div className="pt-0 rounded-t flex items-center justify-start space-x-2 text-xs font-light text-gray-400">
            <PureAvatar src={comment?.user_avatar} title={comment?.user_name} size={TailwindHeightSizeEnum.H5} textSize={TailwindFontSizeEnum.SM} />
            <div>
              {isUserAuthor ? 'You' : comment?.user_name}
              {comment?.created_at ? ` wrote ${moment(new Date(comment.created_at)).fromNow()}` : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PureComment;
