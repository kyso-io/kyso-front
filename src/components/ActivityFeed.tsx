import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import { ChatAltIcon, TagIcon } from '@heroicons/react/solid';
import type { ActivityFeed, Comment, Discussion, NormalizedResponseDTO, Organization, Relations, Report, Tag, Team, User } from '@kyso-io/kyso-model';
import { ActionEnum, EntityEnum } from '@kyso-io/kyso-model';
import moment from 'moment';
import React from 'react';
import PureAvatar from './PureAvatar';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface ActivityFeedProps {
  activityFeed: ActivityFeed;
  relations: Relations;
}

const ActivityFeedComment = ({ activityFeed, relations }: ActivityFeedProps) => {
  const comment: Comment = relations.comment[activityFeed.entity_id!];
  const user: User = relations.user[activityFeed.user_id!];
  let report: Report | null = null;
  let discussion: Discussion | null = null;
  if (comment.report_id) {
    report = relations.report[comment.report_id!];
  } else if (comment.discussion_id) {
    discussion = relations.discussion[comment.discussion_id!];
  }
  return (
    <React.Fragment>
      <div className="relative">
        <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H8} />

        <span className="absolute -bottom-0.5 -right-1 bg-white rounded-tl px-0.5 py-px">
          <ChatAltIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div>
          <div className="text-sm">
            <a href="#" className="font-medium text-gray-900">
              {user.display_name}
            </a>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            Commented
            {report && (
              <span>
                {' '}
                on{' '}
                <a href={`/${activityFeed.organization}/${activityFeed.team}/reports/${report.id}`} className="font-medium text-gray-900">
                  {report.title}
                </a>
              </span>
            )}
            {discussion && (
              <span>
                {' '}
                on{' '}
                <a href={`/${activityFeed.organization}/${activityFeed.team}/discussions/${discussion.id}`} className="font-medium text-gray-900">
                  {discussion.title}
                </a>
              </span>
            )}{' '}
            {moment(comment.created_at).fromNow()}
          </p>
        </div>
        <div className="mt-2 text-xs text-gray-700">
          <p>{comment.text}</p>
        </div>
      </div>
    </React.Fragment>
  );
};

const ActivityFeedTag = ({ activityFeed, relations }: ActivityFeedProps) => {
  const tag: Tag = relations.tag[activityFeed.entity_id!];
  const user: User = relations.user[activityFeed.user_id!];
  return (
    <React.Fragment>
      <div>
        <div className="relative px-1">
          <div className="h-8 w-8 bg-gray-100 rounded-full ring-8 ring-white flex items-center justify-center">
            <TagIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 py-0">
        <div className="text-sm leading-8 text-gray-500">
          <span className="mr-0.5">
            <a href="#" className="font-medium text-gray-900">
              {user.display_name}
            </a>{' '}
            added tag
          </span>{' '}
          <span className="mr-0.5">
            <a href="#" className="relative inline-flex items-center rounded-full border border-gray-300 px-3 py-0.5 text-sm">
              <span className="absolute shrink-0 flex items-center justify-center">
                <span className={classNames('bg-indigo-500', 'h-1.5 w-1.5 rounded-full')} aria-hidden="true" />
              </span>
              <span className="ml-3.5 font-medium text-gray-900">{tag.name}</span>
            </a>
          </span>
          <span className="whitespace-nowrap">{moment(tag.created_at).fromNow()}</span>
        </div>
      </div>
    </React.Fragment>
  );
};

const ActivityFeedReport = ({ activityFeed, relations }: ActivityFeedProps) => {
  const report: Report = relations.report[activityFeed.entity_id!];
  const user: User = relations.user[activityFeed.user_id!];
  return (
    <React.Fragment>
      <div>
        <div className="relative px-1">
          <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H8} />
        </div>
      </div>
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm text-gray-500">
          <a href="#" className="font-medium text-gray-900">
            {user.display_name}
          </a>{' '}
          {activityFeed.action === ActionEnum.ADD_AUTHOR && 'was added like author in report '}
          {activityFeed.action === ActionEnum.CREATE && 'created the report '}
          {activityFeed.action === ActionEnum.NEW_VERSION && 'uploaded new version of the report '}
          {activityFeed.action === ActionEnum.DELETE && 'deleted the report '}
          {activityFeed.action === ActionEnum.UPDATE && 'updated the report '}
          {activityFeed.action === ActionEnum.PIN && 'pinned the report '}
          {activityFeed.action === ActionEnum.UNPIN && 'unpinned the report '}
          {activityFeed.action === ActionEnum.PIN_GLOBAL && 'pinned the report '}
          {activityFeed.action === ActionEnum.UNPIN_GLOBAL && 'unpinned the report '}
          {activityFeed.action === ActionEnum.STAR && 'liked the report '}
          {activityFeed.action === ActionEnum.UNSTAR && 'unliked the report '}
          {activityFeed.action !== ActionEnum.DELETE ? (
            <a href={`/${activityFeed.organization}/${activityFeed.team}/reports/${report.id}`} className="font-medium text-blue-600 underline">
              {report.title}
            </a>
          ) : (
            <span className="font-medium text-gray-900">{report.title}</span>
          )}{' '}
          {(activityFeed.action === ActionEnum.PIN_GLOBAL || activityFeed.action === ActionEnum.UNPIN_GLOBAL) && 'globally '}
          <span className="whitespace-nowrap">{moment(activityFeed.created_at).fromNow()}</span>
        </div>
      </div>
    </React.Fragment>
  );
};

const ActivityFeedDiscussion = ({ activityFeed, relations }: ActivityFeedProps) => {
  const discussion: Discussion = relations.discussion[activityFeed.entity_id!];
  const user: User = relations.user[activityFeed.user_id!];
  return (
    <React.Fragment>
      <div>
        <div className="relative px-1">
          <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H8} />
        </div>
      </div>
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm text-gray-500">
          <a href="#" className="font-medium text-gray-900">
            {user.display_name}
          </a>{' '}
          {activityFeed.action === ActionEnum.NEW_ASSIGNMENT && 'was added in the discussion '}
          {activityFeed.action === ActionEnum.REMOVE_ASSIGNMENT && 'was removed from the discussion '}
          {activityFeed.action === ActionEnum.NEW_MENTION && 'was mentioned in the discussion '}
          {activityFeed.action === ActionEnum.CREATE && 'started the discussion '}
          {activityFeed.action === ActionEnum.DELETE && 'deleted the discussion '}
          {activityFeed.action === ActionEnum.UPDATE && 'updated the discussion '}
          {activityFeed.action !== ActionEnum.DELETE ? (
            <a href={`/${activityFeed.organization}/${activityFeed.team}/discussions/${discussion.id}`} className="font-medium text-blue-600 underline">
              {discussion.title}
            </a>
          ) : (
            <span className="font-medium text-gray-900">{discussion.title}</span>
          )}{' '}
          <span className="whitespace-nowrap">{moment(activityFeed.created_at).fromNow()}</span>
        </div>
      </div>
    </React.Fragment>
  );
};

const ActivityFeedOrganization = ({ activityFeed, relations }: ActivityFeedProps) => {
  const organization: Organization = relations.organization[activityFeed.entity_id!];
  const user: User = relations.user[activityFeed.user_id!];
  return (
    <React.Fragment>
      <div>
        <div className="relative px-1">
          <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H8} />
        </div>
      </div>
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm text-gray-500">
          <a href="#" className="font-medium text-gray-900">
            {user.display_name}
          </a>{' '}
          {activityFeed.action === ActionEnum.ADD_MEMBER && 'was added as a member in the organization '}
          {activityFeed.action === ActionEnum.REMOVE_MEMBER && 'was removed from the organization '}
          <a href={`/${activityFeed.organization}`} className="font-medium text-gray-900">
            {organization.display_name}
          </a>{' '}
          <span className="whitespace-nowrap">{moment(activityFeed.created_at).fromNow()}</span>
        </div>
      </div>
    </React.Fragment>
  );
};

const ActivityFeedTeam = ({ activityFeed, relations }: ActivityFeedProps) => {
  const team: Team = relations.team[activityFeed.entity_id!];
  const user: User = relations.user[activityFeed.user_id!];
  return (
    <React.Fragment>
      <div>
        <div className="relative px-1">
          <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H8} />
        </div>
      </div>
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm text-gray-500">
          <a href="#" className="font-medium text-gray-900">
            {user.display_name}
          </a>{' '}
          {activityFeed.action === ActionEnum.ADD_MEMBER && 'was added as a member in the team '}
          {activityFeed.action === ActionEnum.REMOVE_MEMBER && 'was removed from the team '}
          <a href={`/${activityFeed.organization}/${activityFeed.team}`} className="font-medium text-gray-900">
            {team.display_name}
          </a>{' '}
          <span className="whitespace-nowrap">{moment(activityFeed.created_at).fromNow()}</span>
        </div>
      </div>
    </React.Fragment>
  );
};

interface Props {
  activityFeed: NormalizedResponseDTO<ActivityFeed[]> | null;
  hasMore: boolean;
  getMore: () => void;
}

const ActivityFeedComponent = ({ activityFeed, hasMore, getMore }: Props) => {
  if (!activityFeed) {
    return null;
  }
  return (
    <React.Fragment>
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {activityFeed.data.map((af: ActivityFeed, index: number) => {
            switch (af.entity) {
              case EntityEnum.COMMENT:
                if (!activityFeed.relations!.comment[af.entity_id!]) {
                  return null;
                }
                break;
              case EntityEnum.DISCUSSION:
                if (!activityFeed.relations!.discussion[af.entity_id!]) {
                  return null;
                }
                break;
              case EntityEnum.ORGANIZATION:
                if (!activityFeed.relations!.organization[af.entity_id!]) {
                  return null;
                }
                if (af.action !== ActionEnum.ADD_MEMBER && af.action !== ActionEnum.REMOVE_MEMBER) {
                  return null;
                }
                break;
              case EntityEnum.REPORT:
                if (!activityFeed.relations!.report[af.entity_id!]) {
                  return null;
                }
                break;
              case EntityEnum.TAG:
                if (!activityFeed.relations!.tag[af.entity_id!]) {
                  return null;
                }
                break;
              case EntityEnum.TEAM:
                if (!activityFeed.relations!.team[af.entity_id!]) {
                  return null;
                }
                if (af.action !== ActionEnum.ADD_MEMBER && af.action !== ActionEnum.REMOVE_MEMBER) {
                  return null;
                }
                break;
              default:
                return null;
            }
            return (
              <li key={af.id}>
                <div className="relative pb-8">
                  {index < activityFeed.data.length - 1 && <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />}
                  <div className="relative flex items-start space-x-3">
                    {af.entity === EntityEnum.COMMENT && <ActivityFeedComment activityFeed={af} relations={activityFeed.relations!} />}
                    {af.entity === EntityEnum.DISCUSSION && <ActivityFeedDiscussion activityFeed={af} relations={activityFeed.relations!} />}
                    {af.entity === EntityEnum.ORGANIZATION && <ActivityFeedOrganization activityFeed={af} relations={activityFeed.relations!} />}
                    {af.entity === EntityEnum.REPORT && <ActivityFeedReport activityFeed={af} relations={activityFeed.relations!} />}
                    {af.entity === EntityEnum.TAG && <ActivityFeedTag activityFeed={af} relations={activityFeed.relations!} />}
                    {af.entity === EntityEnum.TEAM && <ActivityFeedTeam activityFeed={af} relations={activityFeed.relations!} />}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {hasMore ? (
        <div className="flex justify-center items-center mt-4">
          <button onClick={getMore} className="text-sm text-gray-500">
            Load more
          </button>
        </div>
      ) : (
        <div className="flex justify-center items-center mt-4">
          <span className="text-sm text-gray-500">No more activity</span>
        </div>
      )}
    </React.Fragment>
  );
};

export default ActivityFeedComponent;
