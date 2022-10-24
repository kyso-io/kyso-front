/* eslint-disable import/no-cycle */
/* eslint-disable no-restricted-globals */
// eslint-disable-next-line @typescript-eslint/no-explicit-any

import PureAvatar from '@/components/PureAvatar';
import { RenderMarkdown } from '@/components/renderers/kyso-markdown-renderer';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { CommonData } from '@/types/common-data';
import type { InlineCommentDto, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import { GlobalPermissionsEnum, OrganizationPermissionsEnum, TeamPermissionsEnum } from '@kyso-io/kyso-model';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { HelperPermissions } from '../../../helpers/check-permissions';
import PureInlineCommentForm from './pure-inline-comment-form';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type IPureInlineComment = {
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

const PureInlineComment = (props: IPureInlineComment) => {
  const { commonData, submitComment, channelMembers, onDeleteComment, hasPermissionDeleteComment, hasPermissionCreateComment, comment } = props;
  const [isEditing, setIsEditing] = useState(false);
  const isOrgAdmin: boolean = useMemo(() => {
    const copyCommonData: CommonData = { ...commonData, team: null };
    return HelperPermissions.checkPermissions(copyCommonData, GlobalPermissionsEnum.GLOBAL_ADMIN) || HelperPermissions.checkPermissions(copyCommonData, OrganizationPermissionsEnum.ADMIN);
  }, [commonData]);
  const isTeamAdmin: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, TeamPermissionsEnum.ADMIN), [commonData]);
  const isUserAuthor: boolean = commonData.user !== undefined && commonData.user !== null && comment !== null && commonData.user.id === comment.user_id;

  if (comment.markedAsDeleted) {
    return <></>;
  }

  return (
    <div className="not-prose">
      {comment && isEditing ? (
        <PureInlineCommentForm
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
            {((isUserAuthor && hasPermissionDeleteComment) || isOrgAdmin || isTeamAdmin) && (
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

export default PureInlineComment;
