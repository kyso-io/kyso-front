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
import type { UserDTO, InlineCommentDto, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import { GlobalPermissionsEnum, InlineCommentStatusEnum, OrganizationPermissionsEnum, TeamPermissionsEnum } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { Tooltip } from 'primereact/tooltip';
import { HelperPermissions } from '../../../helpers/check-permissions';
import PureInlineCommentForm from './pure-inline-comment-form';
import TagInlineComment from './tag-inline-comment';
import { Helper } from '../../../helpers/Helper';
import { useAppSelector } from '../../../hooks/redux-hooks';

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
  isLastVersion: boolean;
};

const PureInlineComment = (props: IPureInlineComment) => {
  const {
    commonData,
    channelMembers,
    hasPermissionDeleteComment,
    hasPermissionCreateComment,
    comment,
    deleteComment,
    createInlineComment,
    updateInlineComment,
    parentInlineComment,
    report,
    isLastVersion,
  } = props;
  const userEntities: { [key: string]: UserDTO } = useAppSelector((state) => state.user.entities);
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

  const commentText: string = useMemo(() => {
    if (!comment || !comment.text) {
      return '';
    }
    const mentionedUsers: UserDTO[] = [];
    for (const userId of comment.mentions) {
      if (userEntities[userId]) {
        mentionedUsers.push(userEntities[userId]!);
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

  if (comment.markedAsDeleted) {
    return null;
  }

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
        <div id={comment.cell_id} className={classNames('flex py-2 border rounded my-1 px-4 flex-col', parentInlineComment ? 'ml-10' : '')}>
          <div className="flex flex-row justify-end space-x-2 text-xs font-light text-gray-400">
            {isUserAuthor && hasPermissionCreateComment && isLastVersion && (
              <React.Fragment>
                {isClosed ? (
                  <React.Fragment>
                    <Tooltip target=".edit-button-tooltip" />
                    <span className="edit-button-tooltip" data-pr-tooltip="Edition is not allowed when status is closed" data-pr-position="bottom">
                      <button className="hover:underline">Edit</button>
                    </span>
                  </React.Fragment>
                ) : (
                  <button className="hover:underline" onClick={() => setIsEditing(!isEditing)}>
                    Edit
                  </button>
                )}
              </React.Fragment>
            )}
            {((isUserAuthor && hasPermissionDeleteComment) || isOrgAdmin || isTeamAdmin) && !isClosed && isLastVersion && (
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
          <RenderMarkdown source={commentText} />
          <div className="pt-0 rounded-t flex items-center justify-start space-x-2 text-xs font-light text-gray-400">
            <PureAvatar src={comment?.user_avatar} title={comment?.user_name} size={TailwindHeightSizeEnum.H5} textSize={TailwindFontSizeEnum.SM} />
            <div className="grow">
              {isUserAuthor ? 'You' : comment?.user_name}
              {comment?.created_at ? ` wrote ${moment(new Date(comment.created_at)).fromNow()}` : ''}
            </div>
            {canChangeStatus && !replying && !parentInlineComment && isLastVersion ? (
              <Popover className="relative inline-block">
                <Popover.Button className="focus:outline-none">
                  <div className="flex flex-row items-center cursor-pointer">
                    <TagInlineComment status={comment.current_status!} />
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
                            <TagInlineComment status={InlineCommentStatusEnum.OPEN} />
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
                            <TagInlineComment status={InlineCommentStatusEnum.TO_DO} />
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
                            <TagInlineComment status={InlineCommentStatusEnum.DOING} />
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
                            <TagInlineComment status={InlineCommentStatusEnum.CLOSED} />
                            <p className="mt-1 text-gray-600">This comment is resolved.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Popover.Panel>
              </Popover>
            ) : !parentInlineComment ? (
              <div className="cursor-default">
                <TagInlineComment status={comment.current_status!} />
              </div>
            ) : null}
            {hasPermissionCreateComment && replying && (
              <span onClick={() => setReplying(false)} className="cursor-pointer">
                Cancel
              </span>
            )}
            {hasPermissionCreateComment && !replying && !parentInlineComment && isLastVersion && (
              <React.Fragment>
                {isClosed ? (
                  <React.Fragment>
                    <Tooltip target=".reply-button-tooltip" />
                    <span className="reply-button-tooltip" data-pr-tooltip="Replies not allowed when status is closed" data-pr-position="bottom">
                      <button className="hover:underline">Reply</button>
                    </span>
                  </React.Fragment>
                ) : (
                  <button className="hover:underline" onClick={() => setReplying(true)}>
                    Reply
                  </button>
                )}
              </React.Fragment>
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
