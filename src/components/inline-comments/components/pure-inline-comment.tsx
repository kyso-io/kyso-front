/* eslint-disable import/no-cycle */
/* eslint-disable no-restricted-globals */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import PureAvatar from '@/components/PureAvatar';
import { RenderMarkdown } from '@/components/renderers/kyso-markdown-renderer';
import { ToasterIcons } from '@/enums/toaster-icons';
import { ToasterMessages } from '@/helpers/ToasterMessages';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { CommonData } from '@/types/common-data';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import type { InlineCommentDto, Relations, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import { InlineCommentStatusEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import moment from 'moment';
import { useRouter } from 'next/router';
import { Tooltip } from 'primereact/tooltip';
import React, { useEffect, useMemo, useState } from 'react';
import { Helper } from '../../../helpers/Helper';
import PureInlineCommentForm from './pure-inline-comment-form';
import PureInlineCommentStatusHistory from './pure-inline-comment-status-history';
import TagInlineComment from './tag-inline-comment';

type IPureInlineComment = {
  hasPermissionCreateInlineComment: boolean;
  hasPermissionEditInlineComment: boolean;
  hasPermissionDeleteInlineComment: boolean;
  hasPermissionUpdateStatusInlineComment: boolean;
  commonData: CommonData;
  comment: InlineCommentDto;
  relations: Relations;
  channelMembers: TeamMember[];
  onCancel?: () => void;
  report: ReportDTO;
  createInlineComment: (user_ids: string[], text: string, parent_id: string | null) => void;
  updateInlineComment: (originalComment: InlineCommentDto, id: string, user_ids: string[], text: string, status: InlineCommentStatusEnum) => void;
  deleteComment: (id: string) => void;
  parentInlineComment: InlineCommentDto | null;
  isLastVersion: boolean;
  showToaster: (message: string, icon: JSX.Element) => void;
};

const PureInlineComment = (props: IPureInlineComment) => {
  const {
    commonData,
    channelMembers,
    hasPermissionCreateInlineComment,
    hasPermissionEditInlineComment,
    hasPermissionDeleteInlineComment,
    hasPermissionUpdateStatusInlineComment,
    comment,
    relations,
    deleteComment,
    createInlineComment,
    updateInlineComment,
    parentInlineComment,
    isLastVersion,
    showToaster,
  } = props;

  const router = useRouter();
  const { taskId, scrollCellId } = router.query;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [replying, setReplying] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>(comment.text);
  const [statusHistoryUsers, setStatusHistoryUsers] = useState<UserDTO[]>([]);
  const isUserAuthor: boolean = useMemo(() => commonData.user !== undefined && commonData.user !== null && comment !== null && commonData.user.id === comment.user_id, [commonData.user, comment]);
  const isClosed: boolean = useMemo(() => {
    if (parentInlineComment) {
      return parentInlineComment.current_status === InlineCommentStatusEnum.CLOSED;
    }
    return comment.current_status === InlineCommentStatusEnum.CLOSED;
  }, [comment, parentInlineComment]);

  useEffect(() => {
    if (!scrollCellId) {
      return;
    }
    setTimeout(() => {
      const element = document.getElementById(`taskId-${scrollCellId as string}`);
      if (!element) {
        return;
      }
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  }, [scrollCellId]);

  useEffect(() => {
    if (!comment || !comment.text) {
      setCommentText('');
    }
    const mentionedUsers: UserDTO[] = [];
    for (const userId of comment.mentions) {
      if (relations && relations.user[userId]) {
        mentionedUsers.push(relations.user[userId]!);
      }
    }
    const replacedText = comment.text.replace(/@([a-z0-9_-]+)/gi, (match: string, displayNameSlug: string): string => {
      const mentionedUser: UserDTO | undefined = mentionedUsers.find((u: UserDTO) => Helper.slug(u.display_name) === displayNameSlug);
      if (mentionedUser) {
        return `[${match}](/user/${mentionedUser.username})`;
      }
      return match;
    });

    setCommentText(replacedText);
  }, [comment]);

  const getUsersFromStatusHistory = async (theComment: InlineCommentDto) => {
    if (!theComment || !theComment.status_history) {
      return;
    }
    const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);
    const result = await api.getUsers({
      userIds: Array.from(new Set(theComment.status_history.map((x) => x.user_id))),
      page: 1,
      per_page: 1000,
      sort: '',
    });
    setStatusHistoryUsers(result.data);
  };

  useEffect(() => {
    getUsersFromStatusHistory(comment);
  }, [comment]);

  if (comment.markedAsDeleted) {
    return null;
  }

  return (
    <div className="not-prose" id={`taskId-${comment.cell_id}`}>
      {comment && isEditing ? (
        <div className={clsx(parentInlineComment ? 'ml-10' : '')}>
          <PureInlineCommentForm
            user={commonData.user!}
            submitComment={(text: string, userIds: string[], commentId?: string) => {
              // Set comment text (dirty copy) for better UX
              setCommentText(text);
              try {
                updateInlineComment(comment, commentId as string, userIds, text, comment.current_status!);
              } catch (ex) {
                showToaster(ToasterMessages.nonSpecificError(), ToasterIcons.ERROR);
              }
            }}
            comment={comment}
            channelMembers={channelMembers}
            onSubmitted={() => setIsEditing(!isEditing)}
            onCancel={() => setIsEditing(!isEditing)}
            hasPermissionCreateInlineComment={hasPermissionCreateInlineComment}
            isEdition={true}
          />
        </div>
      ) : (
        <div id={comment.cell_id} className={clsx('flex py-2 border rounded my-1 px-4 flex-col', parentInlineComment ? 'ml-10' : '', isClosed ? 'bg-slate-50' : '')}>
          <div className="flex flex-row justify-end space-x-2 text-xs font-light text-gray-400">
            {comment.parent_comment_id === null && (
              <React.Fragment>
                <button
                  type="button"
                  className="hover:underline"
                  onClick={() => {
                    const { query } = router;

                    if (query.taskId) {
                      // Exists previous one, remove it
                      delete query.taskId;
                    } else {
                      query.taskId = comment.id;
                    }

                    router.replace({
                      query,
                    });
                  }}
                >
                  History
                </button>
              </React.Fragment>
            )}
            {(hasPermissionEditInlineComment || isUserAuthor) && isLastVersion && (
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
            {(hasPermissionDeleteInlineComment || isUserAuthor) && !isClosed && isLastVersion && (
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

          {(taskId as string) === comment.id || comment?.cell_id === scrollCellId ? (
            <mark className="mb-2 mt-1 k-highlighted-text">
              <RenderMarkdown source={commentText} />
            </mark>
          ) : (
            <RenderMarkdown source={commentText} />
          )}

          <div className="pt-0 rounded-t flex items-center justify-start space-x-2 text-xs font-light text-gray-400">
            <PureAvatar src={comment?.user_avatar} title={comment?.user_name} size={TailwindHeightSizeEnum.H5} textSize={TailwindFontSizeEnum.SM} />
            <div className="grow">
              {isUserAuthor ? 'You' : comment?.user_name}
              {comment?.created_at ? ` wrote ${moment(new Date(comment.created_at)).fromNow()}` : ''}
            </div>
            {(hasPermissionUpdateStatusInlineComment || isUserAuthor) && !replying && !parentInlineComment && isLastVersion ? (
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
                              updateInlineComment(comment, comment.id, comment.mentions, comment.text, InlineCommentStatusEnum.OPEN);
                              close();
                            }}
                          >
                            <TagInlineComment status={InlineCommentStatusEnum.OPEN} />
                            <p className="mt-1 text-gray-600">This task is open for resolution.</p>
                          </div>
                        )}
                        {comment.current_status !== InlineCommentStatusEnum.TO_DO && (
                          <div
                            className="relative rounded py-2 px-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              updateInlineComment(comment, comment.id, comment.mentions, comment.text, InlineCommentStatusEnum.TO_DO);
                              close();
                            }}
                          >
                            <TagInlineComment status={InlineCommentStatusEnum.TO_DO} />
                            <p className="mt-1 text-gray-600">You are planing to work on this task in the future.</p>
                          </div>
                        )}
                        {comment.current_status !== InlineCommentStatusEnum.DOING && (
                          <div
                            className="relative rounded py-2 px-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              updateInlineComment(comment, comment.id, comment.mentions, comment.text, InlineCommentStatusEnum.DOING);
                              close();
                            }}
                          >
                            <TagInlineComment status={InlineCommentStatusEnum.DOING} />
                            <p className="mt-1 text-gray-600">You are working on this task.</p>
                          </div>
                        )}
                        {comment.current_status !== InlineCommentStatusEnum.CLOSED && (
                          <div
                            className="relative rounded py-2 px-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              updateInlineComment(comment, comment.id, comment.mentions, comment.text, InlineCommentStatusEnum.CLOSED);
                              close();
                            }}
                          >
                            <TagInlineComment status={InlineCommentStatusEnum.CLOSED} />
                            <p className="mt-1 text-gray-600">This task is resolved.</p>
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
            {hasPermissionCreateInlineComment && replying && (
              <span onClick={() => setReplying(false)} className="cursor-pointer">
                Cancel
              </span>
            )}
            {hasPermissionCreateInlineComment && !replying && !parentInlineComment && isLastVersion && (
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
            hasPermissionCreateInlineComment={hasPermissionCreateInlineComment}
            isReply={true}
          />
        </div>
      )}
      {(taskId as string) === comment.id && <PureInlineCommentStatusHistory inlineComment={comment} historyUsers={statusHistoryUsers} />}
    </div>
  );
};

export default PureInlineComment;
