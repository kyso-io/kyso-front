/* eslint-disable import/no-cycle */
/* eslint-disable no-restricted-globals */

import PureAvatar from '@/components/PureAvatar';
import PureCommentForm from '@/components/PureCommentForm';
import PureComments from '@/components/PureComments';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { CommonData } from '@/types/common-data';
import type { Comment, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import { formatDistanceToNow } from 'date-fns';
import { useMemo, useState } from 'react';
import { RenderMarkdown } from './renderers/kyso-markdown-renderer';
import { Helper } from '../helpers/Helper';

type IPureComment = {
  hasPermissionCreateComment: boolean;
  hasPermissionDeleteComment: boolean;
  commonData: CommonData;
  commentSelectorHook: (id?: string) => Comment[];
  comment: Comment;
  channelMembers: TeamMember[];
  userSelectorHook: (id?: string) => UserDTO | undefined;
  onCancel?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitComment: (newComment: any, parentComment?: any) => void;
  report: ReportDTO;
  onDeleteComment: (id: string) => void;
};

const PureComment = (props: IPureComment) => {
  const { commentSelectorHook, commonData, submitComment, report, channelMembers, onDeleteComment, hasPermissionDeleteComment, hasPermissionCreateComment, comment, userSelectorHook } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const commentText: string = useMemo(() => {
    if (!comment || !comment.text) {
      return '';
    }
    const mentionedUsers: UserDTO[] = [];
    for (const userId of comment.user_ids) {
      const user: UserDTO | undefined = userSelectorHook(userId);
      if (user) {
        mentionedUsers.push(user);
      }
    }
    return comment.text.replace(/@([a-z0-9_-]+)/gi, (match: string, displayNameSlug: string): string => {
      const mentionedUser: UserDTO | undefined = mentionedUsers.find((u: UserDTO) => Helper.slug(u.display_name) === displayNameSlug);
      if (mentionedUser) {
        return `[${match}](/user/${mentionedUser.username})`;
      }
      return match;
    });
  }, [comment]);

  const commentUser: UserDTO | undefined = userSelectorHook(comment?.user_id);

  let isUserAuthor = false;
  if (commonData.user && commonData.user.id === comment?.user_id) {
    isUserAuthor = true;
  }

  return (
    <div className="flex flex-col space-y-2">
      {commonData.user != null && comment && isEditing ? (
        <PureCommentForm
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
        <div className="flex flex-row space-x-2">
          {commentUser && <PureAvatar src={commentUser.avatar_url} title={commentUser.name} size={TailwindHeightSizeEnum.H8} username={commentUser?.username} textSize={TailwindFontSizeEnum.XS} />}
          <div className="rounded border w-full p-2">
            <div className="flex flex-row justify-between">
              <div className="pt-0 rounded-t flex flex-row items-center space-x-1 text-sm font-light text-gray-400">
                <div className="inline font-medium">{isUserAuthor ? 'You' : commentUser?.display_name}</div>
                <div>{comment?.created_at ? ` wrote ${formatDistanceToNow(new Date(comment?.created_at))} ago` : ''}</div>
              </div>
              <div className="pt-0 rounded-t flex flex-row items-center space-x-2 text-sm font-light text-gray-400">
                {(isUserAuthor || hasPermissionDeleteComment) && (
                  <button
                    className="text-sm
                    font-small
                    rounded-md
                    text-rose-700
                    inline-flex
                    items-center
                    focus:outline-none
                    focus:ring-0
                    border 
                    border-transparent
                    bg-white
                    hover:bg-gray-100
                    px-2.5 py-1.5"
                    onClick={() => {
                      /* eslint-disable no-alert */
                      if (confirm('Are you sure you want to delete this comment?')) {
                        onDeleteComment(comment.id as string);
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
                {isUserAuthor && hasPermissionCreateComment && (
                  <button
                    className="
                      text-sm
                      font-small
                      rounded-md
                      text-gray-500
                      inline-flex
                      items-center
                      focus:outline-none
                      focus:ring-0
                      border 
                      border-transparent
                      bg-white
                      hover:bg-gray-100
                      px-2.5
                      py-1.5"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            <div className="text-sm">
              <RenderMarkdown source={commentText} />

              <div className="rounded-t flex items-center justify-end space-x-2 text-sm text-gray-400">
                <div className="space-x-2 mt-2">
                  {hasPermissionCreateComment && (
                    <button
                      className="
                      text-sm
                      font-small
                      rounded-md
                      text-gray-500
                      inline-flex
                      items-center
                      focus:outline-none
                      focus:ring-0
                      border 
                      border-transparent
                      bg-white
                      hover:bg-gray-100
                      px-2.5
                      py-1.5"
                      onClick={() => {
                        if (!hasPermissionCreateComment) {
                          /* eslint-disable no-alert */
                          alert('Sorry, but you do not have the permission to reply to comments.');
                        } else {
                          setIsReplying(!isReplying);
                        }
                      }}
                    >
                      Reply
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {comment && isReplying && commonData.user && (
        <div style={{ position: 'relative' }}>
          <PureCommentForm
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

      <div className="flex flex-col space-y-2">
        {comment && (
          <PureComments
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
    </div>
  );
};

export default PureComment;
