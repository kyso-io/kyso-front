import checkPermissions from '@/helpers/check-permissions';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { useCommonData } from '@/hooks/use-common-data';
import type { CommonData } from '@/hooks/use-common-data';
import {
  createCommentAction,
  fetchReportCommentsAction,
  fetchTeamAssigneesAction,
  selectCommentsById,
  selectCurrentUserPermissions,
  selectFirstSearchResult,
  updateCommentAction,
} from '@kyso-io/kyso-store';
import { useUser } from '@/hooks/use-user';
import { useState, useMemo, useEffect } from 'react';
import type { Comment, User } from '@kyso-io/kyso-model';
import PureCommentInput from '@/components/PureCommentInput';
import classNames from '@/helpers/class-names';
import { PureSpinner } from '@/components/PureSpinner';

type IUnpureCommentForm = {
  parentId?: string;
  id?: string;
  onCancel?: () => void;
  onSubmitted?: () => void;
  showPostButton?: boolean;
};

const UnpureCommentForm = (props: IUnpureCommentForm) => {
  const { parentId, id, onCancel = () => {}, onSubmitted = () => {}, showPostButton = true } = props;
  const dispatch = useAppDispatch();
  const [suggestions, setSuggestions] = useState([]);

  const commonData: CommonData = useCommonData();

  let initialValue = '';
  const comment: Comment | null = useAppSelector((state) => (id ? selectCommentsById(state, id) : null));
  if (comment) {
    initialValue = comment.text;
  }

  const parentComment: Comment | null = useAppSelector((state) => (parentId ? selectCommentsById(state, parentId) : null));
  const commentUser: User | null = useAppSelector((state) => (parentComment ? state.user.entities[parentComment.user_id] : null));

  const [mentions, setMentions] = useState<string[]>([]);
  const [value, setValue] = useState(initialValue);
  const [plainText, setPlainText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const report = useAppSelector(selectFirstSearchResult);
  const user = useUser();

  const currentUserPermissions = useAppSelector(selectCurrentUserPermissions);

  let isUserAuthor = false;
  if (user && user.id === comment?.user_id) {
    isUserAuthor = true;
  }

  const hasPermissionCreateComment = useMemo(() => {
    return checkPermissions(commonData.organization, commonData.team, currentUserPermissions, 'KYSO_IO_CREATE_COMMENT');
  }, [commonData.organization, commonData.team, currentUserPermissions]);

  useEffect(() => {
    if (!report) {
      return;
    }
    if (commonData.team?.id) {
      const getAssigneess = async () => {
        try {
          const result = await dispatch(fetchTeamAssigneesAction(commonData.team.id!));
          if (result.payload) {
            setSuggestions(result.payload);
          }
        } catch (e) {
          // console.log(e);
        }
      };
      getAssigneess();
    }
  }, [report?.id, commonData.team?.id]);

  const handleClick = async () => {
    setIsLoading(true);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const newCommentDTO: any = {
      text: value,
      plain_text: plainText,
      user_id: user.id,
      comment_id: parentId!,
      user_ids: mentions,
    };

    if (report) {
      newCommentDTO.report_id = report.id as string;
    }

    if (id) {
      await dispatch(updateCommentAction({ commentId: id, comment: newCommentDTO as Comment }));
    } else {
      await dispatch(createCommentAction(newCommentDTO as Comment));
    }

    if (report) {
      await dispatch(
        fetchReportCommentsAction({
          reportId: report.id as string,
          sort: '-created_at',
        }),
      );
    }

    setIsLoading(false);
    onSubmitted();
    setValue('');
  };

  let message = 'Write a new comment';

  if (id) {
    message = 'Edit comment';
  }
  if (parentId) {
    message = `Replying to ${isUserAuthor ? 'You' : commentUser && commentUser.display_name}`;
  }

  return (
    <div className={classNames(parentId ? 'mt-2' : '')}>
      <div>
        <div>
          {hasPermissionCreateComment ? (
            <PureCommentInput
              text={value}
              placeholder={message}
              suggestions={suggestions}
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
          {(id || parentId) && (
            <button className="hover:underline text-sm" onClick={onCancel}>
              Cancel
            </button>
          )}
          {showPostButton && hasPermissionCreateComment && (
            <button
              className={classNames(
                'inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-0',
                value.length === 0 ? 'bg-indigo-400 text-gray-200' : 'bg-indigo-600  hover:bg-indigo-700',
              )}
              onClick={handleClick}
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
