/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { faEllipsis, faPencil, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { InlineCommentDto } from '@kyso-io/kyso-model';
import { Dropdown, Menu } from 'antd';
import clsx from 'clsx';
import parse from 'html-react-parser';
import moment from 'moment';
import React, { useMemo, useRef, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import OutsideClickHandler from 'react-outside-click-handler';

interface Props {
  userId?: string;
  inlineCommentDto: InlineCommentDto;
  editInlineComment: (text: string) => void;
  deleteInlineComment: () => void;
  enabledDeleteInlineComment: boolean;
  enabledEditInlineComment: boolean;
}

const CellCommentContainer = ({ userId, inlineCommentDto, editInlineComment, deleteInlineComment, enabledDeleteInlineComment, enabledEditInlineComment }: Props) => {
  const refContentEditable = useRef<any>(null);
  const [isShown, setIsShown] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [text, setText] = useState<string>(inlineCommentDto.text);
  const isThereText: boolean = useMemo(() => text != null && text.length > 0, [text]);
  const [showEditInlineComment, setShowEditInlineComment] = useState<boolean>(false);
  return (
    <div className="cell-comment-container" onMouseEnter={() => setIsShown(true)} onMouseLeave={() => setIsShown(false)}>
      <div className="d-flex flex-row">
        <div className="container-image">
          <div className="w-100 h-100">
            <img src={inlineCommentDto.user_avatar} alt="" />
          </div>
        </div>
        <div className="d-flex flex-column w-100 ms-2">
          <div className="d-flex flex-row align-items-center position-relative">
            <span className="username">{inlineCommentDto.user_name}</span>
            <span className="date">
              {moment(inlineCommentDto.created_at).fromNow()} {inlineCommentDto.edited && '(edited)'}
            </span>
            {(enabledEditInlineComment || enabledDeleteInlineComment) && (
              <div className="position-absolute top-50 translate-middle" style={{ left: '97%' }}>
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item
                        className="px-3"
                        key={`edit-comment-${inlineCommentDto.id}`}
                        onClick={(e: any) => {
                          e.domEvent.stopPropagation();
                          setShowEditInlineComment(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faPencil} color="#686662" className="me-2" />
                        <span className="w-100 overlay">Edit comment</span>
                      </Menu.Item>
                      <Menu.Item
                        className="px-3"
                        key={`delete-comment-${inlineCommentDto.id}`}
                        onClick={(e: any) => {
                          e.domEvent.stopPropagation();
                          deleteInlineComment();
                        }}
                      >
                        <FontAwesomeIcon icon={faTrashCan} color="#686662" className="me-2" />
                        <span className="w-100 overlay">Delete comment</span>
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={['click']}
                  onVisibleChange={(visible: boolean) => setMenuVisible(visible)}
                >
                  <div
                    className="more-actions"
                    onClick={(e: any) => e.stopPropagation()}
                    style={{
                      visibility: userId === inlineCommentDto.user_id && (isShown || menuVisible) ? 'visible' : 'hidden',
                    }}
                  >
                    <FontAwesomeIcon icon={faEllipsis} color="#A8A6A3" />
                  </div>
                </Dropdown>
              </div>
            )}
          </div>
          <div className="position-relative">
            <div className="text">{parse(inlineCommentDto.text)}</div>
            {showEditInlineComment && (
              <OutsideClickHandler
                onOutsideClick={() => {
                  setText(inlineCommentDto.text);
                  setShowEditInlineComment(false);
                }}
              >
                <div className="container-edit-inline-comment">
                  <div className="d-flex flex-column">
                    <ContentEditable
                      className="container-text"
                      innerRef={refContentEditable}
                      html={text}
                      disabled={false}
                      onChange={(e: any) => setText(e.target.value)}
                      onClick={(e: any) => e.stopPropagation()}
                    />
                    <div className="ms-2 align-self-end">
                      <svg
                        viewBox="0 0 20 20"
                        className={clsx({ 'not-empty': isThereText })}
                        onClick={(e: any) => {
                          e.stopPropagation();
                          editInlineComment(text);
                          setShowEditInlineComment(false);
                        }}
                      >
                        <path d="M9.79883 18.5894C14.6216 18.5894 18.5894 14.6216 18.5894 9.79883C18.5894 4.96777 14.6216 1 9.79053 1C4.95947 1 1 4.96777 1 9.79883C1 14.6216 4.96777 18.5894 9.79883 18.5894ZM9.79883 14.3062C9.20947 14.3062 8.76953 13.9077 8.76953 13.3433V9.69922L8.86914 8.00586L8.25488 8.84424L7.3916 9.81543C7.23389 10.0063 6.98486 10.1143 6.72754 10.1143C6.21289 10.1143 5.84766 9.75732 5.84766 9.25928C5.84766 8.99365 5.92236 8.79443 6.12158 8.58691L8.96045 5.61523C9.19287 5.35791 9.4585 5.2417 9.79883 5.2417C10.1309 5.2417 10.4048 5.36621 10.6372 5.61523L13.4761 8.58691C13.667 8.79443 13.75 8.99365 13.75 9.25928C13.75 9.75732 13.3848 10.1143 12.8618 10.1143C12.6128 10.1143 12.3638 10.0063 12.2061 9.81543L11.3428 8.86914L10.7202 7.99756L10.8281 9.69922V13.3433C10.8281 13.9077 10.3799 14.3062 9.79883 14.3062Z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </OutsideClickHandler>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CellCommentContainer;
