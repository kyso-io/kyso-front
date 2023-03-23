import { PureSpinner } from '@/components/PureSpinner';
import classNames from '@/helpers/class-names';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { Comment, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import { Mention } from 'primereact/mention';
import { useState } from 'react';
import PureAvatar from './PureAvatar';

type IPureCommentForm = {
  comment?: Comment;
  parentComment?: Comment;
  onCancel?: () => void;
  report: ReportDTO;
  user: UserDTO;
  onSubmitted?: () => void;
  userSelectorHook: (id?: string) => UserDTO | undefined;
  hasPermissionCreateComment?: boolean;
  channelMembers: TeamMember[];
  defaultPlaceholderText?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitComment: (newComment: any, parentComment?: any) => void;
};

const parseMentions = (str: string) => {
  const re = /\B\@([\w\-]+)/gim;
  const tokens: string[] = [];

  /* eslint-disable no-constant-condition */
  while (true) {
    const match = re.exec(str);
    if (!match) {
      break;
    }

    tokens.push(match[1] as string);
  }

  return tokens;
};

const PureCommentForm = (props: IPureCommentForm) => {
  const { parentComment, comment, submitComment, user, report, channelMembers, onCancel = () => {}, onSubmitted = () => {}, hasPermissionCreateComment = true, userSelectorHook } = props;

  let initialValue = '';
  if (comment) {
    initialValue = comment.text;
  }

  const commentUser = userSelectorHook(parentComment?.user_id);
  const [value, setValue] = useState<string>(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  let isUserAuthor = false;
  if (user && user.id === comment?.user_id) {
    isUserAuthor = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const inputValue = e.target.input.value;

    // parse out nameSlugs
    const mentionedNameSlugs = parseMentions(inputValue);
    const userIds = channelMembers.filter((mem) => mentionedNameSlugs.includes(mem.nameSlug)).map((m) => m.id);

    setIsLoading(true);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const newCommentDTO: any = {
      text: inputValue,
      plain_text: inputValue,
      user_id: user.id,
      comment_id: parentComment?.id,
      user_ids: userIds,
    };

    if (report) {
      newCommentDTO.report_id = report.id as string;
    }

    await submitComment(newCommentDTO, comment);

    setIsLoading(false);
    setValue('');
    onSubmitted();
  };

  let message = props.defaultPlaceholderText ? props.defaultPlaceholderText : 'Write a new comment';

  if (comment?.id) {
    message = 'Edit comment';
  }
  if (parentComment?.id) {
    message = `Replying to ${isUserAuthor ? 'You' : commentUser && commentUser.name}`;
  }

  const [suggestions, setSuggestions] = useState<TeamMember[]>([]);

  const onSearch = (event: any) => {
    const { query } = event;
    let newSuggestions;

    if (!query.trim().length) {
      newSuggestions = [...channelMembers];
    } else {
      newSuggestions = channelMembers.filter((channelMember) => {
        return channelMember.nameSlug.toLowerCase().startsWith(query.toLowerCase());
      });
    }

    setSuggestions(newSuggestions);
  };

  const itemTemplate = (suggestion: TeamMember) => {
    return (
      <div className="flex flex-row items-center space-x-2 text-sm p-2 cursor-pointer hover:bg-blue-200">
        <PureAvatar src={suggestion.avatar_url} title={suggestion.nameSlug} size={TailwindHeightSizeEnum.H5} textSize={TailwindFontSizeEnum.XS} />
        <div>{suggestion.nameSlug}</div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="my-2 flex flex-col space-y-4 mb-8" style={{ zIndex: 1, position: 'relative' }}>
      {hasPermissionCreateComment ? (
        <>
          <Mention
            autoFocus={!!parentComment?.id}
            suggestions={suggestions}
            className="relative"
            inputClassName="w-full bg-white h-full rounded border-gray-200 hover:border-blue-400 focus:border-blue-400 text-sm "
            panelClassName="absolute bg-white border rounded"
            autoHighlight
            onSearch={onSearch}
            name="input"
            value={value}
            onChange={(e) => setValue((e.target as HTMLInputElement).value)}
            field="nameSlug"
            placeholder={message}
            itemTemplate={itemTemplate}
          />
          <style jsx global>{`
            .p-highlight {
              color: #4338ca;
              background: #eef2ff;
            }
          `}</style>
        </>
      ) : (
        <div>{user ? 'Sorry, but you do not have the permission to write a comment' : 'Please, login to write a comment'}</div>
      )}

      <div className="flex justify-between">
        <div>
          <p className="text-xs text-gray-500">Use @ to mention people</p>
        </div>

        <div className="flex flex-row space-x-2">
          {(comment?.id || parentComment?.id) && (
            <button
              type="button"
              className="inline-flex items-center px-2 py-1 mr-2 text-sm font-small rounded-md shadow-sm text-gray-500 focus:outline-none focus:ring-0 bg-white hover:bg-gray-100 border border-gray-500"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}

          {!comment?.id && !parentComment?.id && value !== '' && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setValue('');
              }}
              className={classNames(
                'inline-flex items-center px-2 py-1 mr-2 text-sm font-small rounded-md shadow-sm text-gray-500 focus:outline-none focus:ring-0 bg-white hover:bg-gray-100 border border-gray-500',
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
                'k-bg-primary k-bg-primary-hover focus:ring-kyso-700 focus:ring-offset-2',
              )}
            >
              {isLoading && <PureSpinner size={5} />}
              Post Comment
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default PureCommentForm;
