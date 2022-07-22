/* eslint-disable import/no-cycle */
/* eslint-disable no-restricted-globals */

import { PureSpinner } from '@/components/PureSpinner';
import checkPermissions from '@/helpers/check-permissions';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { deleteCommentAction, selectCommentsById, selectCurrentUserPermissions } from '@kyso-io/kyso-store';
import { useCommonData } from '@/hooks/use-common-data';
import type { CommonData } from '@/hooks/use-common-data';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { formatRelative } from 'date-fns';
import classNames from '@/helpers/class-names';
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
  parentId?: string;
  id?: string;
  onCancel?: () => void;
  showPostButton?: boolean;
};

const UnpureComment = (props: IUnpureComment) => {
  const { parentId, id, showPostButton = true } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const commonData: CommonData = useCommonData();
  const user = useUser();
  const dispatch = useAppDispatch();

  const comment = useAppSelector((state) => selectCommentsById(state, id as string));
  const currentUserPermissions = useAppSelector(selectCurrentUserPermissions);
  const commentUser = useAppSelector((state) => {
    return comment && state.user.entities[comment.user_id];
  });

  let isUserAuthor = false;
  if (user && user.id === comment?.user_id) {
    isUserAuthor = true;
  }

  const onDeleteComment = async () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await dispatch(deleteCommentAction(comment!.id as string));
    }
  };

  const hasPermissionCreateComment = useMemo(() => {
    return checkPermissions(commonData.organization, commonData.team, currentUserPermissions, 'KYSO_IO_CREATE_COMMENT');
  }, [commonData.organization, commonData.team, currentUserPermissions]);

  const hasPermissionDeleteComment = useMemo(() => {
    return checkPermissions(commonData.organization, commonData.team, currentUserPermissions, 'KYSO_IO_DELETE_COMMENT');
  }, [commonData.organization, commonData.team, currentUserPermissions]);

  return (
    <>
      {comment && isEditing ? (
        <UnpureCommentForm id={comment.id} onSubmitted={() => setIsEditing(!isEditing)} onCancel={() => setIsEditing(!isEditing)} showPostButton={showPostButton} />
      ) : (
        <div className={classNames('flex flex-col space-y-2', parentId ? 'ml-4' : '')}>
          <div className="">
            <KysoMarkdownRenderer source={comment?.text} />
          </div>

          <div className="pt-0 rounded-t flex items-center space-x-2 text-sm font-light text-gray-400">
            <div>
              <img className="m-0 inline-block h-7 w-7 rounded-full" src={commentUser.avatar_url} alt="" />
            </div>
            <div className="ml-2">
              {isUserAuthor ? 'You' : commentUser && commentUser.display_name}
              {comment?.created_at ? ` wrote ${formatRelative(new Date(comment.created_at), new Date())}` : ''}
            </div>
            <div></div>

            <div className="space-x-2">
              {isUserAuthor && showPostButton && (
                <button className="hover:underline font-medium" onClick={() => setIsEditing(!isEditing)}>
                  Edit
                </button>
              )}
              {(isUserAuthor || hasPermissionDeleteComment) && (
                <button className="hover:underline font-medium" onClick={() => onDeleteComment()}>
                  Delete
                </button>
              )}
              {showPostButton && (
                <button
                  className="hover:underline font-medium"
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
            </div>
          </div>
        </div>
      )}
      {comment && isReplying && (
        <div>
          <UnpureCommentForm parentId={comment.id} onCancel={() => setIsReplying(!isReplying)} onSubmitted={() => setIsReplying(!isReplying)} showPostButton={showPostButton} />
        </div>
      )}

      {comment && <UnpureComments parentId={comment.id} showPostButton={showPostButton} />}
    </>
  );
};

export default UnpureComment;
