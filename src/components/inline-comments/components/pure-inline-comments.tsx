/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CommonData } from '@/types/common-data';
import { faCircleInfo } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { InlineCommentDto, InlineCommentStatusEnum, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import 'primereact/resources/primereact.min.css'; // core css
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // theme
import { Tooltip } from 'primereact/tooltip';
import React from 'react';
import PureInlineComment from './pure-inline-comment';
import PureInlineCommentForm from './pure-inline-comment-form';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type IPureComments = {
  commonData: CommonData;
  report: ReportDTO;
  channelMembers: TeamMember[];
  comments: InlineCommentDto[];
  hasPermissionCreateComment: boolean;
  hasPermissionDeleteComment: boolean;
  createInlineComment: (user_ids: string[], text: string, parent_id: string | null) => void;
  updateInlineComment: (id: string, user_ids: string[], text: string, status: InlineCommentStatusEnum) => void;
  deleteComment: (id: string) => void;
  isLastVersion: boolean;
  showTitle: boolean;
  showCreateNewComment: boolean;
};

const PureComments = (props: IPureComments) => {
  const {
    comments,
    commonData,
    report,
    channelMembers,
    hasPermissionDeleteComment,
    hasPermissionCreateComment,
    deleteComment,
    createInlineComment,
    updateInlineComment,
    isLastVersion,
    showTitle,
    showCreateNewComment,
  } = props;
  return (
    <div className={classNames('w-full flex flex-col')}>
      {(comments?.length > 0 || commonData.user) && showTitle && (
        <div className="prose max-w-none ">
          <Tooltip target=".inline-comments-info" />
          <h4>
            File{`'`}s comments{' '}
            <FontAwesomeIcon
              className="inline-comments-info"
              data-pr-tooltip="These comments are local to the current file, and will change if you open another file"
              style={{ height: '15px', color: '#bbb', paddingBottom: '10px', paddingLeft: '2px' }}
              icon={faCircleInfo}
            />
          </h4>
        </div>
      )}
      <div className="flex flex-col">
        {comments &&
          comments.map((inlineComment: InlineCommentDto) => (
            <React.Fragment key={inlineComment.id}>
              <PureInlineComment
                hasPermissionDeleteComment={hasPermissionDeleteComment}
                channelMembers={channelMembers}
                comment={inlineComment}
                report={report}
                hasPermissionCreateComment={hasPermissionCreateComment}
                commonData={commonData}
                deleteComment={deleteComment}
                createInlineComment={createInlineComment}
                updateInlineComment={updateInlineComment}
                parentInlineComment={null}
                isLastVersion={isLastVersion}
              />
              {inlineComment.inline_comments.map((childComment: InlineCommentDto) => (
                <PureInlineComment
                  key={childComment.id}
                  hasPermissionDeleteComment={hasPermissionDeleteComment}
                  channelMembers={channelMembers}
                  comment={childComment}
                  report={report}
                  hasPermissionCreateComment={hasPermissionCreateComment}
                  commonData={commonData}
                  deleteComment={deleteComment}
                  createInlineComment={createInlineComment}
                  updateInlineComment={updateInlineComment}
                  parentInlineComment={inlineComment}
                  isLastVersion={isLastVersion}
                />
              ))}
            </React.Fragment>
          ))}
      </div>
      {commonData.user && hasPermissionCreateComment && isLastVersion && showCreateNewComment && (
        <div className={clsx({ 'mt-20': comments && comments.length > 0 })}>
          <PureInlineCommentForm
            user={commonData.user}
            submitComment={(text: string, userIds: string[]) => {
              createInlineComment(userIds, text, null);
            }}
            channelMembers={channelMembers}
          />
        </div>
      )}
    </div>
  );
};

export default PureComments;
