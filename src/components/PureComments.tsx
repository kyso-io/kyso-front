/* eslint-disable import/no-cycle */
import classNames from '@/helpers/class-names';
import type { CommonData } from '@/hooks/use-common-data';
import type { Comment, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
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
};

const PureComments = (props: IPureComments) => {
  const { commentSelectorHook, submitComment, parentComment, commonData, report, channelMembers, hasPermissionDeleteComment, hasPermissionCreateComment, userSelectorHook, onDeleteComment } = props;
  const comments = commentSelectorHook(parentComment?.id);

  return (
    <div className={classNames('w-full flex flex-col', parentComment?.id ? 'pl-10' : '')}>
      {!parentComment && <PureCommentForm user={commonData.user} report={report} userSelectorHook={userSelectorHook} submitComment={submitComment} channelMembers={channelMembers} />}

      <div className="flex flex-col">
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