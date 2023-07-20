/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PureSpinner } from '@/components/PureSpinner';
import classNames from '@/helpers/class-names';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { Comment, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import { Mention } from 'primereact/mention';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useEvent } from '../hooks/use-event';
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

const MIN_HEIGHT_TEXTAREA = 65;

const PureCommentForm = (props: IPureCommentForm) => {
  const { subscribeEvent } = useEvent();
  const { parentComment, comment, submitComment, user, report, channelMembers, onCancel = () => {}, onSubmitted = () => {}, hasPermissionCreateComment = true, userSelectorHook } = props;
  const mentionsRef = useRef<any>(null);
  const [id] = useState<string | undefined>(`pfc-${uuidv4()}`);
  const [searchingUsers, setSearchingUsers] = useState<boolean>(false);

  useEffect(() => {
    subscribeEvent(handleEvent);
    return () => {
      subscribeEvent(() => {}); // Pasar una función vacía para desuscribirse.
    };
  }, []);

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
    const inputValue = mentionsRef.current.getInput().value;

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
    mentionsRef.current.getElement().children[0].style.height = `${MIN_HEIGHT_TEXTAREA}px`;
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
      <div className="flex flex-row items-center space-x-2 text-sm p-2 cursor-pointer hover:bg-blue-200" title={suggestion.nameSlug}>
        <PureAvatar src={suggestion.avatar_url} title={suggestion.nameSlug} size={TailwindHeightSizeEnum.H5} textSize={TailwindFontSizeEnum.XS} />
        <div title={suggestion.nameSlug}>{suggestion.nameSlug}</div>
      </div>
    );
  };

  useEffect(() => {
    if (!mentionsRef.current) {
      return undefined;
    }
    const targetNode = mentionsRef.current.getElement();
    // Crear un nuevo MutationObserver
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for (const addedNode of mutation.addedNodes) {
            // Verificar si el nodo agregado es un elemento
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
              const addedElement = addedNode; // Convertir el nodo a un elemento
              // Obtener las clases CSS del elemento agregado
              const classes: string[] = Array.from((addedElement as any).classList);
              if (classes.includes('p-mention-panel')) {
                setSearchingUsers(true);
                break;
              }
            }
          }
          for (const removedNode of mutation.removedNodes) {
            // Verificar si el nodo eliminado es un elemento
            if (removedNode.nodeType === Node.ELEMENT_NODE) {
              const removedElement = removedNode; // Convertir el nodo a un elemento

              // Obtener las clases CSS del elemento eliminado
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
    // Configurar las opciones del MutationObserver
    const observerOptions = {
      childList: true, // Observar cambios en los hijos del targetNode
      subtree: true, // Observar cambios en todos los niveles del DOM dentro del targetNode
    };
    // Comenzar a observar el targetNode
    observer.observe(targetNode, observerOptions);
    // Detener el observer cuando el componente se desmonta
    return () => {
      observer.disconnect();
      return undefined;
    };
  }, [mentionsRef.current]);

  const handleEvent = useCallback(() => {
    if (!mentionsRef.current) {
      return;
    }
    mentionsRef.current.hide();
  }, [mentionsRef.current]);

  return (
    <form onSubmit={handleSubmit} className="my-2 flex flex-col space-y-4 mb-8">
      {hasPermissionCreateComment ? (
        <React.Fragment>
          <Mention
            ref={mentionsRef}
            id={id}
            autoFocus={!!parentComment?.id}
            suggestions={suggestions}
            inputClassName="w-full bg-white h-full rounded border-gray-200 hover:border-blue-400 focus:border-blue-400 text-sm "
            panelClassName="bg-white border rounded"
            autoHighlight
            onSearch={onSearch}
            name="input"
            value={value}
            onChange={(e: any) => {
              const text: string = mentionsRef.current.getInput().value || '';
              const newHeight: number = text ? Math.max((e.target as any).scrollHeight, MIN_HEIGHT_TEXTAREA) : MIN_HEIGHT_TEXTAREA;
              (e.target as any).style.height = `${newHeight}px`;
              setValue(text);
            }}
            field="nameSlug"
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

      <div className="flex justify-between">
        <div>
          <p className="text-xs text-gray-500">Use @ to mention people</p>
        </div>

        <div className="flex flex-row space-x-2">
          {(comment?.id || parentComment?.id) && (
            <button
              type="button"
              className="inline-flex items-center px-2 py-1 mr-2 text-sm font-small rounded-md shadow-sm text-gray-500 focus:outline-none focus:ring-0 bg-white hover:bg-gray-100 border border-gray-500"
              onClick={() => {
                mentionsRef.current.getElement().children[0].style.height = `${MIN_HEIGHT_TEXTAREA}px`;
                onCancel();
              }}
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
                mentionsRef.current.getElement().children[0].style.height = `${MIN_HEIGHT_TEXTAREA}px`;
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
                'k-bg-primary focus:ring-kyso-700 focus:ring-offset-2',
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
