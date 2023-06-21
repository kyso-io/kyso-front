import PureAvatar from '@/components/PureAvatar';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import { TagIcon } from '@heroicons/react/solid';
import type { InlineCommentDto, InlineCommentStatusHistoryDto, UserDTO } from '@kyso-io/kyso-model';
import moment from 'moment';
import Link from 'next/link';
import React from 'react';
import TagInlineComment from './tag-inline-comment';

type IPureInlineComment = {
  inlineComment: InlineCommentDto;
  historyUsers: UserDTO[];
};

const PureInlineCommentStatusHistory = (props: IPureInlineComment) => {
  const { inlineComment, historyUsers } = props;

  return (
    <div className="col-span-4 pl-2">
      <div className="flex flex-col content-center my-3">
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {inlineComment.status_history.map((inlineStatusHistory: InlineCommentStatusHistoryDto, index: number) => {
              const historyUserIds: UserDTO[] = historyUsers.filter((x) => x.id === inlineStatusHistory.user_id);
              let user: UserDTO | null = null;
              if (historyUserIds.length > 0) {
                user = historyUserIds[0]!;
              } else {
                return null;
              }

              if (!user) {
                return null;
              }

              if (inlineStatusHistory.from_status === null) {
                return (
                  <React.Fragment key={index}>
                    <li>
                      <div className="relative pb-8">
                        <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        <div className="relative flex items-start space-x-3">
                          <div className="relative px-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                              <TagIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 py-0">
                            <div className="text-sm leading-8 text-gray-500">
                              <span className="mr-0.5">
                                <a className="font-medium text-gray-900">Discussion started</a> at version
                              </span>
                              {inlineStatusHistory.report_version !== null && (
                                <span className="mx-1">
                                  <span className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs text-gray-900 ring-1 ring-inset ring-gray-200 font-bold">
                                    {inlineStatusHistory.report_version}
                                  </span>
                                </span>
                              )}
                              <span className="whitespace-nowrap">{moment(inlineStatusHistory.date).fromNow()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H10} textSize={TailwindFontSizeEnum.XS} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm">
                                <Link href="" className="font-medium text-gray-900">
                                  {user.display_name}
                                </Link>
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500">Created the first comment {moment(inlineStatusHistory.date).fromNow()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </React.Fragment>
                );
              }
              return (
                <li key={index}>
                  <div className="relative pb-8">
                    {index < inlineComment.status_history.length - 1 ? <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H10} textSize={TailwindFontSizeEnum.XS} />
                        <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px"></span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <Link href="" className="font-medium text-gray-900">
                              {user.display_name}
                            </Link>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {inlineStatusHistory.edited ? (
                              <React.Fragment>Edited this task {moment(inlineStatusHistory.date).fromNow()}</React.Fragment>
                            ) : (
                              <React.Fragment>
                                Changed status to <TagInlineComment status={inlineStatusHistory.to_status} /> {moment(inlineStatusHistory.date).fromNow()}
                              </React.Fragment>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PureInlineCommentStatusHistory;
