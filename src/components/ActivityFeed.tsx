import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import { ChatAlt2Icon, ChatAltIcon, ChatIcon, DocumentReportIcon, TagIcon, UserGroupIcon } from '@heroicons/react/solid';
import type { ActivityFeed, Comment, Discussion, NormalizedResponseDTO, Organization, Relations, Report, Tag, Team, User } from '@kyso-io/kyso-model';
import { ActionEnum, EntityEnum } from '@kyso-io/kyso-model';
import moment from 'moment';
import React, { useMemo } from 'react';
import PureAvatar from './PureAvatar';

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
        <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full bg-white`}>
          <div className="flex -space-x-1 overflow-hidden items-end">
            <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H8} textSize={TailwindFontSizeEnum.XS} />
            <div className={`h-4 w-4 rounded-full -ml-2`}>
              <ChatIcon className="h-4 w-4 text-orange-400 -ml-2 bg-white rounded-full" />
            </div>
          </div>
        </span>
        <span className="absolute -bottom-0.5 -right-1 bg-white rounded-tl px-0.5 py-px">
          <ChatAltIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div>
          <div className="text-sm">
            <a href={`/user/${user.username}`} className="font-medium  text-gray-900 hover:text-indigo-600">
              {user.display_name}
            </a>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            Commented
            {report && (
              <span>
                {' '}
                on{' '}
                <a href={`/${activityFeed.organization}/${activityFeed.team}/${report.sluglified_name}`} className="font-medium  text-indigo-600 hover:text-indigo-700">
                  {report.title}
                </a>
              </span>
            )}
            {discussion && (
              <span>
                {' '}
                on{' '}
                <a href={`/${activityFeed.organization}/${activityFeed.team}/discussions/${discussion.id}`} className="font-medium  text-indigo-600 hover:text-indigo-700">
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
            <a href={`/user/${user.username}`} className="font-medium  text-gray-900 hover:text-indigo-600">
              {user.display_name}
            </a>{' '}
            added tag
          </span>{' '}
          <span className="mr-0.5">
            <span className="relative inline-flex items-center rounded-full border border-indigo-600 bg-indigo-600 px-2 py-0.5 text-xs">
              <span className="font-small text-white">{tag.name}</span>
            </span>
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
        <div className="relative">
          <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full bg-white`}>
            <div className="flex -space-x-1 overflow-hidden items-end">
              <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H8} textSize={TailwindFontSizeEnum.XS} />
              <div className={`h-4 w-4 rounded-full -ml-2`}>
                <DocumentReportIcon className="h-4 w-4 text-blue-500 -ml-2 bg-white rounded-full" />
              </div>
            </div>
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm text-gray-500">
          <a href={`/user/${user.username}`} className="font-medium  text-gray-900 hover:text-indigo-600">
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
            <a href={`/${activityFeed.organization}/${activityFeed.team}/${report.sluglified_name}`} className="font-medium text-indigo-600 hover:text-indigo-700">
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
        <div className="relative">
          <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full bg-white`}>
            <div className="flex -space-x-1 overflow-hidden items-end">
              <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H8} textSize={TailwindFontSizeEnum.XS} />
              <div className={`h-4 w-4 rounded-full -ml-2`}>
                <ChatAlt2Icon className="h-4 w-4 text-cyan-300 -ml-2 bg-white rounded-full" />
              </div>
            </div>
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm text-gray-500">
          <a href={`/user/${user.username}`} className="font-medium  text-gray-900 hover:text-indigo-600">
            {user.display_name}
          </a>{' '}
          {activityFeed.action === ActionEnum.NEW_ASSIGNMENT && 'was added in the discussion '}
          {activityFeed.action === ActionEnum.REMOVE_ASSIGNMENT && 'was removed from the discussion '}
          {activityFeed.action === ActionEnum.NEW_MENTION && 'was mentioned in the discussion '}
          {activityFeed.action === ActionEnum.CREATE && 'started the discussion '}
          {activityFeed.action === ActionEnum.DELETE && 'deleted the discussion '}
          {activityFeed.action === ActionEnum.UPDATE && 'updated the discussion '}
          {activityFeed.action !== ActionEnum.DELETE ? (
            <a href={`/${activityFeed.organization}/${activityFeed.team}/discussions/${discussion.id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
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
        <div className="relative">
          <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full bg-white`}>
            <div className="flex -space-x-1 overflow-hidden items-end">
              <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H8} textSize={TailwindFontSizeEnum.XS} />
              <div className={`h-4 w-4 rounded-full -ml-2`}>
                <UserGroupIcon className="h-4 w-4 text-purple-500 -ml-2 bg-white rounded-full" />
              </div>
            </div>
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm text-gray-500">
          <a href={`/user/${user.username}`} className="font-medium  text-gray-900 hover:text-indigo-600">
            {user.display_name}
          </a>{' '}
          {activityFeed.action === ActionEnum.ADD_MEMBER && 'was added as a member in the organization '}
          {activityFeed.action === ActionEnum.REMOVE_MEMBER && 'was removed from the organization '}
          {activityFeed.action === ActionEnum.CREATE && 'created the organization '}
          <a href={`/${activityFeed.organization}`} className="font-medium text-indigo-600 hover:text-indigo-700">
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
        <div className="relative">
          <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full bg-white`}>
            <div className="flex -space-x-1 overflow-hidden items-end">
              <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H8} textSize={TailwindFontSizeEnum.XS} />
              <div className={`h-4 w-4 rounded-full -ml-2`}>
                <UserGroupIcon className="h-4 w-4 text-purple-500 -ml-2 bg-white rounded-full" />
              </div>
            </div>
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm text-gray-500">
          <a href={`/user/${user.username}`} className="font-medium  text-gray-900 hover:text-indigo-600">
            {user.display_name}
          </a>{' '}
          {activityFeed.action === ActionEnum.ADD_MEMBER && 'was added as a member in the channel '}
          {activityFeed.action === ActionEnum.REMOVE_MEMBER && 'was removed from the channel '}
          {activityFeed.action === ActionEnum.CREATE && 'created the channel '}
          <a href={`/${activityFeed.organization}/${activityFeed.team}`} className="font-medium text-indigo-600 hover:text-indigo-700">
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

const NUM_ITEMS_ACTIVITY_FEED = 6;

const ActivityFeedComponent = ({ activityFeed, hasMore, getMore }: Props) => {
  const data: ActivityFeed[] = useMemo(() => {
    if (!activityFeed) {
      return [];
    }
    return activityFeed.data.slice(0, NUM_ITEMS_ACTIVITY_FEED);
  }, [activityFeed]);
  return (
    <React.Fragment>
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {data.map((af: ActivityFeed, index: number) => {
            switch (af.entity) {
              case EntityEnum.COMMENT:
                if (!activityFeed!.relations!.comment[af.entity_id!]) {
                  return null;
                }
                break;
              case EntityEnum.DISCUSSION:
                if (!activityFeed!.relations!.discussion[af.entity_id!]) {
                  return null;
                }
                break;
              case EntityEnum.ORGANIZATION:
                if (!activityFeed!.relations!.organization[af.entity_id!]) {
                  return null;
                }
                if (af.action !== ActionEnum.ADD_MEMBER && af.action !== ActionEnum.REMOVE_MEMBER && af.action !== ActionEnum.CREATE) {
                  return null;
                }
                break;
              case EntityEnum.REPORT:
                if (!activityFeed!.relations!.report[af.entity_id!]) {
                  return null;
                }
                break;
              case EntityEnum.TAG:
                if (!activityFeed!.relations!.tag[af.entity_id!]) {
                  return null;
                }
                break;
              case EntityEnum.TEAM:
                if (!activityFeed!.relations!.team[af.entity_id!]) {
                  return null;
                }
                if (af.action !== ActionEnum.ADD_MEMBER && af.action !== ActionEnum.REMOVE_MEMBER && af.action !== ActionEnum.CREATE) {
                  return null;
                }
                break;
              default:
                return null;
            }
            return (
              <li key={af.id}>
                <div className="relative pb-8">
                  {index < activityFeed!.data.length - 1 && <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-300" aria-hidden="true" />}
                  <div className="relative flex items-start space-x-3">
                    {af.entity === EntityEnum.COMMENT && <ActivityFeedComment activityFeed={af} relations={activityFeed!.relations!} />}
                    {af.entity === EntityEnum.DISCUSSION && <ActivityFeedDiscussion activityFeed={af} relations={activityFeed!.relations!} />}
                    {af.entity === EntityEnum.ORGANIZATION && <ActivityFeedOrganization activityFeed={af} relations={activityFeed!.relations!} />}
                    {af.entity === EntityEnum.REPORT && <ActivityFeedReport activityFeed={af} relations={activityFeed!.relations!} />}
                    {af.entity === EntityEnum.TAG && <ActivityFeedTag activityFeed={af} relations={activityFeed!.relations!} />}
                    {af.entity === EntityEnum.TEAM && <ActivityFeedTeam activityFeed={af} relations={activityFeed!.relations!} />}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {hasMore ? (
        <div className="flex justify-center items-center mt-6">
          {/* done */}
          <button onClick={getMore} className="text-sm px-2.5 py-1.5 rounded-md text-gray-500 bg-white hover:bg-gray-100 focus:outline-none ">
            Load more
          </button>
        </div>
      ) : (
        <div className="flex justify-center items-center mt-6">
          <span className="text-sm text-gray-500">No more activity</span>
        </div>
      )}
    </React.Fragment>
  );
};

export default ActivityFeedComponent;
