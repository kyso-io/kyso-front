/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/solid';
import type { AnalyticsSource, DeviceDetector, GithubFileHash, KysoSetting, NormalizedResponseDTO, OrganizationMember, ReportAnalytics, ReportDTO, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import {
  AddUserOrganizationDto,
  InviteUserDto,
  KysoSettingsEnum,
  ReportPermissionsEnum,
  TeamMembershipOriginEnum,
  UpdateOrganizationMembersDTO,
  UpdateTeamMembersDTO,
  UserRoleDTO,
} from '@kyso-io/kyso-model';
import { Api, toggleUserStarReportAction } from '@kyso-io/kyso-store';
import { ArcElement, Chart as ChartJS, Colors, Legend, Tooltip } from 'chart.js';
import clsx from 'clsx';
import { scaleLinear } from 'd3-scale';
import moment from 'moment';
import { useRouter } from 'next/router';
import { dirname } from 'path';
import React, { useEffect, useMemo, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { v4 as uuidv4 } from 'uuid';
import ManageUsers from '../../../../components/ManageUsers';
import PureAvatar from '../../../../components/PureAvatar';
import PureReportHeader from '../../../../components/PureReportHeader';
import PureSideOverlayPanel from '../../../../components/PureSideOverlayPanel';
import PureTree from '../../../../components/PureTree';
import TableOfContents from '../../../../components/TableOfContents';
import ToasterNotification from '../../../../components/ToasterNotification';
import { HelperPermissions } from '../../../../helpers/check-permissions';
import classNames from '../../../../helpers/class-names';
import { getReport } from '../../../../helpers/get-report';
import { Helper } from '../../../../helpers/Helper';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux-hooks';
import type { Version } from '../../../../hooks/use-versions';
import { useVersions } from '../../../../hooks/use-versions';
import KysoApplicationLayout from '../../../../layouts/KysoApplicationLayout';
import type { KeyValue } from '../../../../model/key-value.model';
import { TailwindFontSizeEnum } from '../../../../tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '../../../../tailwind/enum/tailwind-height.enum';
import type { CommonData } from '../../../../types/common-data';
import type { Member } from '../../../../types/member';
import type { ReportData } from '../../../../types/report-data';

import 'react-tooltip/dist/react-tooltip.css';

ChartJS.register(ArcElement, Tooltip, Legend, Colors);

const optionsPieChart = {
  plugins: {
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label(context: any) {
          const value: number = context.dataset.data[context.dataIndex];
          const percentage: number = (value / context.dataset.total) * 100;
          return `${context.label}: ${value} (${Helper.roundTwoDecimals(percentage)}%)`;
        },
      },
    },
  },
  responsive: true,
  maintainAspectRatio: false,
};

interface Props {
  commonData: CommonData;
  reportData: ReportData | null;
  setUser: (user: UserDTO) => void;
  setReportData: (data: ReportData | null) => void;
}

enum Tab {
  Files = 'files',
  Toc = 'toc',
}

const Index = ({ commonData, reportData, setUser, setReportData }: Props) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [result, setResult] = useState<NormalizedResponseDTO<ReportAnalytics> | null>(null);
  const [requesting, setRequesting] = useState<boolean>(true);
  const [tooltipContent, setTooltipContent] = useState<string>('');
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const reportAnalytics: ReportAnalytics | null = useMemo(() => {
    if (!result || !result.data) {
      return null;
    }
    return result.data;
  }, [result]);
  const relations: { [key: string]: any } = useMemo(() => {
    if (!result || !result.relations) {
      return {};
    }
    return result.relations;
  }, [result]);
  const lastInteractions: {
    user_id: string;
    timestamp: Date;
    action: string;
  }[] = useMemo(() => {
    const elements: {
      user_id: string;
      timestamp: Date;
      action: string;
      source?: string;
    }[] = [];
    if (!reportAnalytics) {
      return elements;
    }
    reportAnalytics.downloads.last_items.forEach((e: { timestamp: Date; user_id: string; source: AnalyticsSource }) => {
      elements.push({
        user_id: e.user_id,
        timestamp: e.timestamp,
        action: 'downloaded',
        source: e.source,
      });
    });
    reportAnalytics.shares.last_items.forEach((e: { timestamp: Date; user_id: string }) => {
      elements.push({
        user_id: e.user_id,
        timestamp: e.timestamp,
        action: 'share',
        source: 'web',
      });
    });
    return elements.sort(
      (
        a: {
          user_id: string;
          timestamp: Date;
          action: string;
        },
        b: {
          user_id: string;
          timestamp: Date;
          action: string;
        },
      ) => {
        return moment(b.timestamp).unix() - moment(a.timestamp).unix();
      },
    );
  }, [reportAnalytics]);
  const deviceChartData: any = useMemo(() => {
    if (!reportAnalytics || !reportAnalytics.views || !reportAnalytics.views.devices) {
      return null;
    }
    let total = 0;
    const labels: string[] = [];
    const dataDataSets: number[] = [];
    for (const label in reportAnalytics.views.devices) {
      if (reportAnalytics.views.devices[label]) {
        labels.push(Helper.ucFirst(label));
        dataDataSets.push(reportAnalytics.views.devices[label]!);
        total += reportAnalytics.views.devices[label]!;
      }
    }
    return {
      labels,
      datasets: [
        {
          data: dataDataSets,
          total,
        },
      ],
    };
  }, [reportAnalytics]);
  const operatingSystemsChartData: any = useMemo(() => {
    if (!reportAnalytics || !reportAnalytics.views || !reportAnalytics.views.os) {
      return null;
    }
    let total = 0;
    const labels: string[] = [];
    const dataDataSets: number[] = [];
    for (const label in reportAnalytics.views.os) {
      if (reportAnalytics.views.os[label]) {
        labels.push(Helper.ucFirst(label));
        dataDataSets.push(reportAnalytics.views.os[label]!);
        total += reportAnalytics.views.os[label]!;
      }
    }
    return {
      labels,
      datasets: [
        {
          data: dataDataSets,
          total,
        },
      ],
    };
  }, [reportAnalytics]);
  const clientsChartData: any = useMemo(() => {
    if (!reportAnalytics || !reportAnalytics.views || !reportAnalytics.views.client) {
      return null;
    }
    let total = 0;
    const labels: string[] = [];
    const dataDataSets: number[] = [];
    for (const label in reportAnalytics.views.client) {
      if (reportAnalytics.views.client[label]) {
        labels.push(Helper.ucFirst(label));
        dataDataSets.push(reportAnalytics.views.client[label]!);
        total += reportAnalytics.views.client[label]!;
      }
    }
    return {
      labels,
      datasets: [
        {
          data: dataDataSets,
          total,
        },
      ],
    };
  }, [reportAnalytics]);
  const locations: {
    location: string;
    coords: {
      lat: number;
      lng: number;
    } | null;
    count: number;
  }[] = useMemo(() => {
    if (!reportAnalytics || !reportAnalytics.views || !Array.isArray(reportAnalytics.views.locations)) {
      return [];
    }
    return reportAnalytics.views.locations.filter((e) => e.coords !== null);
  }, [reportAnalytics]);
  const popScale = useMemo(() => {
    let maxValue = 0;
    locations.forEach(
      (e: {
        location: string;
        coords: {
          lat: number;
          lng: number;
        } | null;
        count: number;
      }) => {
        maxValue = Math.max(maxValue, e.count);
      },
    );
    return scaleLinear().domain([0, maxValue]).range([0, 24]);
  }, [locations]);

  // START DATA REPORT
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Toc);
  const [selfTree, setSelfTree] = useState<GithubFileHash[]>([]);
  const [parentTree, setParentTree] = useState<GithubFileHash[]>([]);
  const version = router.query.version ? (router.query.version as string) : undefined;
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>('');
  const [alertIcon, setAlertIcon] = useState<JSX.Element>(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);
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
  const hasPermissionEditReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.EDIT), [commonData, random]);
  const hasPermissionDeleteReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.DELETE), [commonData, random]);
  const hasPermissionEditReportOnlyMine: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.EDIT_ONLY_MINE), [commonData, random]);
  // END DATA REPORT

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
    const getReportAnalytics = async () => {
      try {
        const api: Api = new Api(commonData.token);
        const r: NormalizedResponseDTO<ReportAnalytics> = await api.getReportAnalytics(reportData.report!.id!);
        setResult(r);
      } catch (e) {}
      setRequesting(false);
    };
    getReportAnalytics();
  }, [commonData, reportData]);

  useEffect(() => {
    const getData = async () => {
      try {
        const publicKeys: KeyValue[] = await Helper.getKysoPublicSettings();
        const indexHcaptchaEnabled: number = publicKeys.findIndex((keyValue: KeyValue) => keyValue.key === KysoSettingsEnum.HCAPTCHA_ENABLED);
        if (indexHcaptchaEnabled !== -1) {
          setCaptchaIsEnabled(publicKeys[indexHcaptchaEnabled]!.value === 'true');
        }
        const indexShowEmail: number = publicKeys.findIndex((keyValue: KeyValue) => keyValue.key === KysoSettingsEnum.GLOBAL_PRIVACY_SHOW_EMAIL);
        if (indexShowEmail !== -1) {
          setShowEmails(publicKeys[indexShowEmail]!.value === 'true');
        }
      } catch (errorHttp: any) {
        Helper.logError(errorHttp.response.data, errorHttp);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (reportData?.report && reportData.report.toc && reportData.report.toc.length > 0) {
      setSelectedTab(Tab.Toc);
    } else {
      setSelectedTab(Tab.Files);
    }
  }, [reportData?.report]);

  useEffect(() => {
    if (!reportData || !reportData.report) {
      return;
    }
    const getData = async () => {
      let path = '';
      if (router.query.path) {
        if (Array.isArray(router.query.path)) {
          path = (router.query.path as string[]).join('/') || '';
        } else {
          path = (router.query.path as string) || '';
        }
      }
      const t: GithubFileHash[] = await getTree({
        path,
        version: undefined,
        report: reportData.report,
        commonData,
      });
      setSelfTree(t);
      const pt: GithubFileHash[] = await getTree({
        path: dirname(path),
        version: undefined,
        report: reportData.report,
        commonData,
      });
      setParentTree(pt);
    };
    getData();
  }, [reportData?.report?.id, router.query.path]);

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

  const getTree = async (args: { path: string; report: ReportDTO | null | undefined; version?: string; commonData: CommonData }): Promise<GithubFileHash[]> => {
    const { report, version: v, commonData: cd } = args;
    let { path } = args;
    if (!report || !commonData) {
      return [];
    }
    if (path === null) {
      path = '';
    } else if (path === '.') {
      path = '';
    }
    interface ArgType {
      reportId: string;
      filePath: string;
      version?: number;
    }
    const argsType: ArgType = {
      reportId: report!.id as string,
      filePath: (path as string) || '',
    };
    if (v && !Number.isNaN(v)) {
      argsType.version = parseInt(v as string, 10);
    }
    const api: Api = new Api(commonData.token, cd.organization?.sluglified_name, cd.team?.sluglified_name);
    const r: NormalizedResponseDTO<GithubFileHash | GithubFileHash[]> = await api.getReportFileTree(argsType);
    let tr = [r.data];
    if (r.data && Array.isArray(r.data)) {
      tr = [...r.data].sort((ta, tb) => {
        return Number(ta.type > tb.type);
      });
    }
    return tr as GithubFileHash[];
  };

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

  const updateMemberRole = async (userId: string, organizationRole: string, teamRole?: string): Promise<void> => {
    const index: number = members.findIndex((m: Member) => m.id === userId);
    if (index === -1) {
      try {
        const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
        const addUserOrganizationDto: AddUserOrganizationDto = new AddUserOrganizationDto(commonData.organization!.id!, userId, organizationRole);
        await api.addUserToOrganization(addUserOrganizationDto);
        setShow(true);
        setAlertText('User invited successfully');
        setAlertIcon(<CheckCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
      } catch (e) {
        setShow(true);
        setAlertText('We are sorry! Something happened updating the role of this member. Please try again.');
        setAlertIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
        Helper.logError('Unexpected error', e);
      }
    } else {
      if (!members[index]!.organization_roles.includes(organizationRole)) {
        try {
          const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
          const userRoleDTO: UserRoleDTO = new UserRoleDTO(userId, organizationRole);
          const updateOrganizationMembersDTO: UpdateOrganizationMembersDTO = new UpdateOrganizationMembersDTO([userRoleDTO]);
          await api.updateOrganizationMemberRoles(commonData.organization!.id!, updateOrganizationMembersDTO);
        } catch (e) {
          Helper.logError('Unexpected error', e);
        }
      }
      if (teamRole && !members[index]!.team_roles.includes(teamRole)) {
        try {
          const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
          const userRoleDTO: UserRoleDTO = new UserRoleDTO(userId, teamRole);
          const updateTeamMembersDTO: UpdateTeamMembersDTO = new UpdateTeamMembersDTO([userRoleDTO]);
          await api.updateTeamMemberRoles(commonData.team!.id!, updateTeamMembersDTO);
        } catch (e) {
          Helper.logError('Unexpected error', e);
        }
      }
    }
    getTeamMembers();
  };

  const inviteNewUser = async (email: string, organizationRole: string): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const inviteUserDto: InviteUserDto = new InviteUserDto(email, organizationRole, organizationRole);
      await api.inviteNewUser(inviteUserDto);
      getTeamMembers();
      setShow(true);
      setAlertText('User invited successfully');
      setAlertIcon(<CheckCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
    } catch (e) {
      setShow(true);
      setAlertText('We are sorry! Something happened inviting an user. Please try again.');
      setAlertIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
      Helper.logError('Unexpected error', e);
    }
  };

  const removeUser = async (userId: string, type: TeamMembershipOriginEnum): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      if (type === TeamMembershipOriginEnum.ORGANIZATION) {
        await api.removeUserFromOrganization(commonData!.organization!.id!, userId);
      } else {
        api.setTeamSlug(commonData.team!.sluglified_name);
        await api.deleteUserFromTeam(commonData.team!.id!, userId);
      }
      getTeamMembers();
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
  };

  const refreshUserData = async () => {
    const api: Api = new Api(commonData.token);
    const r: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
    setUser(r.data);
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

  return (
    <React.Fragment>
      <div className={classNames('hidden lg:block z-0 fixed lg:flex lg:flex-col h-full overflow--auto top-0 border-r ', sidebarOpen ? 'bg-gray-50 top-0 ' : 'bg-white')}>
        <div>
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
                          <PureTree path={''} basePath={router.basePath} commonData={commonData} report={report} version={router.query.version as string} selfTree={selfTree} parentTree={parentTree} />
                        )}
                      </div>
                    </React.Fragment>
                  )}
                </React.Fragment>
              </PureSideOverlayPanel>
            </nav>
          </div>
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
                  hasPermissionEditReport={hasPermissionEditReport || (report.author_ids.includes(commonData.user?.id as string) && hasPermissionEditReportOnlyMine)}
                  hasPermissionDeleteReport={hasPermissionDeleteReport}
                  commonData={commonData}
                  onSetFileAsMainFile={() => {}}
                  setUser={setUser}
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
                    captchaIsEnabled={captchaIsEnabled}
                    onCaptchaSuccess={refreshUserData}
                    showEmails={showEmails}
                  />
                </PureReportHeader>
              </div>
            </div>
            {/* ANALYTICS */}
            {!result ? (
              <div className="py-4 px-8">
                <h1 className="text-3xl font-bold text-gray-900 my-4">Analytics</h1>
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
                <h1 className="text-3xl font-bold text-gray-900 my-4">Analytics</h1>
                <div className="flex flex-col items-center space-y-4 xl:flex-row xl:space-y-0 xl:space-x-4" style={{ position: 'relative', zIndex: -1 }}>
                  <div className="w-full py-4 px-8 bg-white rounded-xl flex items-center justify-between" style={{ border: '1px solid #3497FD' }}>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Shares</p>
                      <p className="text-2xl font-bold text-gray-900">{Helper.formatNumber(reportAnalytics?.shares.count)}</p>
                    </div>
                  </div>
                  <div className="w-full py-4 px-8 bg-white rounded-xl flex items-center justify-between" style={{ border: '1px solid #F2B705' }}>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Downloads</p>
                      <p className="text-2xl font-bold text-gray-900">{Helper.formatNumber(reportAnalytics?.downloads.count)}</p>
                    </div>
                  </div>
                  <div className="w-full py-4 px-8 bg-white rounded-xl flex items-center justify-between" style={{ border: '1px solid #3ACCE1' }}>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">{Helper.formatNumber(reportAnalytics?.views.count)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start space-y-4 xl:flex-row xl:space-y-0 xl:space-x-4 my-8 ">
                  <div className="flex flex-col w-full">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-lg sm:tracking-tight">Who visited this report</h2>
                    <ul role="list" className="">
                      {reportAnalytics?.views.last_items.slice(0, 5).map((e: { timestamp: Date; user_id: string; location: string | null; device: DeviceDetector | null }, index: number) => {
                        const userDto: UserDTO | undefined = relations.user[e.user_id];
                        if (!userDto) {
                          return null;
                        }
                        return (
                          <li key={index} className="py-3">
                            <div className="flex items-center space-x-4">
                              <div className="shrink-0">
                                <PureAvatar title={userDto.display_name} src={userDto.avatar_url} size={TailwindHeightSizeEnum.H8} textSize={TailwindFontSizeEnum.XS} username={userDto.username} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">{userDto.display_name}</p>
                                {/* <p className="truncate text-sm text-gray-500">{userDto.bio}</p> */}
                              </div>
                              <div>
                                <p className="truncate text-sm text-gray-500">{moment(e.timestamp).fromNow()}</p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div style={{ width: '40%' }}></div>
                  <div className="flex flex-col w-full">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-lg sm:tracking-tight">Last interactions</h2>
                    <ul role="list" className="">
                      {lastInteractions.slice(0, 5).map((e: { timestamp: Date; user_id: string; action: string }, index: number) => {
                        const userDto: UserDTO | undefined = relations.user[e.user_id];
                        if (!userDto) {
                          return null;
                        }
                        return (
                          <li key={index} className="py-3">
                            <div className="flex items-center space-x-4">
                              <div className="shrink-0">
                                <PureAvatar title={userDto.display_name} src={userDto.avatar_url} size={TailwindHeightSizeEnum.H8} textSize={TailwindFontSizeEnum.XS} username={userDto.username} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">{userDto.display_name}</p>
                                {/* <p className="truncate text-sm text-gray-500">{userDto.bio}</p> */}
                              </div>
                              <div className="text-right">
                                <p className="truncate text-xs text-gray-500">{moment(e.timestamp).fromNow()}</p>
                                <span
                                  className={clsx(
                                    'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium uppercase',
                                    e.action === 'downloaded' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800',
                                  )}
                                >
                                  {e.action}
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col items-start space-y-4 xl:flex-row xl:space-y-0 xl:space-x-4 my-8">
                  <div className="flex flex-col w-full">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-lg sm:tracking-tight">Locations</h2>
                    <div data-tooltip-id="my-tooltip" data-tooltip-place="top">
                      <ComposableMap projectionConfig={{ rotate: [-10, 0, 0] }} data-tip="">
                        <ZoomableGroup>
                          <Geographies geography="/features.json">
                            {({ geographies }) =>
                              geographies.map((geo) => {
                                return (
                                  <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#244362"
                                    style={{
                                      hover: {
                                        fill: '#839CB7',
                                        outline: 'none',
                                      },
                                      pressed: {
                                        fill: '#E42',
                                        outline: 'none',
                                      },
                                    }}
                                  />
                                );
                              })
                            }
                          </Geographies>
                          {locations.map(
                            (
                              d: {
                                location: string;
                                coords: {
                                  lat: number;
                                  lng: number;
                                } | null;
                                count: number;
                              },
                              index: number,
                            ) => {
                              return (
                                <Marker
                                  key={index}
                                  coordinates={[d.coords!.lng, d.coords!.lat]}
                                  onMouseEnter={(e) => {
                                    const r: { bottom: number; height: number; left: number; right: number; top: number; width: number; x: number; y: number } = (
                                      e.target as any
                                    )?.getBoundingClientRect();
                                    setTooltipContent(`${d.location}: ${d.count}`);
                                    setTooltipPosition({
                                      x: r.x + r.width / 2,
                                      y: r.y + 3,
                                    });
                                  }}
                                  onMouseLeave={() => {
                                    setTooltipContent('');
                                    setTooltipPosition(undefined);
                                  }}
                                >
                                  <circle fill="#F53" stroke="#FFF" r={popScale(d.count)} />
                                </Marker>
                              );
                            },
                          )}
                        </ZoomableGroup>
                      </ComposableMap>
                    </div>
                    <ReactTooltip id="my-tooltip" position={tooltipPosition}>
                      {tooltipContent}
                    </ReactTooltip>
                  </div>
                  <div style={{ width: '40%' }}></div>
                  <div className="flex flex-col w-full">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-lg sm:tracking-tight">Devices</h2>
                    <div className="flex flex-col items-center">
                      <div style={{ height: 400 }}>
                        <Pie data={deviceChartData} options={optionsPieChart} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start space-y-4 xl:flex-row xl:space-y-0 xl:space-x-4 my-8">
                  <div className="flex flex-col w-full">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-lg sm:tracking-tight">Operating Systems</h2>
                    <div className="flex flex-col items-center">
                      <div style={{ height: 400 }}>
                        <Pie data={operatingSystemsChartData} options={optionsPieChart} />
                      </div>
                    </div>
                  </div>
                  <div style={{ width: '40%' }}></div>
                  <div className="flex flex-col w-full">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-lg sm:tracking-tight">Clients</h2>
                    <div className="flex flex-col items-center">
                      <div style={{ height: 400 }}>
                        <Pie data={clientsChartData} options={optionsPieChart} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <ToasterNotification show={show} setShow={setShow} icon={alertIcon} message={alertText} />
    </React.Fragment>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
