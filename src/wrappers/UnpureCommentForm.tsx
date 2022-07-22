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
import type { Comment } from '@kyso-io/kyso-model';
import PureCommentInput from '@/components/PureCommentInput';
import classNames from '@/helpers/ClassNames';

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
  const comment = useAppSelector((state) => id && selectCommentsById(state, id));
  if (comment) {
    initialValue = comment.text;
  }

  const [mentions, setMentions] = useState<string[]>([]);
  const [value, setValue] = useState(initialValue);
  const [plainText, setPlainText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const report = useAppSelector(selectFirstSearchResult);
  const user = useUser();
  const currentUserPermissions = useAppSelector(selectCurrentUserPermissions);

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
          console.log(e);
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
    message = `Replying`;
  }

  return (
    <div className={classNames('w-full mt-2')}>
      <div className="bg-gray-100 p-3 rounded-t border flex justify-between text-sm font-light text-gray-500">
        {message}
        {(id || parentId) && (
          <button className="hover:underline text-sm" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <div className="bg-white p-3 rounded-b border-x border-b">
        <div>
          {hasPermissionCreateComment ? (
            <PureCommentInput
              text={value}
              placeholder="type your comment here"
              suggestions={suggestions}
              handleInputChange={(newValue, newPlainTextValue, newMentions) => {
                setValue(newValue);
                setPlainText(newPlainTextValue);
                setMentions(newMentions);
              }}
            />
          ) : (
            <div>{user ? 'Sorry, but you don’t have the permission to write a comment' : 'Please, login to write a comment'}</div>
          )}
        </div>

        {showPostButton && (
          <div className="flex justify-end">
            {hasPermissionCreateComment && (
              <button
                className="inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={handleClick}
                disabled={!hasPermissionCreateComment}
              >
                {isLoading ? 'Posting Comment' : 'Post Comment'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnpureCommentForm;
