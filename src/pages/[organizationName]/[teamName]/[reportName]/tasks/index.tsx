/* eslint-disable @typescript-eslint/no-explicit-any */
import ManageUsers from '@/components/ManageUsers';
import PureReportHeader from '@/components/PureReportHeader';
import PureSideOverlayPanel from '@/components/PureSideOverlayPanel';
import PureTree from '@/components/PureTree';
import TableOfContents from '@/components/TableOfContents';
import { Helper } from '@/helpers/Helper';
import { HelperPermissions } from '@/helpers/check-permissions';
import classNames from '@/helpers/class-names';
import { getReport } from '@/helpers/get-report';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import type { Version } from '@/hooks/use-versions';
import { useVersions } from '@/hooks/use-versions';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { Member } from '@/types/member';
import type { ReportData } from '@/types/report-data';
import { Listbox, Transition } from '@headlessui/react';
import { ViewBoardsIcon, ViewListIcon } from '@heroicons/react/outline';
import { CheckIcon, ExclamationCircleIcon } from '@heroicons/react/solid';
import type { GithubFileHash, InlineCommentDto, File as KysoFile, KysoSetting, NormalizedResponseDTO, OrganizationMember, TeamMember, TeamMembershipOriginEnum, UserDTO } from '@kyso-io/kyso-model';
import { InlineCommentStatusEnum, KysoSettingsEnum, ReportPermissionsEnum, UpdateInlineCommentDto } from '@kyso-io/kyso-model';
import { Api, toggleUserStarReportAction } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import Board from 'react-trello';
import ReadMoreReact from 'read-more-react';
import { v4 as uuidv4 } from 'uuid';
import Pagination from '../../../../../components/Pagination';
import PureAvatar from '../../../../../components/PureAvatar';
import TagInlineComment from '../../../../../components/inline-comments/components/tag-inline-comment';
import { usePublicSetting } from '../../../../../hooks/use-public-setting';
import { TailwindFontSizeEnum } from '../../../../../tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '../../../../../tailwind/enum/tailwind-height.enum';

enum Tab {
  Files = 'files',
  Toc = 'toc',
}

enum TabsListView {
  Open = 'open',
  Closed = 'closed',
}

enum ViewType {
  List = 'list',
  Kanban = 'kanban',
}

const LIMIT = 10;
const sortOptions: { name: string; value: string }[] = [
  { name: 'Last created', value: 'created_at' },
  { name: 'Last updated', value: 'updated_at' },
];
const viewTypes: { name: string; value: ViewType }[] = [
  { name: 'List', value: ViewType.List },
  { name: 'Kanban', value: ViewType.Kanban },
];

const Index = ({ commonData, reportData, setReportData, showToaster, isCurrentUserSolvedCaptcha, isCurrentUserVerified }: IKysoApplicationLayoutProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const globalPrivacyShowEmailStr: any | null = usePublicSetting(KysoSettingsEnum.GLOBAL_PRIVACY_SHOW_EMAIL);
  const [result, setResult] = useState<NormalizedResponseDTO<InlineCommentDto[]> | null>(null);
  const [requesting, setRequesting] = useState<boolean>(true);
  const [selectedTabListView, setSelectedTabListView] = useState<TabsListView>(TabsListView.Open);
  const [page, setPage] = useState<number>(1);
  const [selectedSortOption, setSelectedSortOption] = useState<{ name: string; value: string }>(sortOptions[0]!);
  const [viewType, setViewType] = useState<ViewType>(ViewType.List);

  // START DATA REPORT
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Toc);
  const [selfTree, setSelfTree] = useState<GithubFileHash[]>([]);
  const [reportFiles, setReportFiles] = useState<KysoFile[]>([]);
  const path: string | undefined = router.query.path ? (router.query.path as string) : undefined;
  const version = router.query.version ? (router.query.version as string) : undefined;
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showEmails, setShowEmails] = useState<boolean>(false);
  const frontEndUrl = useAppSelector((s) => {
    const settings = s.kysoSettings?.publicSettings?.filter((x: KysoSetting) => x.key === KysoSettingsEnum.BASE_URL);
    if (settings && settings.length > 0) {
      return settings[0].value;
    }
    // Emergency case to just don't return undefined
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  });
  const versions: Version[] = useVersions({
    report: reportData?.report ? reportData.report : null,
    commonData,
  });
  const random: string = uuidv4();
  const hasPermissionCreateReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.CREATE), [commonData, random]);
  const hasPermissionEditReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.EDIT), [commonData, random]);
  const hasPermissionDeleteReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.DELETE), [commonData, random]);
  const hasPermissionEditReportOnlyMine: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.EDIT_ONLY_MINE), [commonData, random]);
  // END DATA REPORT

  const inlineCommentDtos: InlineCommentDto[] = useMemo(() => {
    if (!result) {
      return [];
    }
    if (viewType === ViewType.Kanban) {
      return result.data.sort((a: InlineCommentDto, b: InlineCommentDto) => {
        if (selectedSortOption.value === 'created_at') {
          return moment(b.created_at).diff(moment(a.created_at));
        }
        return moment(b.updated_at).diff(moment(a.updated_at));
      });
    }
    return result.data
      .filter((x: InlineCommentDto) => {
        if (selectedTabListView === TabsListView.Open) {
          return x.current_status === InlineCommentStatusEnum.OPEN || x.current_status === InlineCommentStatusEnum.TO_DO || x.current_status === InlineCommentStatusEnum.DOING;
        }
        return x.current_status === InlineCommentStatusEnum.CLOSED;
      })
      .sort((a: InlineCommentDto, b: InlineCommentDto) => {
        if (selectedSortOption.value === 'created_at') {
          return moment(b.created_at).diff(moment(a.created_at));
        }
        return moment(b.updated_at).diff(moment(a.updated_at));
      });
  }, [result, selectedTabListView, selectedSortOption, viewType]);

  const paginatedInlineCommentDtos: InlineCommentDto[] = useMemo(() => {
    if (inlineCommentDtos.length === 0) {
      return [];
    }
    const start: number = (page - 1) * LIMIT;
    const end: number = start + LIMIT;
    return inlineCommentDtos.slice(start, end);
  }, [inlineCommentDtos, page]);

  const numPages: number = useMemo(() => {
    if (inlineCommentDtos.length === 0) {
      return 0;
    }
    return Math.ceil(inlineCommentDtos.length / LIMIT);
  }, [inlineCommentDtos]);

  const boardData: any = useMemo(() => {
    if (!commonData || !commonData.user || !reportData || !reportData.report) {
      return {
        lanes: [],
      };
    }
    const isUserAuthor = (inlineCommentDto: InlineCommentDto) => commonData.user?.id === inlineCommentDto?.user_id;
    const isReportAuthor: boolean = reportData.report.author_ids.includes(commonData.user?.id);
    const inlineCommentToCard = (x: InlineCommentDto, draggable: boolean): any => {
      return {
        id: x.id,
        title: x.user_name,
        description: x.text.length > 225 ? `${x.text.substring(0, 225)}...` : x.text,
        label: moment(x.created_at).format('DD/MM/YYYY HH:mm'),
        draggable,
        metadata: x,
      };
    };
    const openedTasks: InlineCommentDto[] = inlineCommentDtos.filter((x: InlineCommentDto) => x.current_status === InlineCommentStatusEnum.OPEN);
    const todoTasks: InlineCommentDto[] = inlineCommentDtos.filter((x: InlineCommentDto) => x.current_status === InlineCommentStatusEnum.TO_DO);
    const doingTasks: InlineCommentDto[] = inlineCommentDtos.filter((x: InlineCommentDto) => x.current_status === InlineCommentStatusEnum.DOING);
    const closedTasks: InlineCommentDto[] = inlineCommentDtos.filter((x: InlineCommentDto) => x.current_status === InlineCommentStatusEnum.CLOSED);
    return {
      lanes: [
        {
          id: InlineCommentStatusEnum.OPEN,
          status: InlineCommentStatusEnum.OPEN,
          title: 'Open tasks',
          label: `${openedTasks.length}/${inlineCommentDtos.length}`,
          cards: openedTasks.map((x: InlineCommentDto) => {
            const draggable: boolean = isUserAuthor(x) && isReportAuthor;
            return inlineCommentToCard(x, draggable);
          }),
        },
        {
          id: InlineCommentStatusEnum.TO_DO,
          status: InlineCommentStatusEnum.TO_DO,
          title: 'To do tasks',
          label: `${todoTasks.length}/${inlineCommentDtos.length}`,
          cards: todoTasks.map((x: InlineCommentDto) => {
            const draggable: boolean = isUserAuthor(x) && isReportAuthor;
            return inlineCommentToCard(x, draggable);
          }),
        },
        {
          id: InlineCommentStatusEnum.DOING,
          status: InlineCommentStatusEnum.DOING,
          title: 'Doing tasks',
          label: `${doingTasks.length}/${inlineCommentDtos.length}`,
          cards: doingTasks.map((x: InlineCommentDto) => {
            const draggable: boolean = isUserAuthor(x) && isReportAuthor;
            return inlineCommentToCard(x, draggable);
          }),
        },
        {
          id: InlineCommentStatusEnum.CLOSED,
          status: InlineCommentStatusEnum.CLOSED,
          title: 'Closed tasks',
          label: `${closedTasks.length}/${inlineCommentDtos.length}`,
          cards: closedTasks.map((x: InlineCommentDto) => {
            const draggable: boolean = isUserAuthor(x) && isReportAuthor;
            return inlineCommentToCard(x, draggable);
          }),
        },
      ],
    };
  }, [inlineCommentDtos, commonData.user]);

  const title: string = useMemo(() => {
    if (viewType === ViewType.Kanban) {
      return 'Tasks';
    }
    return selectedTabListView === TabsListView.Open ? 'Ongoing tasks' : 'Finished tasks';
  }, [viewType, selectedTabListView]);

  useEffect(() => {
    if (!commonData.permissions || !commonData.permissions.organizations || !commonData.permissions.teams || !router.query.organizationName || !router.query.teamName) {
      return;
    }
    if (!HelperPermissions.belongsToOrganization(commonData, router.query.organizationName as string)) {
      if (commonData.token) {
        // If have a token, I want to show a "You have no permission" page. Because if I redirect directly the user
        // don't know what the hell happened
        // router.replace('/');
      } else {
        router.replace(`/login?redirect=${encodeURIComponent(`/${router.query.organizationName as string}/${router.query.teamName as string}/${router.query.reportName as string}`)}`);
      }
      return;
    }
    if (!HelperPermissions.belongsToTeam(commonData, router.query.organizationName as string, router.query.teamName as string)) {
      if (commonData.token) {
        // If have a token, I want to show a "You have no permission" page. Because if I redirect directly the user
        // don't know what the hell happened
        // router.replace(`/${router.query.organizationName as string}`);
      } else {
        router.replace(`/login?redirect=${encodeURIComponent(`/${router.query.organizationName as string}/${router.query.teamName as string}/${router.query.reportName as string}`)}`);
      }
    }
  }, [commonData?.permissions?.organizations, commonData?.permissions?.teams, router.query?.organizationName, router.query?.teamName]);

  useEffect(() => {
    if (!reportData || !reportData.report || !reportData.report.id) {
      return;
    }
    const getReportInlineComments = async () => {
      try {
        const api: Api = new Api(commonData.token);
        const response: NormalizedResponseDTO<InlineCommentDto[]> = await api.getInlineComments(reportData.report!.id!);

        // Remove duplicated comments (same text, in same cell_id, with different version)
        const tasksMap: Map<string, InlineCommentDto> = new Map<string, InlineCommentDto>();
        for (const t of response.data) {
          if (tasksMap.has(t.text)) {
            const savedTask = tasksMap.get(t.text);
            if (savedTask && savedTask.report_version && t.report_version) {
              if (savedTask.cell_id === t.cell_id && savedTask.report_version < t.report_version) {
                // t version is higher than saved version, replace it
                tasksMap.set(t.text, t);
              } // else, t version is lower than saved one
            } // else we dont have enough data... do nothing
          } else {
            tasksMap.set(t.text, t);
          }
        }

        response.data = Array.from(tasksMap.values());

        setResult(response);
      } catch (e) {}
      setRequesting(false);
    };
    getReportInlineComments();
  }, [commonData, reportData]);

  useEffect(() => {
    if (!globalPrivacyShowEmailStr) {
      return;
    }
    setShowEmails(globalPrivacyShowEmailStr === 'true');
  }, [globalPrivacyShowEmailStr]);

  useEffect(() => {
    if (reportData?.report && reportData.report.toc && reportData.report.toc.length > 0) {
      setSelectedTab(Tab.Toc);
    } else {
      setSelectedTab(Tab.Files);
    }
  }, [reportData?.report]);

  useEffect(() => {
    if (!reportData || !reportData.report || !commonData || !commonData.organization || !commonData.team) {
      return;
    }
    const getReportFiles = async () => {
      try {
        const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);
        const r: NormalizedResponseDTO<KysoFile[]> = await api.getReportFiles(reportData.report!.id!, version ? parseInt(version as string, 10) : reportData.report!.last_version);
        setReportFiles(r.data);
      } catch (e) {
        Helper.logError('Unexpected error getting report files', e);
      }
    };
    getReportFiles();
  }, [reportData?.report?.id, commonData?.organization, commonData?.team]);

  useEffect(() => {
    if (reportFiles.length === 0) {
      return;
    }
    const st: GithubFileHash[] = Helper.getReportTree(reportFiles, path);
    setSelfTree(st);
  }, [path, reportFiles]);

  useEffect(() => {
    if (!commonData.team) {
      return;
    }
    getTeamMembers();
  }, [commonData?.team, commonData?.user]);

  const tabs: { title: string; tab: Tab }[] = useMemo(() => {
    const data: { title: string; tab: Tab }[] = [
      {
        title: 'Files',
        tab: Tab.Files,
      },
    ];
    if (reportData?.report && reportData.report.toc && reportData.report.toc.length > 0) {
      data.splice(0, 0, {
        title: 'Index',
        tab: Tab.Toc,
      });
    }
    return data;
  }, [reportData?.report]);

  const refreshReport = async () => {
    let versionNum: number = 0;
    if (version && !Number.isNaN(version as any)) {
      versionNum = parseInt(version as string, 10);
    }
    const rd: ReportData = await getReport({ token: commonData.token, team: commonData.team, reportName: router.query.reportName as string, version: versionNum });
    setReportData(rd);
  };

  const searchUsers = async (query: string): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const r: NormalizedResponseDTO<UserDTO[]> = await api.getUsers({
        userIds: [],
        page: 1,
        per_page: 1000,
        sort: '',
        search: query,
      });
      setUsers(r.data);
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
  };

  const getTeamMembers = async () => {
    const m: Member[] = [];
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const resultOrgMembers: NormalizedResponseDTO<OrganizationMember[]> = await api.getOrganizationMembers(commonData.organization!.id!);
      let userMember: Member | null = null;
      resultOrgMembers.data.forEach((organizationMember: OrganizationMember) => {
        if (organizationMember.id === commonData.user?.id) {
          userMember = {
            id: organizationMember.id!,
            nickname: organizationMember.nickname,
            username: organizationMember.username,
            display_name: organizationMember.nickname,
            avatar_url: organizationMember.avatar_url,
            email: organizationMember.email,
            organization_roles: organizationMember.organization_roles,
            team_roles: [],
          };
        } else {
          m.push({
            id: organizationMember.id!,
            nickname: organizationMember.nickname,
            username: organizationMember.username,
            display_name: organizationMember.nickname,
            avatar_url: organizationMember.avatar_url,
            email: organizationMember.email,
            organization_roles: organizationMember.organization_roles,
            team_roles: [],
          });
        }
      });

      api.setTeamSlug(commonData.team!.sluglified_name);
      const resultTeamMembers: NormalizedResponseDTO<TeamMember[]> = await api.getTeamMembers(commonData.team!.id!);
      resultTeamMembers.data.forEach((teamMember: TeamMember) => {
        const member: Member | undefined = m.find((mem: Member) => mem.id === teamMember.id);
        if (userMember && userMember.id === teamMember.id) {
          userMember.team_roles = teamMember.team_roles;
          userMember.membership_origin = teamMember.membership_origin;
        } else if (member) {
          member.team_roles = teamMember.team_roles;
          member.membership_origin = teamMember.membership_origin;
        } else {
          m.push({
            id: teamMember.id!,
            nickname: teamMember.nickname,
            username: teamMember.username,
            display_name: teamMember.nickname,
            avatar_url: teamMember.avatar_url,
            email: teamMember.email,
            organization_roles: [],
            team_roles: teamMember.team_roles,
            membership_origin: teamMember.membership_origin,
          });
        }
      });
      if (userMember) {
        m.unshift(userMember);
      }
      setMembers(m);
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
  };

  const updateMemberRole = async (_userId: string, _organizationRole: string, _teamRole?: string): Promise<void> => {
    // Reloading of data is too fast, to retrieve the right value we need to wait a bit
    setTimeout(() => {
      getTeamMembers();
    }, 500);
  };

  const inviteNewUser = async (_email: string, _organizationRole: string): Promise<void> => {
    // Reloading of data is too fast, to retrieve the right value we need to wait a bit
    setTimeout(() => {
      getTeamMembers();
    }, 500);
  };

  const removeUser = async (_userId: string, _type: TeamMembershipOriginEnum): Promise<void> => {
    // Reloading of data is too fast, to retrieve the right value we need to wait a bit
    setTimeout(() => {
      getTeamMembers();
    }, 500);
  };

  if (requesting) {
    return (
      <div className="flex flex-col h-screen justify-center items-center">
        <div className="text-center">
          <div role="status">
            <svg aria-hidden="true" className="inline w-14 h-14 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </div>
    );
  }

  const report = reportData?.report;
  const reportUrl = `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`;
  const authors = reportData ? reportData.authors : [];
  if (!report) {
    return null;
  }

  const updateInlineCommentStatus = async (id: string, status: InlineCommentStatusEnum) => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }
    try {
      const inlineCommentDto: InlineCommentDto = inlineCommentDtos.find((ic: InlineCommentDto) => ic.id === id)!;
      if (inlineCommentDto.current_status === status) {
        return;
      }
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      const updateInlineCommentDto: UpdateInlineCommentDto = new UpdateInlineCommentDto(inlineCommentDto.id, inlineCommentDto.text, inlineCommentDto.mentions, status, inlineCommentDto.orphan);
      const response: NormalizedResponseDTO<InlineCommentDto> = await api.updateInlineComment(id, updateInlineCommentDto);
      const updatedInlineComment: InlineCommentDto = response.data;
      const copyResult: NormalizedResponseDTO<InlineCommentDto[]> = { ...result! };
      const copyData: InlineCommentDto[] = [...copyResult.data];
      const index: number = copyData.findIndex((inlineComment: InlineCommentDto) => inlineComment.id === id);
      copyData[index] = updatedInlineComment;
      copyResult.data = copyData;
      setResult(copyResult);
    } catch (e) {
      // Helper.logError("Unexpected error", e);;
    }
  };

  return (
    <div className="tasks">
      <div className={classNames('hidden lg:block z-0 fixed lg:flex lg:flex-col h-full overflow--auto top-0 border-r ', sidebarOpen ? 'bg-gray-50 top-0 ' : 'bg-white')}>
        <div className="flex flex-1 flex-col pt-32 mt-2">
          <nav className="flex-1 space-y-1">
            <PureSideOverlayPanel key={report?.name} cacheKey={report?.name} setSidebarOpen={(p) => setSidebarOpen(p)}>
              <React.Fragment>
                {report && (
                  <React.Fragment>
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((element: { title: string; tab: Tab }) => (
                          <a
                            key={element.tab}
                            onClick={() => setSelectedTab(element.tab)}
                            className={classNames(
                              element.tab === selectedTab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer',
                            )}
                          >
                            {element.title}
                          </a>
                        ))}
                      </nav>
                    </div>
                    <div className="py-2">
                      {selectedTab === Tab.Toc && <TableOfContents title="" toc={report.toc} collapsible={true} openInNewTab={false} />}
                      {selectedTab === Tab.Files && (
                        <PureTree path={''} basePath={router.basePath} commonData={commonData} report={report} version={router.query.version as string} selfTree={selfTree} reportFiles={reportFiles} />
                      )}
                    </div>
                  </React.Fragment>
                )}
              </React.Fragment>
            </PureSideOverlayPanel>
          </nav>
        </div>
      </div>
      <div className={classNames('flex flex-1 flex-col', sidebarOpen ? 'pl-64' : 'lg:pl-10')}>
        <main>
          <div className="w-full px-4 sm:px-6 md:px-10">
            {/* HEADER */}
            <div className="w-full flex lg:flex-col flex-col justify-between rounded">
              <div className="w-full p-4">
                <PureReportHeader
                  reportUrl={`${reportUrl}`}
                  frontEndUrl={frontEndUrl}
                  versions={versions}
                  fileToRender={null}
                  report={report}
                  authors={authors}
                  version={undefined}
                  onUpvoteReport={async () => {
                    await dispatch(toggleUserStarReportAction(report.id as string));
                    refreshReport();
                  }}
                  hasPermissionCreateReport={hasPermissionCreateReport}
                  hasPermissionEditReport={hasPermissionEditReport || (report.author_ids.includes(commonData.user?.id as string) && hasPermissionEditReportOnlyMine)}
                  hasPermissionDeleteReport={hasPermissionDeleteReport}
                  commonData={commonData}
                  onSetFileAsMainFile={() => {}}
                  isCurrentUserSolvedCaptcha={isCurrentUserSolvedCaptcha}
                  isCurrentUserVerified={isCurrentUserVerified}
                  showToaster={showToaster}
                >
                  <ManageUsers
                    commonData={commonData}
                    members={members}
                    onInputChange={(query: string) => searchUsers(query)}
                    users={users}
                    showTeamRoles={true}
                    onUpdateRoleMember={updateMemberRole}
                    onInviteNewUser={inviteNewUser}
                    onRemoveUser={removeUser}
                    showEmails={showEmails}
                    showToaster={showToaster}
                    isCurrentUserSolvedCaptcha={isCurrentUserSolvedCaptcha}
                    isCurrentUserVerified={isCurrentUserVerified}
                  />
                </PureReportHeader>
              </div>
            </div>
            {/* TASKS */}
            {!result ? (
              <div className="py-4 px-8">
                <h1 className="text-3xl font-bold text-gray-900 my-4">Tasks</h1>
                <div className="bg-yellow-50 p-4" style={{ width: '50%' }}>
                  <div className="flex">
                    <div className="shrink-0">
                      <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">There is no data available for this report yet.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 px-8 border-y">
                <div className="flex flex-row content-center my-3">
                  <h1 className="text-3xl font-bold text-gray-900 my-4 grow">{title}</h1>
                  <div className="">
                    {viewTypes.map((element: { name: string; value: ViewType }) => (
                      <div key={element.value} className={clsx('relative inline-block', element.value === viewType ? 'bg-slate-50' : '')}>
                        <button
                          type="button"
                          className="p-1.5 px-2 font-medium hover:bg-gray-100 text-sm text-gray-700 flex flex-row items-center focus:ring-0 focus:outline-none"
                          onClick={() => setViewType(element.value)}
                        >
                          {element.value === ViewType.List && <ViewListIcon className="w-5 h-5 mr-2" />}
                          {element.value === ViewType.Kanban && <ViewBoardsIcon className="w-5 h-5 mr-2" />}
                          {element.name}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {viewType === ViewType.List ? (
                  <React.Fragment>
                    <div className="hidden sm:block">
                      <div className="flex flex-row">
                        <nav className="border-b border-gray-200 -mb-px flex space-x-8 grow mr-10" aria-label="Tabs">
                          {[TabsListView.Open, TabsListView.Closed].map((tab: TabsListView) => (
                            <span
                              key={tab}
                              onClick={() => setSelectedTabListView(tab)}
                              className={clsx(
                                'cursor-pointer',
                                tab === selectedTabListView ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                              )}
                              aria-current={tab === selectedTabListView ? 'page' : undefined}
                            >
                              {Helper.ucFirst(tab)}
                            </span>
                          ))}
                        </nav>
                        <div className="flex flex-col">
                          <Listbox value={selectedSortOption} onChange={setSelectedSortOption}>
                            {({ open }) => (
                              <React.Fragment>
                                <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Sort by:</Listbox.Label>
                                <div className="relative mt-1">
                                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                    <span className="block truncate">{selectedSortOption.name}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                                      </svg>
                                    </span>
                                  </Listbox.Button>
                                  <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity/5 focus:outline-none sm:text-sm">
                                      {sortOptions.map((sortOption: { name: string; value: string }, index: number) => (
                                        <Listbox.Option
                                          key={index}
                                          className={({ active }) => classNames(active ? 'bg-indigo-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9')}
                                          value={sortOption}
                                        >
                                          {({ selected, active }) => (
                                            <React.Fragment>
                                              <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>{sortOption.name}</span>
                                              {selected ? (
                                                <span className={classNames(active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4')}>
                                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                              ) : null}
                                            </React.Fragment>
                                          )}
                                        </Listbox.Option>
                                      ))}
                                    </Listbox.Options>
                                  </Transition>
                                </div>
                              </React.Fragment>
                            )}
                          </Listbox>
                        </div>
                      </div>
                    </div>
                    {paginatedInlineCommentDtos.length === 0 ? (
                      <p className="mt-6 text-sm text-gray-500">There are not {selectedTabListView === TabsListView.Open ? 'opened' : 'closed'} tasks for this report</p>
                    ) : (
                      <React.Fragment>
                        <div className="overflow-hidden bg-white shadow sm:rounded-md my-4">
                          <ul role="list" className="divide-y divide-gray-200">
                            {paginatedInlineCommentDtos.map((inlineCommentDto: InlineCommentDto) => {
                              const participants: { [key: string]: boolean } = {
                                [inlineCommentDto.user_id]: true,
                              };
                              inlineCommentDto.inline_comments.forEach((inlineComment: InlineCommentDto) => {
                                participants[inlineComment.user_id] = true;
                              });
                              let file: File | null = null;
                              if (result!.relations!.file[inlineCommentDto.file_id]) {
                                file = result!.relations!.file[inlineCommentDto.file_id];
                              }

                              return (
                                <li key={inlineCommentDto.id} className="container-inline-comment">
                                  <Link href={Helper.buildTaskDetailPage(inlineCommentDto, report)} className="block hover:bg-gray-50">
                                    <div className="p-4 sm:px-6">
                                      <div className="flex items-center justify-between">
                                        <ReadMoreReact text={inlineCommentDto.text} ideal={200} readMoreText="Read more..." className="text-sm font-medium text-indigo-600" />
                                        <div className="ml-2 flex shrink-0">
                                          <TagInlineComment status={inlineCommentDto.current_status} />
                                        </div>
                                      </div>
                                      <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                          <p className="flex items-center text-sm text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                              />
                                            </svg>
                                            {Object.keys(participants).length} participans
                                          </p>
                                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:ml-6 sm:mt-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                                              />
                                            </svg>
                                            {inlineCommentDto.inline_comments.length} answers
                                          </p>
                                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:ml-6 sm:mt-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                                              />
                                            </svg>
                                            {inlineCommentDto.status_history.length - 1} status changes
                                          </p>
                                          {file && (
                                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:ml-6 sm:mt-0">
                                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                                                />
                                              </svg>
                                              source /{file.name}
                                            </p>
                                          )}
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                                            />
                                          </svg>
                                          <p>{moment(inlineCommentDto.created_at).fromNow()}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        {numPages > 1 && <Pagination numPages={numPages} onPageChange={(p: number) => setPage(p)} page={page} />}
                      </React.Fragment>
                    )}
                  </React.Fragment>
                ) : (
                  <Board
                    data={boardData}
                    // draggable={true}
                    editable={false}
                    hideCardDeleteIcon={true}
                    handleDragEnd={(inlineCommentId: string, _: string, newStatus: string) => updateInlineCommentStatus(inlineCommentId, newStatus as InlineCommentStatusEnum)}
                    components={{
                      BoardWrapper: (e: any) => e.children[0],
                      Section: (e: any) => {
                        return (
                          <div
                            style={{
                              height: '100%',
                              display: 'inline-block',
                              verticalAlign: 'top',
                              whiteSpace: 'normal',
                            }}
                          >
                            <div className={clsx('bg-gray-200 rounded', { 'mr-2': e.index < 3 })}>
                              <div className="mx-auto max-w-7xl py-2 px-4">
                                <div className="flex flex-row justify-between items-center">
                                  <TagInlineComment status={e.status} />
                                  <span className="text-xs text-gray-500">{e.label}</span>
                                </div>
                                {e.children[1]}
                              </div>
                            </div>
                          </div>
                        );
                      },
                      Card: (e: any) => {
                        const inlineCommentDto: InlineCommentDto = e.metadata;
                        return (
                          <Link href={Helper.buildTaskDetailPage(inlineCommentDto, report)} className="overflow-hidden bg-white sm:rounded-lg sm:shadow cursor-pointer">
                            <div className="bg-white px-4 py-5 sm:px-6 my-1">
                              <div className="flex space-x-3">
                                <div className="shrink-0">
                                  <PureAvatar src={inlineCommentDto.user_avatar} title={inlineCommentDto.user_name} size={TailwindHeightSizeEnum.H10} textSize={TailwindFontSizeEnum.XS} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-gray-900">
                                    <span>{inlineCommentDto.user_name}</span>
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    <span>{moment(inlineCommentDto.created_at).format('DD MMMM YYYY [at] HH:mm A')}</span>
                                  </p>
                                </div>
                              </div>
                              <div
                                className="mt-3 text-sm text-gray-500"
                                style={{
                                  width: 230,
                                }}
                              >
                                <ReadMoreReact text={inlineCommentDto.text || ''} ideal={100} readMoreText="Read more..." className="text-sm font-medium text-indigo-600" />
                              </div>
                            </div>
                          </Link>
                        );
                      },
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
