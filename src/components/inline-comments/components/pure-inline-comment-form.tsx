/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import PureAvatar from '@/components/PureAvatar';
import { PureSpinner } from '@/components/PureSpinner';
import classNames from '@/helpers/class-names';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { InlineCommentDto, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import { Mention } from 'primereact/mention';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type IPureCommentForm = {
  comment?: InlineCommentDto;
  onCancel?: () => void;
  user: UserDTO;
  onSubmitted?: () => void;
  hasPermissionCreateInlineComment?: boolean;
  channelMembers: TeamMember[];
  submitComment: (text: string, userIds: string[], commentId?: string) => void;
  isReply?: boolean;
  isEdition?: boolean;
};

const parseMentions = (str: string) => {
  const re = /\B\@([\w\-]+)/gim;
  const tokens: string[] = [];
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = re.exec(str))) {
    if (!match[1]) {
      // eslint-disable-next-line no-continue
      continue;
    }

    tokens.push(match[1]);
  }
  return tokens;
};

const PureInlineCommentForm = (props: IPureCommentForm) => {
  const { comment, submitComment, user, channelMembers, onCancel = () => {}, onSubmitted = () => {}, hasPermissionCreateInlineComment = true, isReply = false } = props;
  const mentionsRef = useRef<any>(null);
  const [id] = useState<string | undefined>(`picf-${uuidv4()}`);
  const [searchingUsers, setSearchingUsers] = useState<boolean>(false);

  useEffect(() => {
    function handleDocumentKeyDown(event: any) {
      if (event.target.closest(`#${id}`) !== null) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          handleSubmit(event);
        }
      }
    }
    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!mentionsRef.current) {
      return undefined;
    }
    const targetNode = mentionsRef.current.getElement();
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for (const addedNode of mutation.addedNodes) {
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
              const addedElement = addedNode;
              const classes: string[] = Array.from((addedElement as any).classList);
              if (classes.includes('p-mention-panel')) {
                setSearchingUsers(true);
                break;
              }
            }
          }
          for (const removedNode of mutation.removedNodes) {
            if (removedNode.nodeType === Node.ELEMENT_NODE) {
              const removedElement = removedNode;
              const classes: string[] = Array.from((removedElement as any).classList);
              if (classes.includes('p-mention-panel')) {
                setSearchingUsers(false);
                break;
              }
            }
          }
        }
      }
    });
    const observerOptions = {
      childList: true,
      subtree: true,
    };
    observer.observe(targetNode, observerOptions);
    return () => {
      observer.disconnect();
      return undefined;
    };
  }, [mentionsRef.current]);

  let initialValue = '';
  if (comment) {
    initialValue = comment.text;
  }

  const [value, setValue] = useState<string>(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    setIsLoading(true);
    e.preventDefault();
    const targetValue = mentionsRef.current.getInput().value;
    const mentionedNameSlugs = parseMentions(targetValue);
    let userIds: string[] = [];
    if (channelMembers) {
      userIds = channelMembers.filter((mem: TeamMember) => mentionedNameSlugs.includes(mem.nameSlug)).map((m: TeamMember) => m.id!);
    }
    submitComment(targetValue, userIds, comment?.id);
    setValue('');
    setIsLoading(false);
    onSubmitted();
  };

  const message: string = useMemo(() => {
    if (comment) {
      if (comment.parent_comment_id) {
        return 'Update your reply';
      }
      return 'Update your task';
    }
    if (isReply) {
      return 'Write a reply';
    }
    return 'Write a new task';
  }, [comment, isReply]);

  const [suggestions, setSuggestions] = useState<TeamMember[]>([]);

  const onSearch = (event: any) => {
    const { query } = event;
    let suggestionsTmp: TeamMember[] = [];
    if (channelMembers) {
      if (!query.trim().length) {
        suggestionsTmp = [...channelMembers];
      } else {
        suggestionsTmp = channelMembers.filter((channelMember: TeamMember) => {
          return channelMember.nameSlug.toLowerCase().startsWith(query.toLowerCase());
        });
      }
    }
    setSuggestions(suggestionsTmp);
  };

  const itemTemplate = (suggestion: TeamMember) => {
    return (
      <div className="flex flex-row items-center space-x-2 text-sm p-2 cursor-pointer hover:bg-blue-200">
        <PureAvatar src={suggestion.avatar_url} title={suggestion.nameSlug} size={TailwindHeightSizeEnum.H5} textSize={TailwindFontSizeEnum.SM} />
        <div>{suggestion.nameSlug}</div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="my-2">
      {hasPermissionCreateInlineComment ? (
        <React.Fragment>
          <Mention
            ref={mentionsRef}
            id={id}
            suggestions={suggestions}
            className="relative"
            inputClassName="w-full bg-white h-full rounded border-gray-200 hover:border-blue-400 focus:border-blue-400 text-sm"
            panelClassName="w-full absolute bg-white border rounded"
            autoHighlight
            autoFocus
            onSearch={onSearch}
            name="input"
            value={value}
            onChange={() => setValue(mentionsRef.current.getInput().value)}
            field="nameSlug"
            style={{
              width: '100%',
              zIndex: 0,
            }}
            placeholder={message}
            itemTemplate={itemTemplate}
          />
          <style jsx global>{`
            .p-highlight {
              color: #4338ca;
              background: #eef2ff;
            }
            .p-mention {
              position: ${searchingUsers ? 'relative' : 'static'};
            }
          `}</style>
        </React.Fragment>
      ) : (
        <div>{user ? 'Sorry, but you do not have the permission to write a comment' : 'Please, login to write a comment'}</div>
      )}
      <div className="flex justify-end pt-4">
        <div className="flex flex-row space-x-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              setValue('');
              if (onCancel) {
                onCancel();
              }
            }}
            className={classNames(
              'mr-2 inline-flex items-center px-2.5 py-1.5 border border-gray-500 text-xs font-medium rounded shadow-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white hover:bg-gray-100 focus:ring-gray-100',
            )}
          >
            Cancel
          </button>
          {hasPermissionCreateInlineComment && (
            <button
              type="submit"
              className={classNames(
                'inline-flex items-center px-2 py-1 border border-transparent text-sm font-small rounded-md shadow-sm text-white focus:outline-none focus:ring-0',
                'k-bg-primary focus:ring-kyso-700 focus:ring-offset-2',
              )}
            >
              {isLoading && <PureSpinner size={5} />}
              {comment !== null ? 'Save' : 'Post'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default PureInlineCommentForm;
