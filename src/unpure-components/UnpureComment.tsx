/* eslint-disable import/no-cycle */
/* eslint-disable no-restricted-globals */

import { PureSpinner } from '@/components/PureSpinner';
import type { CommonData } from '@/hooks/use-common-data';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { formatRelative } from 'date-fns';
import classNames from '@/helpers/class-names';
import type { Comment, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import UnpureCommentForm from './UnpureCommentForm';
import UnpureComments from './UnpureComments';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KysoMarkdownRenderer = dynamic<any>(() => import('@kyso-io/kyso-webcomponents').then((mod) => mod.KysoMarkdownRenderer), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center p-7 w-full">
      <PureSpinner />
    </div>
  ),
});

type IUnpureComment = {
  hasPermissionCreateComment: boolean;
  hasPermissionDeleteComment: boolean;
  commonData: CommonData;
  commentSelectorHook: (id?: string) => Comment[];
  comment: Comment;
  channelMembers: TeamMember[];
  userSelectorHook: (id?: string) => UserDTO | null;
  onCancel?: () => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitComment: (newComment: any, parentComment?: any) => void;
  report: ReportDTO;
  onDeleteComment: (id: string) => void;
};

const UnpureComment = (props: IUnpureComment) => {
  const { commentSelectorHook, commonData, submitComment, report, channelMembers, onDeleteComment, hasPermissionDeleteComment, hasPermissionCreateComment, comment, userSelectorHook } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const commentUser = userSelectorHook(comment?.user_id);

  let isUserAuthor = false;
  if (commonData.user && commonData.user.id === comment?.user_id) {
    isUserAuthor = true;
  }

  return (
    <div className="">
      {comment && isEditing ? (
        <UnpureCommentForm
          report={report}
          user={commonData.user}
          submitComment={submitComment}
          comment={comment}
          channelMembers={channelMembers}
          onSubmitted={() => setIsEditing(!isEditing)}
          onCancel={() => setIsEditing(!isEditing)}
          hasPermissionCreateComment={hasPermissionCreateComment}
          userSelectorHook={userSelectorHook}
        />
      ) : (
        <div className={classNames('flex py-2 border rounded my-1 px-4 flex-col')}>
          <div className="pt-0 rounded-t flex items-center space-x-2 text-sm font-light text-gray-400">
            <div>
              <img className="m-0 inline-block h-8 w-8 rounded-full" src={commentUser?.avatar_url} alt="" />
            </div>
            <div className="font-medium">{isUserAuthor ? 'You' : commentUser?.display_name}</div>

            <div>{comment?.created_at ? ` wrote ${formatRelative(new Date(comment.created_at), new Date())}` : ''}</div>
          </div>
          <div className="pl-10 text-sm">
            <KysoMarkdownRenderer source={comment?.text} />

            <div className="rounded-t flex items-center justify-start space-x-2 text-sm font-light text-gray-400">
              <div className="space-x-2 mt-2">
                {hasPermissionCreateComment && (
                  <button
                    className="hover:underline"
                    onClick={() => {
                      if (!hasPermissionCreateComment) {
                        alert('Sorry, but you do not have the permission to reply to comments.');
                      } else {
                        setIsReplying(!isReplying);
                      }
                    }}
                  >
                    Reply
                  </button>
                )}
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
            </div>
          </div>
        </div>
      )}
      {comment && isReplying && (
        <div>
          <UnpureCommentForm
            user={commonData.user}
            report={report}
            submitComment={submitComment}
            parentComment={comment}
            onCancel={() => setIsReplying(!isReplying)}
            onSubmitted={() => setIsReplying(!isReplying)}
            hasPermissionCreateComment={hasPermissionCreateComment}
            channelMembers={channelMembers}
            userSelectorHook={userSelectorHook}
          />
        </div>
      )}

      {comment && (
        <UnpureComments
          onDeleteComment={onDeleteComment}
          report={report}
          submitComment={submitComment}
          channelMembers={channelMembers}
          userSelectorHook={userSelectorHook}
          commonData={commonData}
          parentComment={comment}
          hasPermissionDeleteComment={hasPermissionDeleteComment}
          hasPermissionCreateComment={hasPermissionCreateComment}
          commentSelectorHook={commentSelectorHook}
        />
      )}
    </div>
  );
};

export default UnpureComment;
