import { useState } from 'react';
import type { Comment, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import PureCommentInput from '@/components/PureCommentInput';
import classNames from '@/helpers/class-names';
import { PureSpinner } from '@/components/PureSpinner';

type IUnpureCommentForm = {
  comment?: Comment;
  parentComment?: Comment;
  onCancel?: () => void;
  report: ReportDTO;
  user: UserDTO;
  onSubmitted?: () => void;
  userSelectorHook: (id?: string) => UserDTO | null;
  hasPermissionCreateComment?: boolean;
  channelMembers: TeamMember[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitComment: (newComment: any, parentComment?: any) => void;
};

const UnpureCommentForm = (props: IUnpureCommentForm) => {
  const { parentComment, comment, submitComment, user, report, channelMembers, onCancel = () => {}, onSubmitted = () => {}, hasPermissionCreateComment = true, userSelectorHook } = props;

  let initialValue = '';
  if (comment) {
    initialValue = comment.text;
  }

  const commentUser = userSelectorHook(parentComment?.user_id);
  const [mentions, setMentions] = useState<string[]>([]);
  const [value, setValue] = useState(initialValue);
  const [plainText, setPlainText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  let isUserAuthor = false;
  if (user && user.id === comment?.user_id) {
    isUserAuthor = true;
  }

  const handleSubmit = async () => {
    setIsLoading(true);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const newCommentDTO: any = {
      text: value,
      plain_text: plainText,
      user_id: user.id,
      comment_id: parentComment?.id,
      user_ids: mentions,
    };

    if (report) {
      newCommentDTO.report_id = report.id as string;
    }

    await submitComment(newCommentDTO, comment);

    setIsLoading(false);
    onSubmitted();
    setValue('');
  };

  let message = 'Write a new comment';

  if (comment?.id) {
    message = 'Edit comment';
  }
  if (parentComment?.id) {
    message = `Replying to ${isUserAuthor ? 'You' : commentUser && commentUser.name}`;
  }

  return (
    <div className={classNames(parentComment?.id ? 'mt-2' : '')}>
      <div>
        <div>
          {hasPermissionCreateComment ? (
            <PureCommentInput
              text={value}
              placeholder={message}
              suggestions={channelMembers}
              handleInputChange={(newValue, newPlainTextValue, newMentions) => {
                setValue(newValue);
                setPlainText(newPlainTextValue);
                setMentions(newMentions);
              }}
            />
          ) : (
            <div>{user ? 'Sorry, but you do not have the permission to write a comment' : 'Please, login to write a comment'}</div>
          )}
        </div>

        <div className="p-2 flex justify-end text-sm text-gray-500 space-x-4">
          {(comment?.id || parentComment?.id) && (
            <button className="hover:underline text-sm" onClick={onCancel}>
              Cancel
            </button>
          )}
          {hasPermissionCreateComment && (
            <button
              className={classNames(
                'inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-0',
                value.length === 0 ? 'bg-indigo-400 text-gray-200' : 'bg-indigo-600  hover:bg-indigo-700',
              )}
              onClick={handleSubmit}
              disabled={!hasPermissionCreateComment || value.length === 0}
            >
              {isLoading && <PureSpinner size={5} />}
              Post Comment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnpureCommentForm;
