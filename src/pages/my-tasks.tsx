/* eslint no-prototype-builtins: "off" */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-case-declarations */
import { Menu, Transition } from '@headlessui/react';
import { SearchIcon, SelectorIcon, XIcon } from '@heroicons/react/solid';
import type { InlineCommentDto, ReportDTO, ResourcePermissions, UserDTO } from '@kyso-io/kyso-model';
import { InlineCommentStatusEnum, NormalizedResponseDTO, PaginatedResponseDto } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import moment from 'moment';
import { Calendar } from 'primereact/calendar';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Pagination from '../components/Pagination';
import PureAvatar from '../components/PureAvatar';
import PureAvatarGroup from '../components/PureAvatarGroup';
import TagInlineComment from '../components/inline-comments/components/tag-inline-comment';
import { useRedirectIfNoJWT } from '../hooks/use-redirect-if-no-jwt';
import type { SearchInlineCommentsQuery } from '../interfaces/search-inline-comments-query';
import type { IKysoApplicationLayoutProps } from '../layouts/KysoApplicationLayout';
import KysoApplicationLayout from '../layouts/KysoApplicationLayout';
import { TailwindFontSizeEnum } from '../tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '../tailwind/enum/tailwind-height.enum';
import type { CommonData } from '../types/common-data';

interface CalendarProps {
  onChange: (dateStr: string) => void;
}

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-8 py-10">
      <div role="status">
        <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

const CalendarOption = ({ onChange }: CalendarProps) => {
  return (
    <div>
      <Calendar
        value={moment().format('YYYY-MM-DD')}
        onChange={(e) => {
          if (e.value && moment(e.value as Date).isValid()) {
            const dateStr: string = moment(e.value as Date).format('YYYY-MM-DD');
            onChange(dateStr);
          }
        }}
        inline
        showWeek
      />
    </div>
  );
};

const LIMIT = 10;
const OPTIONS = [
  { label: 'Report Author', value: 'report_author_id', isFixed: true },
  { label: 'Task Author', value: 'inline_comment_author_id', isFixed: true },
  { label: 'Status', value: 'status', isFixed: true },
  { label: 'Channel', value: 'team_id', isFixed: true },
  { label: 'Text', value: 'text', isFixed: true },
  { label: 'Date', value: 'start_date', isFixed: true },
];
const MAX_USERS_TO_SHOW = 5;

enum Tab {
  OPENED = 'OPENED',
  CLOSED = 'CLOSED',
}

interface Props {
  commonData: CommonData;
  inlineCommentDto: InlineCommentDto;
  normalizedResponse: any;
}

const InlineCommentComponent = ({ commonData, inlineCommentDto, normalizedResponse }: Props) => {
  const [hoveredInlineComment, setHoveredInlineComment] = useState<boolean>(false);
  const report: ReportDTO | null = normalizedResponse.relations!.report[inlineCommentDto.report_id] ?? null;
  const file: File | null =
    normalizedResponse.relations.hasOwnProperty('file') && normalizedResponse.relations.file.hasOwnProperty(inlineCommentDto.file_id)
      ? normalizedResponse.relations.file[inlineCommentDto.file_id]
      : null;
  const users: UserDTO[] = [];
  let organization: ResourcePermissions | null = null;
  let team: ResourcePermissions | null = null;
  if (report) {
    for (const userId of report.author_ids) {
      const user: UserDTO | null = normalizedResponse.relations!.user[userId] ?? null;
      if (user !== null) {
        users.push(user);
      }
    }
    const indexOrganization: number = commonData.permissions!.organizations!.findIndex((resourcePermissions: ResourcePermissions) => resourcePermissions.name === report.organization_sluglified_name);
    if (indexOrganization !== -1) {
      organization = commonData.permissions!.organizations![indexOrganization]!;
      const indexTeam: number = commonData.permissions!.teams!.findIndex(
        (resourcePermissions: ResourcePermissions) => resourcePermissions.organization_id === organization!.id && resourcePermissions.name === report.team_sluglified_name,
      );
      if (indexTeam !== -1) {
        team = commonData.permissions!.teams![indexTeam]!;
      }
    }
  }
  const participants: { [id: string]: boolean } = {
    [inlineCommentDto.user_id]: true,
  };
  for (const reply of inlineCommentDto.inline_comments) {
    participants[reply.user_id] = true;
  }
  const numParticipants: number = Object.keys(participants).length;
  const queryParams: string = `?taskId=${inlineCommentDto.id}${inlineCommentDto.cell_id ? `&cell=${inlineCommentDto.cell_id.trim()}` : ''}${
    inlineCommentDto.orphan ? `&version=${inlineCommentDto.report_version}` : ''
  }${inlineCommentDto.orphan ? `&orphan=true` : ''}`;
  return (
    <a
      key={inlineCommentDto.id}
      className="flex flex-col py-4 border-b"
      href={`/${report?.organization_sluglified_name}/${report?.team_sluglified_name}/${report?.name}/${queryParams}`}
      onMouseEnter={() => {
        setHoveredInlineComment(true);
      }}
      onMouseLeave={() => {
        setHoveredInlineComment(false);
      }}
    >
      <div className="flex flex-row items-center">
        <span className="text-sm mr-10 font-thin" style={{ color: '#454F63' }}>
          {moment(inlineCommentDto.created_at).fromNow()}
        </span>
        <PureAvatar src={inlineCommentDto.user_avatar} title={inlineCommentDto.user_name} size={TailwindHeightSizeEnum.H10} textSize={TailwindFontSizeEnum.XS} />
        <span className="text-sm ml-4 grow font-thin" style={{ color: '#454F63' }}>
          {inlineCommentDto.user_name}
        </span>
        {inlineCommentDto.orphan && (
          <div className="flex flex-row items-center grow">
            <span className="text-sm text-slate-500 font-bold">This task is related to a {inlineCommentDto.cell_id ? 'cell' : 'file'} that does't exists in the latest version of the report</span>
          </div>
        )}
        <TagInlineComment status={inlineCommentDto.current_status} />
      </div>
      <div className="mt-5 mb-10">
        <p className={clsx('text-sm mb-1')} style={{ color: hoveredInlineComment ? '#4F46E7' : '#4D4F5C' }}>
          {inlineCommentDto.text}
        </p>
        <p className="text-sm text-slate-500">
          {organization?.display_name ?? 'Organization not found'} / {team?.display_name ?? 'Channel not found'} / {report?.title ?? 'Report not found'}
        </p>
      </div>
      <div className="flex flex-row items-center">
        <div className="flex flex-row items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#3ACCE1" className="w-5 h-5 mr-2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
            />
          </svg>
          <span className="text-sm text-slate-500">
            {inlineCommentDto.inline_comments.length} {inlineCommentDto.inline_comments.length === 1 ? 'reply' : 'replies'}
          </span>
        </div>
        <div className="flex flex-row items-center mx-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#F2B705" className="w-5 h-5 mr-2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
          </svg>
          <span className="text-sm text-slate-500">
            {numParticipants} {numParticipants === 1 ? 'participant' : 'participants'}
          </span>
        </div>
        <div className="flex flex-row items-center grow">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#96c4f2" className="w-5 h-5 mr-2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <span className={clsx('text-sm', file !== null ? 'text-slate-500' : 'text-red-400')}>{file ? `source /${file.name}` : 'File not found'}</span>
        </div>

        <div className="flex flex-row items-center">
          <span className="text-xs mr-2" style={{ color: '#4D4F5C' }}>
            Report {users.length === 1 ? 'Author' : 'Authors'}
          </span>
          <PureAvatarGroup data={users.slice(0, MAX_USERS_TO_SHOW)} />
        </div>
      </div>
    </a>
  );
};

interface CustomMenuItemsProps {
  options: { label: string; value: string; isFixed?: boolean; parent?: string }[];
  openedQuery: any;
  values: { label: string; value: string; parent?: string; isFixed?: boolean }[];
  setValues: (values: { label: string; value: string; parent?: string; isFixed?: boolean }[]) => void;
  showSearchInput: boolean;
}

const CustomMenuItems = ({ options, openedQuery, values, setValues, showSearchInput }: CustomMenuItemsProps) => {
  const inputRef = useRef<any>();
  const [query, setQuery] = useState<string>('');
  const fileteredOptions: { label: string; value: string; isFixed?: boolean; parent?: string }[] = useMemo(() => {
    const result: { label: string; value: string; isFixed?: boolean; parent?: string }[] = [...options];
    if (values.length > 0 && values[values.length - 1]?.parent && values[values.length - 1]?.isFixed) {
      result
        .sort((a, b) => {
          if (a.label.toLowerCase() < b.label.toLowerCase()) {
            return -1;
          }
          if (a.label.toLowerCase() > b.label.toLowerCase()) {
            return 1;
          }
          return 0;
        })
        .map((option) => ({ ...option, label: option.label.trim() }));
    }
    if (!query) {
      return result;
    }
    return result.filter((option: { label: string; value: string; isFixed?: boolean; parent?: string }) => option.label.toLowerCase().includes(query.toLowerCase()));
  }, [query, options, values]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef?.current]);

  return (
    <div className="py-1 px-2" style={{ width: '250px' }}>
      {showSearchInput && (
        <div className="relative mt-1 rounded-md shadow-sm">
          <input
            ref={inputRef}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 pl-3 mt-2"
            placeholder="Search..."
            value={query}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {query ? (
              <div
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuery('');
                }}
              >
                <XIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            ) : (
              <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            )}
          </div>
        </div>
      )}
      <div className="mt-2" style={{ maxHeight: '230px', overflowY: 'scroll' }}>
        {fileteredOptions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-sm text-gray-500">No results found</span>
          </div>
        )}
        {fileteredOptions.map((option: { label: string; value: string; isFixed?: boolean; parent?: string }, index: number) => (
          <Menu.Item key={index}>
            {({ active }) => {
              let disabled = false;
              if (option.value === 'team_id' && !openedQuery.organization_id) {
                disabled = true;
              }
              return (
                <button
                  onClick={(e) => {
                    if (disabled) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    setTimeout(() => {
                      const v: any[] = [...values];
                      v.push(option);
                      setValues(v);
                    }, 200);
                  }}
                  className={clsx(
                    'group flex w-full items-center rounded-md p-2 text-sm text-left',
                    active && !disabled ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    disabled ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer',
                  )}
                >
                  {option.label}
                </button>
              );
            }}
          </Menu.Item>
        ))}
      </div>
    </div>
  );
};

const Index = ({ commonData }: IKysoApplicationLayoutProps) => {
  useRedirectIfNoJWT();

  const [showMainSearchInput, setShowMainSearchInput] = useState<boolean>(true);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [openedNormalizedResponse, setOpenedNormalizedResponse] = useState<NormalizedResponseDTO<PaginatedResponseDto<InlineCommentDto>> | null>(null);
  const [closedNormalizedResponse, setClosedNormalizedResponse] = useState<NormalizedResponseDTO<PaginatedResponseDto<InlineCommentDto>> | null>(null);
  const [openedQuery, setOpenedQuery] = useState<SearchInlineCommentsQuery>({
    limit: LIMIT,
    page: 1,
    order_by: 'created_at',
    order_direction: 'desc',
  });
  const [closedQuery, setClosedQuery] = useState<SearchInlineCommentsQuery>({
    limit: LIMIT,
    page: 1,
    order_by: 'created_at',
    order_direction: 'desc',
  });
  const [requestingOpenedInlineComments, setRequestingOpenedInlineComments] = useState<boolean>(false);
  const [requestingClosedInlineComments, setRequestingClosedInlineComments] = useState<boolean>(false);
  const [values, setValues] = useState<{ label: string; value: string; parent?: string; isFixed?: boolean }[]>([]);
  const divRef = useRef<any>(null);
  const tabsRef = useRef<any>(null);
  const [textValue, setTextValue] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.OPENED);
  const openedPaginatedResponseDto: PaginatedResponseDto<InlineCommentDto> | null = useMemo(() => {
    if (openedNormalizedResponse === null) {
      return null;
    }
    return openedNormalizedResponse.data;
  }, [openedNormalizedResponse]);
  const closedPaginatedResponseDto: PaginatedResponseDto<InlineCommentDto> | null = useMemo(() => {
    if (closedNormalizedResponse === null) {
      return null;
    }
    return closedNormalizedResponse.data;
  }, [closedNormalizedResponse]);
  const options: { label: string; value: string; parent?: string; isFixed?: boolean }[] = useMemo(() => {
    if (values.length === 0) {
      return OPTIONS;
    }
    switch (values[values.length - 1]!.value) {
      case 'report_author_id':
      case 'inline_comment_author_id':
      case 'team_id':
        return [
          { label: '=', value: 'eq', parent: values[values.length - 1]!.value, isFixed: true },
          { label: '!=', value: 'ne', parent: values[values.length - 1]!.value, isFixed: true },
        ];
      case 'status':
        return [
          { label: '=', value: 'in', parent: values[values.length - 1]!.value, isFixed: true },
          { label: '!=', value: 'nin', parent: values[values.length - 1]!.value, isFixed: true },
        ];
      case 'text':
        return [{ label: 'Contains', value: 'text_contains', parent: values[values.length - 1]!.value }];
      case 'start_date':
      case 'end_date':
        return [
          { label: '<', value: 'lt', parent: values[values.length - 1]!.value, isFixed: true },
          { label: '<=', value: 'lte', parent: values[values.length - 1]!.value, isFixed: true },
          { label: '=', value: 'eq', parent: values[values.length - 1]!.value, isFixed: true },
          { label: '!=', value: 'ne', parent: values[values.length - 1]!.value, isFixed: true },
          { label: '>=', value: 'gte', parent: values[values.length - 1]!.value, isFixed: true },
          { label: '>', value: 'gt', parent: values[values.length - 1]!.value, isFixed: true },
        ];
      case 'lt':
      case 'lte':
      case 'in':
      case 'nin':
      case 'eq':
      case 'ne':
      case 'gte':
      case 'gt':
        switch (values[values.length - 2]!.value) {
          case 'report_author_id':
          case 'inline_comment_author_id':
            return users.map((user: UserDTO) => ({
              label: user.name,
              value: user.id,
              parent: values[values.length - 2]!.value,
            }));
          case 'status':
            return [
              { label: 'Open', value: InlineCommentStatusEnum.OPEN, parent: values[values.length - 2]!.value },
              { label: 'To do', value: InlineCommentStatusEnum.TO_DO, parent: values[values.length - 2]!.value },
              { label: 'Doing', value: InlineCommentStatusEnum.DOING, parent: values[values.length - 2]!.value },
              { label: 'Closed', value: InlineCommentStatusEnum.CLOSED, parent: values[values.length - 2]!.value },
            ];
          case 'team_id':
            return commonData
              .permissions!.teams!.filter((rp: ResourcePermissions) => rp.organization_id === openedQuery.organization_id)
              .map((rp: ResourcePermissions) => ({
                label: rp.display_name,
                value: rp.id,
                parent: values[values.length - 2]!.value,
              }));
          case 'start_date':
          case 'end_date':
            return [{ label: 'Today', value: 'calendar', parent: values[values.length - 2]!.value }];
          default:
            return [{ label: 'Date', value: 'date' }];
        }
      default:
        const filteredOptions: { label: string; value: string; isFixed: boolean }[] = OPTIONS.filter((option: { label: string; value: string; isFixed: boolean }) => {
          return !values.find((value) => value.value === option.value);
        });
        const indexStartDate: number = values.findIndex((value) => value.value === 'start_date');
        if (indexStartDate !== -1) {
          const indexEndDate: number = values.findIndex((value) => value.value === 'end_date');
          if (indexEndDate === -1) {
            filteredOptions.push({ label: 'Date', value: 'end_date', isFixed: true });
          }
        }
        return filteredOptions;
    }
  }, [values, openedQuery?.organization_id]);
  const [queryOrg, setQueryOrg] = useState<string>('');
  const orgResourcePermissions: ResourcePermissions[] = useMemo(() => {
    if (!commonData.permissions?.organizations) {
      return [];
    }
    commonData.permissions.organizations.sort((a: ResourcePermissions, b: ResourcePermissions) => {
      if (a.display_name.toLowerCase() < b.display_name.toLowerCase()) {
        return -1;
      }
      if (a.display_name.toLowerCase() > b.display_name.toLowerCase()) {
        return 1;
      }
      return 0;
    });
    return queryOrg === ''
      ? [{ id: '', display_name: 'All' } as any, ...commonData.permissions.organizations]
      : commonData.permissions.organizations.filter((rp: ResourcePermissions) => rp.display_name.toLowerCase().replace(/\s+/g, '').includes(queryOrg.toLowerCase().replace(/\s+/g, '')));
  }, [commonData.permissions?.organizations, queryOrg]);
  const selectedOrgResourcePermission: ResourcePermissions = useMemo(() => {
    if (!orgResourcePermissions) {
      return { id: '', display_name: 'All' } as any;
    }
    return orgResourcePermissions.find((rp: ResourcePermissions) => rp.id === openedQuery?.organization_id) || ({ id: '', display_name: 'All' } as any);
  }, [orgResourcePermissions, openedQuery?.organization_id]);

  useEffect(() => {
    if (!commonData.token) {
      return;
    }
    getUsersSameOrganizations();
  }, [commonData.token]);

  useEffect(() => {
    if (!commonData.token) {
      return;
    }
    getOpenedInlineComments();
  }, [commonData.token, openedQuery]);

  useEffect(() => {
    if (!commonData.token) {
      return;
    }
    getClosedInlineComments();
  }, [commonData.token, closedQuery]);

  useEffect(() => {
    if (values.length === 0) {
      setShowMainSearchInput(true);
    }
    if (values.length > 0 && values[values.length - 1]!.isFixed) {
      return;
    }
    const copyQuery: SearchInlineCommentsQuery = { limit: LIMIT, page: 1, order_by: 'created_at', order_direction: 'desc' };
    if (openedQuery.organization_id) {
      copyQuery.organization_id = openedQuery.organization_id;
    }
    let i = 0;
    while (i < values.length) {
      const e: { label: string; value: string; isFixed?: boolean; parent?: string } = values[i]!;
      switch (e.value) {
        case 'text':
          copyQuery[e.value] = values[i + 1]!.value as any;
          break;
        case 'report_author_id':
        case 'inline_comment_author_id':
        case 'status':
        case 'team_id':
        case 'start_date':
        case 'end_date':
          copyQuery[e.value] = values[i + 2]!.value as any;
          copyQuery[`${e.value}_operator`] = values[i + 1]!.value as any;
          break;
        default:
          break;
      }
      i += 1;
    }
    setOpenedQuery(copyQuery);
    setClosedQuery(copyQuery);
  }, [values]);

  const getUsersSameOrganizations = async () => {
    try {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<UserDTO[]> = await api.getUsersSameOrganizations();
      setUsers(result.data);
    } catch (e) {}
  };

  const getOpenedInlineComments = async () => {
    if (openedQuery.status === InlineCommentStatusEnum.CLOSED) {
      const paginatedResponseDto: PaginatedResponseDto<InlineCommentDto> = new PaginatedResponseDto<InlineCommentDto>(1, 0, 0, [], 0, 0);
      const normalizedResponseDto: NormalizedResponseDTO<PaginatedResponseDto<InlineCommentDto>> = new NormalizedResponseDTO(paginatedResponseDto);
      setOpenedNormalizedResponse(normalizedResponseDto);
      return;
    }
    setRequestingOpenedInlineComments(true);
    const urlSearchParams: URLSearchParams = new URLSearchParams();
    urlSearchParams.append('limit', openedQuery.limit.toString());
    urlSearchParams.append('page', openedQuery.page.toString());
    urlSearchParams.append('order_by', openedQuery.order_by);
    urlSearchParams.append('order_direction', openedQuery.order_direction);
    if (openedQuery.report_author_id) {
      urlSearchParams.append('report_author_id', openedQuery.report_author_id);
    }
    if (openedQuery.report_author_id_operator) {
      urlSearchParams.append('report_author_id_operator', openedQuery.report_author_id_operator);
    }
    if (openedQuery.inline_comment_author_id) {
      urlSearchParams.append('inline_comment_author_id', openedQuery.inline_comment_author_id);
    }
    if (openedQuery.inline_comment_author_id_operator) {
      urlSearchParams.append('inline_comment_author_id_operator', openedQuery.inline_comment_author_id_operator);
    }
    if (openedQuery.status) {
      urlSearchParams.append('status', openedQuery.status);
    } else {
      urlSearchParams.append('status', [InlineCommentStatusEnum.DOING, InlineCommentStatusEnum.OPEN, InlineCommentStatusEnum.TO_DO].join(','));
    }
    if (openedQuery.status_operator) {
      urlSearchParams.append('status_operator', openedQuery.status_operator);
    } else {
      urlSearchParams.append('status_operator', 'in');
    }
    if (openedQuery.organization_id) {
      urlSearchParams.append('organization_id', openedQuery.organization_id);
    }
    if (openedQuery.team_id) {
      urlSearchParams.append('team_id', openedQuery.team_id);
    }
    if (openedQuery.team_id_operator) {
      urlSearchParams.append('team_id_operator', openedQuery.team_id_operator);
    }
    if (openedQuery.text) {
      urlSearchParams.append('text', openedQuery.text);
    }
    if (openedQuery.start_date) {
      urlSearchParams.append('start_date', openedQuery.start_date);
    }
    if (openedQuery.end_date) {
      urlSearchParams.append('end_date', openedQuery.end_date);
    }
    if (openedQuery.start_date_operator) {
      urlSearchParams.append('start_date_operator', openedQuery.start_date_operator);
    }
    if (openedQuery.end_date_operator) {
      urlSearchParams.append('end_date_operator', openedQuery.end_date_operator);
    }
    try {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<PaginatedResponseDto<InlineCommentDto>> = await api.searchInlineComments(urlSearchParams);
      setOpenedNormalizedResponse(result);
    } catch (e) {}
    setRequestingOpenedInlineComments(false);
  };

  const getClosedInlineComments = async () => {
    setRequestingClosedInlineComments(true);
    const urlSearchParams: URLSearchParams = new URLSearchParams();
    urlSearchParams.append('limit', closedQuery.limit.toString());
    urlSearchParams.append('page', closedQuery.page.toString());
    urlSearchParams.append('order_by', closedQuery.order_by);
    urlSearchParams.append('order_direction', closedQuery.order_direction);
    if (closedQuery.report_author_id) {
      urlSearchParams.append('report_author_id', closedQuery.report_author_id);
    }
    if (closedQuery.report_author_id_operator) {
      urlSearchParams.append('report_author_id_operator', closedQuery.report_author_id_operator);
    }
    if (closedQuery.inline_comment_author_id) {
      urlSearchParams.append('inline_comment_author_id', closedQuery.inline_comment_author_id);
    }
    if (closedQuery.inline_comment_author_id_operator) {
      urlSearchParams.append('inline_comment_author_id_operator', closedQuery.inline_comment_author_id_operator);
    }
    urlSearchParams.append('status', InlineCommentStatusEnum.CLOSED);
    urlSearchParams.append('status_operator', 'in');
    if (closedQuery.organization_id) {
      urlSearchParams.append('organization_id', closedQuery.organization_id);
    }
    if (closedQuery.team_id) {
      urlSearchParams.append('team_id', closedQuery.team_id);
    }
    if (closedQuery.team_id_operator) {
      urlSearchParams.append('team_id_operator', closedQuery.team_id_operator);
    }
    if (closedQuery.text) {
      urlSearchParams.append('text', closedQuery.text);
    }
    if (closedQuery.start_date) {
      urlSearchParams.append('start_date', closedQuery.start_date);
    }
    if (closedQuery.end_date) {
      urlSearchParams.append('end_date', closedQuery.end_date);
    }
    if (closedQuery.start_date_operator) {
      urlSearchParams.append('start_date_operator', closedQuery.start_date_operator);
    }
    if (closedQuery.end_date_operator) {
      urlSearchParams.append('end_date_operator', closedQuery.end_date_operator);
    }
    try {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<PaginatedResponseDto<InlineCommentDto>> = await api.searchInlineComments(urlSearchParams);
      setClosedNormalizedResponse(result);
    } catch (e) {}
    setRequestingClosedInlineComments(false);
  };

  const removeTag = (item: { label: string; value: string; isFixed?: boolean; parent?: string }) => {
    const v: any[] = [...values];
    let i: number = v.findIndex((e) => e.value === item.value && e.parent === item.parent);
    v.splice(i, 1);
    i -= 1;
    while (v.length > 0) {
      if (v[i]?.isFixed) {
        v.splice(i, 1);
        i -= 1;
      } else {
        break;
      }
    }
    setValues(v);
  };

  if (!commonData.permissions?.organizations) {
    return <div className="relative mx-auto mt-20 w-full max-w-container px-40">Loading...</div>;
  }

  return (
    <div className="relative mx-auto mt-20 w-full max-w-container px-40">
      <h1 className="mb-10 text-3xl font-extrabold tracking-tight text-slate-900">My Tasks</h1>
      {/* SEARCH BAR */}
      <div className="flex flex-row mb-6">
        <div className="rounded-md flex items-center">
          <span className="hover:bg-gray-100 border-y border-l rounded-l p-2 p-x-4 flex items-center w-fit text-xs lg:text-sm text-left font-medium text-gray-700">
            {selectedOrgResourcePermission.display_name}
          </span>
          <Menu as="div" className="relative w-fit inline-block text-left">
            <Menu.Button className={clsx('hover:bg-gray-100 border p-2 flex items-center w-fit text-xs lg:text-sm text-left font-medium text-gray-700 hover:outline-none rounded')}>
              <SelectorIcon className="shrink-0 h-5 w-5 text-gray-700 group-hover:text-gray-500" aria-hidden="true" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className=" z-50 origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-slate-200 ring-opacity/5 divide-y divide-gray-100 focus:outline-none">
                <div className="py-1">
                  <h3 className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Organizations</h3>
                  <div className="px-4 pb-2">
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <input
                        type="text"
                        name="account-number"
                        id="account-number"
                        className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Search"
                        value={queryOrg}
                        onChange={(e) => setQueryOrg(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {queryOrg ? (
                          <div className="cursor-pointer" onClick={() => setQueryOrg('')}>
                            <XIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                        ) : (
                          <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-start" style={{ maxHeight: '380px', overflow: 'overlay' }}>
                  {orgResourcePermissions.length === 0 && queryOrg !== '' ? (
                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700 text-sm">Nothing found.</div>
                  ) : (
                    orgResourcePermissions.map((rp: ResourcePermissions) => (
                      <Menu.Item key={rp.id}>
                        {({ active }) => (
                          <span
                            className={clsx(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              openedQuery.organization_id === rp.id ? 'font-bold' : 'font-normal',
                              'block px-4 py-2 text-sm cursor-pointer',
                            )}
                            onClick={() => {
                              setQueryOrg('');
                              setOpenedQuery({
                                limit: LIMIT,
                                page: 1,
                                order_by: 'created_at',
                                order_direction: 'desc',
                                organization_id: rp.id,
                              });
                              setClosedQuery({
                                limit: LIMIT,
                                page: 1,
                                order_by: 'created_at',
                                order_direction: 'desc',
                                organization_id: rp.id,
                              });
                              const copyValues: { label: string; value: string; parent?: string; isFixed?: boolean }[] = [];
                              for (const v of values) {
                                if (v.value !== 'team_id' && v.parent !== 'team_id') {
                                  copyValues.push({ ...v });
                                }
                              }
                              setValues(copyValues);
                            }}
                          >
                            {rp.display_name}
                          </span>
                        )}
                      </Menu.Item>
                    ))
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
        <div
          className="mx-5 grow relative px-4 py-2 font-semibold text-sm bg-white text-slate-700 dark:bg-slate-700 dark:text-white rounded-md shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 dark:ring-inset border-indigo-500 border-2 border-none cursor-text"
          style={{ textAlign: 'left' }}
          onClick={() => {
            if (options.length === 0) {
              return;
            }
            divRef?.current?.click();
          }}
        >
          {values.map((item: { label: string; value: string; isFixed?: boolean; parent?: string }, index: number) => {
            if (item?.parent === 'status' && !item.isFixed) {
              return (
                <span key={index} className="inline-flex items-center mr-2">
                  <TagInlineComment status={item.value as any} />
                  <button
                    type="button"
                    className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(item);
                    }}
                  >
                    <span className="sr-only">Remove</span>
                    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 stroke-gray-600/50 group-hover:stroke-gray-600/75">
                      <path d="M4 4l6 6m0-6l-6 6"></path>
                    </svg>
                    <span className="absolute -inset-1"></span>
                  </button>
                </span>
              );
            }
            let user: UserDTO | null = null;
            if ((item?.parent === 'report_author_id' || item?.parent === 'inline_comment_author_id') && !item.isFixed) {
              if (openedNormalizedResponse?.relations?.user && openedNormalizedResponse?.relations?.user[item.value]) {
                user = openedNormalizedResponse.relations.user[item.value];
              } else if (closedNormalizedResponse?.relations?.user && closedNormalizedResponse?.relations?.user[item.value]) {
                user = closedNormalizedResponse.relations.user[item.value];
              }
            }
            return (
              <span
                key={index}
                className={clsx('bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-1 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500 cursor-default')}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {user && (
                  <span className="mr-1">
                    <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H5} textSize={TailwindFontSizeEnum.XS} />
                  </span>
                )}
                {item.label}
                {!item.isFixed && (
                  <span
                    className="ml-2 text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(item);
                    }}
                  >
                    x
                  </span>
                )}
              </span>
            );
          })}
          <Menu as="div" className="relative text-left" style={{ width: '100%', display: 'inline' }}>
            {({ open, close }) => {
              useEffect(() => {
                if (open) {
                  setShowMainSearchInput(false);
                }
              }, [open]);
              return (
                <React.Fragment>
                  <Menu.Button ref={divRef}></Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items
                      static
                      className="absolute left-0 mt-2 origin-top-right divide-y divide-gray-100 rounded-md shadow-lg bg-white ring-1 ring-slate-200 ring-opacity/5 focus:outline-none"
                      style={{ width: 'auto' }}
                    >
                      {options.length === 1 && options[0]!.value === 'text_contains' && (
                        <div
                          className="p-4"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div style={{ width: '300px' }}>
                            <div className="mt-2">
                              <input
                                type="text"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Search..."
                                value={textValue}
                                onChange={(e) => setTextValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.code === 'Enter' && textValue.length > 0) {
                                    setTimeout(() => {
                                      const v: any[] = [...values];
                                      v.push({ value: textValue, label: textValue, parent: 'text' });
                                      setTextValue('');
                                      setValues(v);
                                      close();
                                    }, 200);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {options.length === 1 && options[0]!.value === 'calendar' && (
                        <CalendarOption
                          onChange={(dateStr: string) => {
                            setTimeout(() => {
                              const v: any[] = [...values];
                              v.push({ value: dateStr, label: dateStr, parent: v[v.length - 1].parent });
                              setValues(v);
                            }, 200);
                          }}
                        />
                      )}
                      {options.length > 1 && (
                        <CustomMenuItems
                          options={options}
                          openedQuery={openedQuery}
                          setValues={setValues}
                          values={values}
                          showSearchInput={
                            values.length > 0 &&
                            values[values.length - 1]!.parent !== undefined &&
                            values[values.length - 1]!.parent !== null &&
                            ['report_author_id', 'inline_comment_author_id', 'team_id'].includes(values[values.length - 1]!.parent!)
                          }
                        />
                      )}
                    </Menu.Items>
                  </Transition>
                </React.Fragment>
              );
            }}
          </Menu>
          {values.length > 0 && (
            <span
              className={clsx('bg-gray-100 text-gray-800 text-xs font-medium mr-2 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500 absolute right-0 cursor-pointer')}
              onClick={(e) => {
                e.stopPropagation();
                setOpenedQuery({
                  limit: LIMIT,
                  page: 1,
                  order_by: 'created_at',
                  order_direction: 'desc',
                });
                setClosedQuery({
                  limit: LIMIT,
                  page: 1,
                  order_by: 'created_at',
                  order_direction: 'desc',
                });
                setTimeout(() => {
                  setValues([]);
                }, 100);
              }}
            >
              <span className="text-xs font-medium text-gray-500 px-2.5 py-0.5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">x</span>
            </span>
          )}
          {showMainSearchInput && <input type="text" placeholder="Filter results..." className="w-full bg-transparent outline-none cursor-text border-0 p-0 text-sm font-light" />}
        </div>
        <select
          className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
          value={openedQuery.order_direction}
          onChange={(e) => {
            setOpenedQuery({
              ...openedQuery,
              order_direction: (e.target.value as any) ?? 'asc',
            });
            setClosedQuery({
              ...closedQuery,
              order_direction: (e.target.value as any) ?? 'asc',
            });
          }}
        >
          <option value="desc">Last created</option>
          <option value="asc">First created</option>
        </select>
      </div>
      {/* TABS */}
      <div className="hidden sm:block" ref={tabsRef}>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <span
              onClick={() => setSelectedTab(Tab.OPENED)}
              className={clsx(
                selectedTab === Tab.OPENED ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium cursor-pointer',
              )}
              aria-current={selectedTab === Tab.OPENED ? 'page' : undefined}
            >
              Opened {openedPaginatedResponseDto !== null ? `(${openedPaginatedResponseDto.totalItems})` : ''}
            </span>
            <span
              onClick={() => setSelectedTab(Tab.CLOSED)}
              className={clsx(
                selectedTab === Tab.CLOSED ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium cursor-pointer',
              )}
              aria-current={selectedTab === Tab.CLOSED ? 'page' : undefined}
            >
              Closed {closedPaginatedResponseDto !== null ? `(${closedPaginatedResponseDto.totalItems})` : ''}
            </span>
          </nav>
        </div>
      </div>
      {/* INLINE COMMENTS */}
      {selectedTab === Tab.OPENED &&
        (requestingOpenedInlineComments ? (
          <Loader />
        ) : (
          openedNormalizedResponse !== null &&
          openedPaginatedResponseDto !== null && (
            <React.Fragment>
              {openedPaginatedResponseDto.results.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-8 py-10">
                  <p className="text-gray-500 text-md">No results found</p>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col mt-8">
                    {openedPaginatedResponseDto.results.map((inlineCommentDto: InlineCommentDto) => (
                      <InlineCommentComponent key={inlineCommentDto.id} inlineCommentDto={inlineCommentDto} commonData={commonData} normalizedResponse={openedNormalizedResponse} />
                    ))}
                  </div>
                  <div className="mt-20">
                    <Pagination
                      numPages={openedPaginatedResponseDto.totalPages}
                      onPageChange={(page: number) => setOpenedQuery({ ...openedQuery, page })}
                      page={openedPaginatedResponseDto.currentPage}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          )
        ))}

      {selectedTab === Tab.CLOSED &&
        (requestingClosedInlineComments ? (
          <Loader />
        ) : (
          closedNormalizedResponse !== null &&
          closedPaginatedResponseDto !== null && (
            <React.Fragment>
              {closedPaginatedResponseDto.results.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-8 py-10">
                  <p className="text-gray-500 text-md">No results found</p>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col mt-8">
                    {closedPaginatedResponseDto.results.map((inlineCommentDto: InlineCommentDto) => (
                      <InlineCommentComponent key={inlineCommentDto.id} inlineCommentDto={inlineCommentDto} commonData={commonData} normalizedResponse={closedNormalizedResponse} />
                    ))}
                  </div>
                  <div className="mt-20">
                    <Pagination
                      numPages={closedPaginatedResponseDto.totalPages}
                      onPageChange={(page: number) => setClosedQuery({ ...closedQuery, page })}
                      page={closedPaginatedResponseDto.currentPage}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          )
        ))}
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
