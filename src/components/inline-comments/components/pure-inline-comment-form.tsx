import PureAvatar from '@/components/PureAvatar';
import { PureSpinner } from '@/components/PureSpinner';
import classNames from '@/helpers/class-names';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { InlineCommentDto, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import { Mention } from 'primereact/mention';
import { useState } from 'react';

type IPureCommentForm = {
  comment?: InlineCommentDto;
  onCancel?: () => void;
  user: UserDTO;
  onSubmitted?: () => void;
  hasPermissionCreateComment?: boolean;
  channelMembers: TeamMember[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitComment: (text: string, userIds: string[], commentId?: string) => void;
};

const parseMentions = function (str: string) {
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
  const { comment, submitComment, user, channelMembers, onCancel = () => {}, onSubmitted = () => {}, hasPermissionCreateComment = true } = props;

  let initialValue = '';
  if (comment) {
    initialValue = comment.text;
  }

  const [value, setValue] = useState<string>(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  /** Assigned but never used
  let isUserAuthor = false
  if (user && user.id === comment?.user_id) {
    isUserAuthor = true
  }
  * */

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleSubmit = async (e: any) => {
    setIsLoading(true);
    e.preventDefault();
    const targetValue = e.target.input.value;

    // parse out nameSlugs
    const mentionedNameSlugs = parseMentions(targetValue);
    let userIds: string[] = [];
    if (channelMembers) {
      userIds = channelMembers.filter((mem: TeamMember) => mentionedNameSlugs.includes(mem.nameSlug)).map((m: TeamMember) => m.id!);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    await submitComment(targetValue, userIds, comment?.id);

    setValue('');
    setTimeout(() => {
      setIsLoading(false);
      onSubmitted();
    }, 500);
  };

  let message = 'Write a new comment';

  if (comment?.id) {
    message = 'Edit comment';
  }

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
      {hasPermissionCreateComment ? (
        <Mention
          suggestions={suggestions}
          className="relative"
          inputClassName="w-full bg-white h-full rounded border-gray-200 hover:border-blue-400 focus:border-blue-400 text-sm"
          panelClassName="w-full absolute bg-white border rounded"
          autoHighlight
          onSearch={onSearch}
          name="input"
          value={value}
          onChange={(e) => setValue((e.target as HTMLInputElement).value)}
          field="nameSlug"
          style={{
            width: '100%',
          }}
          placeholder={message}
          itemTemplate={itemTemplate}
        />
      ) : (
        <div>{user ? 'Sorry, but you do not have the permission to write a comment' : 'Please, login to write a comment'}</div>
      )}

      <div className="flex justify-between pt-4">
        <div>{/* <p className="text-xs text-gray-500">Use @ to mention people</p> */}</div>

        <div className="flex flex-row space-x-2">
          {comment && (
            <button className="hover:underline text-gray-500 text-sm" onClick={onCancel}>
              Cancel
            </button>
          )}
          {!comment && hasPermissionCreateComment && value !== '' && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setValue('');
              }}
              className={classNames(
                'mr-2 inline-flex items-center px-2.5 py-1.5 border border-gray-500 text-xs font-medium rounded shadow-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white hover:bg-gray-100 focus:ring-gray-100',
              )}
            >
              Cancel
            </button>
          )}
          {hasPermissionCreateComment && (
            <button
              type="submit"
              className={classNames(
                'inline-flex items-center px-2 py-1 border border-transparent text-sm font-small rounded-md shadow-sm text-white focus:outline-none focus:ring-0',
                'bg-kyso-600 hover:bg-kyso-700 focus:ring-kyso-700 focus:ring-offset-2',
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
