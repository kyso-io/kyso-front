/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/no-explicit-any */
import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ContentEditable from 'react-contenteditable';

interface Props {
  numComments: number;
  parentFocused: boolean;
  avatarUrl: string;
  createInlineComment: (text: string) => void;
}

const CellCommentInput = ({ numComments, avatarUrl, createInlineComment, parentFocused }: Props) => {
  const refContentEditable = useRef<any>(null);
  const [focused, setFocused] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const isThereText: boolean = useMemo(() => text != null && text.length > 0, [text]);
  const [enterKeyPressed, setEnterKeyPressed] = useState<boolean>(false);

  useEffect(() => {
    if (parentFocused) {
      refContentEditable.current.focus();
    }
  }, [parentFocused]);

  useEffect(() => {
    if (focused) {
      refContentEditable.current.focus();
    }
  }, [focused]);

  const sendComment = () => {
    if (isThereText) {
      createInlineComment(text);
      setText('');
      refContentEditable.current.focus();
    }
  };

  useEffect(() => {
    if (enterKeyPressed) {
      sendComment();
      setEnterKeyPressed(false);
    }
  }, [enterKeyPressed]);

  return (
    <div className="cell-comment-input">
      <div className="d-flex flex-row">
        <div className="container-image">
          <div className="w-100 h-100">
            <img src={avatarUrl} alt="" />
          </div>
        </div>
        <div
          className={clsx('d-flex flex-column w-100 container-input ms-1', {
            focused,
            'has-text': (isThereText && focused) || parentFocused,
          })}
        >
          {!focused && (!text || text.length === 0) && (
            <span
              className="text-muted"
              onClick={() => {
                refContentEditable.current.focus();
                setFocused(true);
              }}
            >
              {numComments > 0 ? 'Reply text...' : 'Add a comment...'}
            </span>
          )}
          <ContentEditable
            className={clsx('container-text', {
              'container-text-empty': !isThereText,
            })}
            innerRef={refContentEditable}
            html={text}
            disabled={false}
            onChange={(e: any) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onClick={() => setFocused(true)}
          />
          {(focused || parentFocused) && (
            <div className="d-flex flex-row-reverse">
              <svg viewBox="0 0 20 20" className={clsx({ 'not-empty': isThereText })} onClick={sendComment}>
                <path d="M9.79883 18.5894C14.6216 18.5894 18.5894 14.6216 18.5894 9.79883C18.5894 4.96777 14.6216 1 9.79053 1C4.95947 1 1 4.96777 1 9.79883C1 14.6216 4.96777 18.5894 9.79883 18.5894ZM9.79883 14.3062C9.20947 14.3062 8.76953 13.9077 8.76953 13.3433V9.69922L8.86914 8.00586L8.25488 8.84424L7.3916 9.81543C7.23389 10.0063 6.98486 10.1143 6.72754 10.1143C6.21289 10.1143 5.84766 9.75732 5.84766 9.25928C5.84766 8.99365 5.92236 8.79443 6.12158 8.58691L8.96045 5.61523C9.19287 5.35791 9.4585 5.2417 9.79883 5.2417C10.1309 5.2417 10.4048 5.36621 10.6372 5.61523L13.4761 8.58691C13.667 8.79443 13.75 8.99365 13.75 9.25928C13.75 9.75732 13.3848 10.1143 12.8618 10.1143C12.6128 10.1143 12.3638 10.0063 12.2061 9.81543L11.3428 8.86914L10.7202 7.99756L10.8281 9.69922V13.3433C10.8281 13.9077 10.3799 14.3062 9.79883 14.3062Z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CellCommentInput;
