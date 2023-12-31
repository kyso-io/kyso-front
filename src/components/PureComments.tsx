/* eslint-disable import/no-cycle */
import classNames from '@/helpers/class-names';
import type { CommonData } from '@/types/common-data';
import type { Comment, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import PureComment from './PureComment';
import PureCommentForm from './PureCommentForm';

type IPureComments = {
  parentComment?: Comment;
  hasPermissionCreateComment: boolean;
  hasPermissionDeleteComment: boolean;
  commonData: CommonData;
  report: ReportDTO;
  channelMembers: TeamMember[];
  commentSelectorHook: (id?: string) => Comment[];
  userSelectorHook: (id?: string) => UserDTO | undefined;
  onDeleteComment: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitComment: (newComment: any, parentComment?: any) => void;
  defaultPlaceholderText?: string;
};

const PureComments = (props: IPureComments) => {
  const { commentSelectorHook, submitComment, parentComment, commonData, report, channelMembers, hasPermissionDeleteComment, hasPermissionCreateComment, userSelectorHook, onDeleteComment } = props;
  let comments = commentSelectorHook(parentComment?.id!);

  comments = comments.filter((x) => x.mark_delete_at === null || x.mark_delete_at === undefined);
  return (
    <div className={classNames('w-full flex flex-col', parentComment?.id ? 'pl-10' : '')}>
      {!parentComment && commonData.user != null && (
        <PureCommentForm
          user={commonData.user}
          report={report}
          userSelectorHook={userSelectorHook}
          submitComment={submitComment}
          channelMembers={channelMembers}
          defaultPlaceholderText={props.defaultPlaceholderText}
        />
      )}

      <div className={clsx('flex flex-col', commonData.user === null ? 'mt-6' : '')}>
        {comments &&
          comments.map((comment) => (
            <PureComment
              onDeleteComment={onDeleteComment}
              userSelectorHook={userSelectorHook}
              hasPermissionDeleteComment={hasPermissionDeleteComment}
              channelMembers={channelMembers}
              key={`comment-${comment.id}`}
              submitComment={submitComment}
              comment={comment}
              report={report}
              hasPermissionCreateComment={hasPermissionCreateComment}
              commonData={commonData}
              commentSelectorHook={commentSelectorHook}
            />
          ))}
      </div>
    </div>
  );
};

export default PureComments;
