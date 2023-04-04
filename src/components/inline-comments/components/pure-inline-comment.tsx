/* eslint-disable import/no-cycle */
/* eslint-disable no-restricted-globals */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import PureAvatar from '@/components/PureAvatar';
import { RenderMarkdown } from '@/components/renderers/kyso-markdown-renderer';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { CommonData } from '@/types/common-data';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import type { InlineCommentDto, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import { GlobalPermissionsEnum, InlineCommentStatusEnum, OrganizationPermissionsEnum, TeamPermissionsEnum } from '@kyso-io/kyso-model';
import clsx from 'clsx';
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
  report: ReportDTO;
  createInlineComment: (user_ids: string[], text: string, parent_id: string | null) => void;
  updateInlineComment: (id: string, user_ids: string[], text: string, status: InlineCommentStatusEnum) => void;
  deleteComment: (id: string) => void;
  parentInlineComment: InlineCommentDto | null;
};

const PureInlineComment = (props: IPureInlineComment) => {
  const { commonData, channelMembers, hasPermissionDeleteComment, hasPermissionCreateComment, comment, deleteComment, createInlineComment, updateInlineComment, parentInlineComment, report } = props;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [replying, setReplying] = useState<boolean>(false);
  const isOrgAdmin: boolean = useMemo(() => {
    const copyCommonData: CommonData = { ...commonData, team: null };
    return HelperPermissions.checkPermissions(copyCommonData, GlobalPermissionsEnum.GLOBAL_ADMIN) || HelperPermissions.checkPermissions(copyCommonData, OrganizationPermissionsEnum.ADMIN);
  }, [commonData]);
  const isTeamAdmin: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, TeamPermissionsEnum.ADMIN), [commonData]);
  const isUserAuthor: boolean = useMemo(() => commonData.user !== undefined && commonData.user !== null && comment !== null && commonData.user.id === comment.user_id, [commonData.user, comment]);
  const isClosed: boolean = useMemo(() => {
    if (parentInlineComment) {
      return parentInlineComment.current_status === InlineCommentStatusEnum.CLOSED;
    }
    return comment.current_status === InlineCommentStatusEnum.CLOSED;
  }, [comment, parentInlineComment]);
  const isReportAuthor: boolean = useMemo(() => {
    if (!commonData.user || !comment) {
      return false;
    }
    return report.author_ids.includes(commonData.user.id);
  }, [commonData.user, comment]);
  const canChangeStatus: boolean = useMemo(() => {
    return isUserAuthor || isReportAuthor;
  }, [isUserAuthor, isReportAuthor]);

  if (comment.markedAsDeleted) {
    return null;
  }

  const getTag = (status: InlineCommentStatusEnum) => {
    switch (status) {
      case InlineCommentStatusEnum.OPEN:
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">open</span>;
      case InlineCommentStatusEnum.TO_DO:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300">to do</span>;
      case InlineCommentStatusEnum.DOING:
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-1 rounded-full dark:bg-yellow-900 dark:text-yellow-300">doing</span>;
      case InlineCommentStatusEnum.CLOSED:
        return <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-1 rounded-full dark:bg-red-900 dark:text-red-300">closed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="not-prose">
      {comment && isEditing ? (
        <div className={clsx(parentInlineComment ? 'ml-10' : '')}>
          <PureInlineCommentForm
            user={commonData.user!}
            submitComment={(text: string, userIds: string[], commentId?: string) => updateInlineComment(commentId as string, userIds, text, comment.current_status!)}
            comment={comment}
            channelMembers={channelMembers}
            onSubmitted={() => setIsEditing(!isEditing)}
            onCancel={() => setIsEditing(!isEditing)}
            hasPermissionCreateComment={hasPermissionCreateComment}
          />
        </div>
      ) : (
        <div className={classNames('flex py-2 border rounded my-1 px-4 flex-col', parentInlineComment ? 'ml-10' : '')}>
          <div className="flex flex-row justify-end space-x-2 text-xs font-light text-gray-400">
            {isUserAuthor && hasPermissionCreateComment && !isClosed && (
              <button className="hover:underline" onClick={() => setIsEditing(!isEditing)}>
                Edit
              </button>
            )}
            {((isUserAuthor && hasPermissionDeleteComment) || isOrgAdmin || isTeamAdmin) && !isClosed && (
              <button
                className="hover:underline"
                onClick={() => {
                  /* eslint-disable no-alert */
                  if (confirm('Are you sure you want to delete this comment?')) {
                    deleteComment(comment.id as string);
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
            <div className="grow">
              {isUserAuthor ? 'You' : comment?.user_name}
              {comment?.created_at ? ` wrote ${moment(new Date(comment.created_at)).fromNow()}` : ''}
            </div>
            {canChangeStatus && !replying && !parentInlineComment ? (
              <Popover className="relative inline-block">
                <Popover.Button className="focus:outline-none">
                  <div className="flex flex-row items-center cursor-pointer">
                    {getTag(comment.current_status!)}
                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </Popover.Button>
                <Popover.Panel className="absolute z-50">
                  {({ close }) => (
                    <div
                      className="absolute z-50 mt-5 flex px-4"
                      style={{
                        translate: '-56%',
                      }}
                    >
                      <div className="flex-auto rounded bg-white p-2 text-sm leading-6 shadow-lg ring-1 ring-gray-900/5" style={{ width: 315 }}>
                        {comment.current_status !== InlineCommentStatusEnum.OPEN && (
                          <div
                            className="relative rounded py-2 px-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              updateInlineComment(comment.id, comment.mentions, comment.text, InlineCommentStatusEnum.OPEN);
                              close();
                            }}
                          >
                            {getTag(InlineCommentStatusEnum.OPEN)}
                            <p className="mt-1 text-gray-600">This comment is open for resolution.</p>
                          </div>
                        )}
                        {comment.current_status !== InlineCommentStatusEnum.TO_DO && (
                          <div
                            className="relative rounded py-2 px-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              updateInlineComment(comment.id, comment.mentions, comment.text, InlineCommentStatusEnum.TO_DO);
                              close();
                            }}
                          >
                            {getTag(InlineCommentStatusEnum.TO_DO)}
                            <p className="mt-1 text-gray-600">You are planing to work on this comment in the future.</p>
                          </div>
                        )}
                        {comment.current_status !== InlineCommentStatusEnum.DOING && (
                          <div
                            className="relative rounded py-2 px-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              updateInlineComment(comment.id, comment.mentions, comment.text, InlineCommentStatusEnum.DOING);
                              close();
                            }}
                          >
                            {getTag(InlineCommentStatusEnum.DOING)}
                            <p className="mt-1 text-gray-600">You are working on this comment.</p>
                          </div>
                        )}
                        {comment.current_status !== InlineCommentStatusEnum.CLOSED && (
                          <div
                            className="relative rounded py-2 px-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              updateInlineComment(comment.id, comment.mentions, comment.text, InlineCommentStatusEnum.CLOSED);
                              close();
                            }}
                          >
                            {getTag(InlineCommentStatusEnum.CLOSED)}
                            <p className="mt-1 text-gray-600">This comment is resolved.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Popover.Panel>
              </Popover>
            ) : !parentInlineComment ? (
              <div className="cursor-default">{getTag(comment.current_status!)}</div>
            ) : null}
            {hasPermissionCreateComment && replying && (
              <span onClick={() => setReplying(false)} className="cursor-pointer">
                Cancel
              </span>
            )}
            {hasPermissionCreateComment && !replying && !parentInlineComment && !isClosed && (
              <span onClick={() => setReplying(true)} className="cursor-pointer">
                Reply
              </span>
            )}
          </div>
        </div>
      )}
      {replying && (
        <div className="pl-10">
          <PureInlineCommentForm
            user={commonData.user!}
            submitComment={(text: string, userIds: string[]) => createInlineComment(userIds, text, comment.id)}
            channelMembers={channelMembers}
            onSubmitted={() => setReplying(false)}
            onCancel={() => setReplying(false)}
            hasPermissionCreateComment={hasPermissionCreateComment}
          />
        </div>
      )}
    </div>
  );
};

export default PureInlineComment;
