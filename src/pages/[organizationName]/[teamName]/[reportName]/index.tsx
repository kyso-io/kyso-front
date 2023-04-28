/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable tailwindcss/no-contradicting-classname */
import ManageUsers from '@/components/ManageUsers';
import PureComments from '@/components/PureComments';
import PureReportHeader from '@/components/PureReportHeader';
import PureSideOverlayPanel from '@/components/PureSideOverlayPanel';
import PureTree from '@/components/PureTree';
import SomethingHappenedReport from '@/components/SomethingHappenedReport';
import TableOfContents from '@/components/TableOfContents';
import { ToasterIcons } from '@/enums/toaster-icons';
import { FileTypesHelper } from '@/helpers/FileTypesHelper';
import { Helper } from '@/helpers/Helper';
import { HelperPermissions } from '@/helpers/check-permissions';
import classNames from '@/helpers/class-names';
import { getReport } from '@/helpers/get-report';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { useChannelMembers } from '@/hooks/use-channel-members';
import useIsInViewport from '@/hooks/use-is-in-viewport';
import { ScrollDirection, useScrollDirection } from '@/hooks/use-scroll-direction';
import { useUserEntities } from '@/hooks/use-user-entities';
import type { Version } from '@/hooks/use-versions';
import { useVersions } from '@/hooks/use-versions';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { KeyValue } from '@/model/key-value.model';
import type { CommonData } from '@/types/common-data';
import type { FileToRender } from '@/types/file-to-render';
import type { Member } from '@/types/member';
import type { ReportData } from '@/types/report-data';
import UnpureReportRender from '@/unpure-components/UnpureReportRender';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCircleInfo } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowSmDownIcon, ClipboardCopyIcon } from '@heroicons/react/solid';
import type { Comment, GitCommit, GithubFileHash, File as KysoFile, KysoSetting, NormalizedResponseDTO, OrganizationMember, ReportDTO, TeamMember, User, UserDTO } from '@kyso-io/kyso-model';
import {
  AddUserOrganizationDto,
  CommentPermissionsEnum,
  InlineCommentPermissionsEnum,
  InviteUserDto,
  KysoSettingsEnum,
  ReportPermissionsEnum,
  TeamMembershipOriginEnum,
  TeamVisibilityEnum,
  UpdateOrganizationMembersDTO,
  UpdateReportRequestDTO,
  UpdateTeamMembersDTO,
  UserRoleDTO,
} from '@kyso-io/kyso-model';
import { Api, createCommentAction, deleteCommentAction, fetchReportCommentsAction, toggleUserStarReportAction, updateCommentAction } from '@kyso-io/kyso-store';
import { format } from 'date-fns';
import moment from 'moment';
import { useRouter } from 'next/router';
import { dirname } from 'path';
import { Tooltip } from 'primereact/tooltip';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

enum Tab {
  Files = 'files',
  Toc = 'toc',
}

const Index = ({ commonData, reportData, setReportData, setUser, showToaster, isCurrentUserVerified, isCurrentUserSolvedCaptcha }: IKysoApplicationLayoutProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [selfTree, setSelfTree] = useState<GithubFileHash[]>([]);
  const [parentTree, setParentTree] = useState<GithubFileHash[]>([]);
  const [fileToRender, setFileToRender] = useState<FileToRender | null>(null);
  const version = router.query.version ? (router.query.version as string) : undefined;
  const versions: Version[] = useVersions({
    report: reportData?.report ? reportData.report : null,
    commonData,
  });
  const gitCommit: GitCommit | null = useMemo(() => {
    if (!versions) {
      return null;
    }
    if (versions.length === 0) {
      return null;
    }
    if (version) {
      const versionNumber: number = parseInt(version, 10);
      const index: number = versions.findIndex((v) => v.version === versionNumber);
      if (index === -1) {
        return null;
      }
      return versions[index]?.git_commit || null;
    }
    return versions[0]?.git_commit || null;
  }, [versions, version]);
  const [copiedCommitSha, setCopiedCommitSha] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const channelMembers: TeamMember[] = useChannelMembers({ commonData });
  const allComments = useAppSelector((state) => state.comments.entities);
  const userEntities: User[] = useUserEntities();
  const onlyVisibleCell = router.query.cell ? (router.query.cell as string) : undefined;
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const refComments = useRef<any>(null);
  const isInViewport = useIsInViewport(refComments);
  const scrollDirection: ScrollDirection | null = useScrollDirection();
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Toc);
  const [showEmails, setShowEmails] = useState<boolean>(false);
  const [teamVisibility, setTeamVisibility] = useState<TeamVisibilityEnum | null>(null);
  const [showError, setShowError] = useState<boolean>(true);
  const [showErrorMessage, setShowErrorMessage] = useState<string>('');
  const [showErrorRequestAccessButton, setShowErrorRequestAccessButton] = useState<boolean>(false);
  const isLastVersion: boolean = useMemo(() => {
    if (!reportData?.report) {
      return false;
    }
    if (!version) {
      return true;
    }
    const versionNumber: number = parseInt(version, 10);
    if (Number.isNaN(versionNumber)) {
      return true;
    }
    return versionNumber === reportData.report.last_version;
  }, [reportData]);

  const tabs: { title: string; tab: Tab }[] = useMemo(() => {
    const data: { title: string; tab: Tab }[] = [
      {
        title: 'Files',
        tab: Tab.Files,
      },
    ];
    if (reportData?.report && reportData.report.toc && reportData.report.toc.length > 0) {
      data.splice(0, 0, {
        title: 'Table of Contents',
        tab: Tab.Toc,
      });
    }
    return data;
  }, [reportData?.report]);

  useEffect(() => {
    if (reportData?.report && reportData.report.toc && reportData.report.toc.length > 0) {
      setSelectedTab(Tab.Toc);
    } else {
      setSelectedTab(Tab.Files);
    }
  }, [reportData?.report]);

  useEffect(() => {
    const getData = async () => {
      try {
        const publicKeys: KeyValue[] = await Helper.getKysoPublicSettings();
        const indexShowEmail: number = publicKeys.findIndex((keyValue: KeyValue) => keyValue.key === KysoSettingsEnum.GLOBAL_PRIVACY_SHOW_EMAIL);
        if (indexShowEmail !== -1) {
          setShowEmails(publicKeys[indexShowEmail]!.value === 'true');
        }
      } catch (errorHttp: any) {
        Helper.logError(errorHttp?.response?.data, errorHttp);
      }
    };
    getData();
  }, []);

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
        version,
        report: reportData.report,
        commonData,
      });
      setSelfTree(t);
      const pt: GithubFileHash[] = await getTree({
        path: dirname(path),
        version,
        report: reportData.report,
        commonData,
      });
      setParentTree(pt);
    };
    getData();
  }, [reportData?.report?.id, router.query.path]);

  const refreshReport = async () => {
    let versionNum: number = 0;
    if (version && !Number.isNaN(version as any)) {
      versionNum = parseInt(version as string, 10);
    }
    const rd: ReportData = await getReport({ token: commonData.token, team: commonData.team, reportName: router.query.reportName as string, version: versionNum });
    setReportData(rd);
  };

  const setReportFileAsMainFile = async () => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);

      const reportToUpdate: UpdateReportRequestDTO = new UpdateReportRequestDTO(
        report?.title!,
        report?.description!,
        report?.show_code!,
        report?.show_output!,
        fileToRender!.id,
        report?.tags!,
        [], // expects array of emails, putting an empty array makes no changes
        report?.toc!,
      );

      await api.updateReport(report!.id!, reportToUpdate);
      refreshReport();
    } catch (e: unknown) {
      Helper.logError('Unexpected error setting main file', e);
    }
  };

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
    const result: NormalizedResponseDTO<GithubFileHash | GithubFileHash[]> = await api.getReportFileTree(argsType);
    let tr = [result.data];
    if (result.data && Array.isArray(result.data)) {
      tr = [...result.data].sort((ta, tb) => {
        return Number(ta.type > tb.type);
      });
    }
    return tr as GithubFileHash[];
  };

  let currentPath = '';
  if (router.query.path) {
    if (Array.isArray(router.query.path)) {
      currentPath = (router.query.path as string[]).join('/') || '';
    } else {
      currentPath = (router.query.path as string) || '';
    }
  }

  useEffect(() => {
    if (!reportData || !reportData.report || !selfTree) {
      return;
    }

    const getData = async () => {
      const validFiles: GithubFileHash[] = selfTree.filter((item: GithubFileHash) => item.type === 'file');

      try {
        let ftr: FileToRender | null = null;

        if (currentPath) {
          const foundedFile = validFiles.find((x) => x.path_scs.endsWith(currentPath));

          if (foundedFile) {
            // Trick...
            ftr = foundedFile as unknown as FileToRender;
          } else {
            // Look for default files
            const defaultRenderFiles: string[] = [
              'Readme.md',
              'readme.md',
              'index.md',
              'index.html',
              'index.ipynb',
              'index.pptx',
              'index.docx',
              'index.xlsx',
              'index.doc',
              'index.ppt',
              'index.xsl',
              'index.txt',
              'index.pdf',
            ];

            let foundedDefault: boolean = false;
            for (const iFile of validFiles) {
              for (const defaultFile of defaultRenderFiles) {
                if (iFile.path.endsWith(defaultFile)) {
                  ftr = iFile as unknown as FileToRender;
                  foundedDefault = true;
                  break;
                }
              }

              if (foundedDefault) {
                break;
              }
            }
          }
        } else if (reportData.report && reportData.report.main_file && reportData.report.main_file_id && reportData.report.main_file_path_scs) {
          ftr = {
            path: reportData.report!.main_file,
            id: reportData.report!.main_file_id,
            path_scs: reportData.report!.main_file_path_scs,
            percentLoaded: 0,
            isLoading: false,
            content: null,
            toc: [],
            git_metadata: null,
            columns_stats: [],
          };
        }

        const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);
        if (ftr) {
          try {
            const resultFile: NormalizedResponseDTO<KysoFile> = await api.getReportFile(ftr.id);
            ftr.path = resultFile.data.name;
            ftr.path_scs = resultFile.data.path_scs;
            ftr.toc = resultFile.data.toc;
            ftr.git_metadata = resultFile.data.git_metadata;
            ftr.columns_stats = resultFile.data.columns_stats;
          } catch (e) {}
        }

        setFileToRender(ftr);
        const downloadFile: boolean =
          ftr !== null && (FileTypesHelper.isJupyterNotebook(ftr.path) || FileTypesHelper.isTextBasedFiled(ftr.path) || FileTypesHelper.isAdoc(ftr.path) || FileTypesHelper.isCode(ftr.path));
        if (ftr && downloadFile) {
          setFileToRender({ ...ftr, isLoading: true });
          const data: Buffer = await api.getReportFileContent(ftr.id, {
            onDownloadProgress(progressEvent) {
              if (progressEvent.lengthComputable) {
                const percentLoaded = progressEvent.loaded / progressEvent.total;
                setFileToRender({ ...(ftr as FileToRender), percentLoaded });
              } else {
                setFileToRender({ ...(ftr as FileToRender), percentLoaded: (fileToRender?.percentLoaded as number) + 1 });
              }
            },
          });
          let content = null;
          if (data && FileTypesHelper.isImage(ftr.path)) {
            content = Buffer.from(data).toString('base64');
          } else if (data) {
            content = Buffer.from(data).toString('utf-8');
          }
          setFileToRender({ ...ftr, content, isLoading: false });
        }
      } catch (e) {
        // error fetching file
        Helper.logError('Unexpected error', e);
      }
    };
    getData();
  }, [selfTree]);

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

  // START TEAM MEMBERS

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

  const searchUsers = async (query: string): Promise<void> => {
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const result: NormalizedResponseDTO<UserDTO[]> = await api.getUsers({
        userIds: [],
        page: 1,
        per_page: 1000,
        sort: '',
        search: query,
      });
      setUsers(result.data);
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
  };

  const updateMemberRole = async (userId: string, organizationRole: string, teamRole?: string): Promise<void> => {
    if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
      return;
    }

    const index: number = members.findIndex((m: Member) => m.id === userId);
    if (index === -1) {
      try {
        const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
        const addUserOrganizationDto: AddUserOrganizationDto = new AddUserOrganizationDto(commonData.organization!.id!, userId, organizationRole);
        await api.addUserToOrganization(addUserOrganizationDto);

        showToaster('User invited successfully', ToasterIcons.SUCCESS);
      } catch (e) {
        showToaster('We are sorry! Something happened updating the role of this member. Please try again.', ToasterIcons.ERROR);
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
    if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
      return;
    }

    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const inviteUserDto: InviteUserDto = new InviteUserDto(email, organizationRole, organizationRole);
      await api.inviteNewUser(inviteUserDto);
      getTeamMembers();
      showToaster('User invited successfully', ToasterIcons.SUCCESS);
    } catch (e) {
      showToaster('We are sorry! Something happened inviting an user. Please try again.', ToasterIcons.ERROR);
      Helper.logError('Unexpected error', e);
    }
  };

  const removeUser = async (userId: string, type: TeamMembershipOriginEnum): Promise<void> => {
    if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
      return;
    }
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

  useEffect(() => {
    if (!commonData.team) {
      return;
    }
    getTeamMembers();
  }, [commonData?.team, commonData?.user]);
  // END TEAM MEMBERS

  useEffect(() => {
    if (reportData?.report?.id) {
      dispatch(
        fetchReportCommentsAction({
          reportId: reportData.report.id as string,
          sort: '-created_at',
        }),
      );
    }
  }, [reportData?.report?.id]);

  // TODO -> confusion as to whether these are Conmment or CommentDTO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitComment = async (newComment: any, parentComment: any) => {
    if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
      return;
    }

    if (parentComment && parentComment.id) {
      await dispatch(updateCommentAction({ commentId: parentComment.id, comment: newComment }));
    } else {
      await dispatch(createCommentAction(newComment));
    }

    if (reportData?.report) {
      await dispatch(
        fetchReportCommentsAction({
          reportId: reportData.report.id as string,
          sort: '-created_at',
        }),
      );
    }
  };

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

  // Edge case in which when someone removes himself as author, as the commonData is still the same, continue having visibility about the actions he/her
  // could do as author. For that a random ID is placed, to force the useMemo to reload the data
  // const random: string = uuid();
  const random: string = uuidv4();

  const hasPermissionCreateComment: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, CommentPermissionsEnum.CREATE), [commonData, random]);
  const hasPermissionReadComment: boolean = useMemo(
    () => (commonData.team?.visibility === TeamVisibilityEnum.PUBLIC ? true : HelperPermissions.checkPermissions(commonData, CommentPermissionsEnum.READ)),
    [commonData, random],
  );
  const hasPermissionDeleteComment: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, CommentPermissionsEnum.DELETE), [commonData, random]);
  const hasPermissionReadReport: boolean = useMemo(
    () => (commonData.team?.visibility === TeamVisibilityEnum.PUBLIC ? true : HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.READ)),
    [commonData, random],
  );
  const hasPermissionDeleteReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.DELETE), [commonData, random]);
  const hasPermissionEditReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.EDIT), [commonData, random]);
  const hasPermissionEditReportOnlyMine: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.EDIT_ONLY_MINE), [commonData, random]);
  const hasPermissionCreateInlineComment: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, InlineCommentPermissionsEnum.CREATE), [commonData, random]);
  const hasPermissionEditInlineComment: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, InlineCommentPermissionsEnum.EDIT), [commonData, random]);
  const hasPermissionDeleteInlineComment: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, InlineCommentPermissionsEnum.DELETE), [commonData, random]);

  const report = reportData ? reportData.report : null;
  const authors = reportData ? reportData.authors : [];

  useEffect(() => {
    if (!router.query.organizationName || !router.query.teamName) {
      return;
    }
    const getTeamVisibility = async () => {
      try {
        const quickApiCall: Api = new Api();
        const res: NormalizedResponseDTO<any> = await quickApiCall.getTeamVisibility(router.query.organizationName as string, router.query.teamName as string);
        setTeamVisibility(res.data.visibility);
      } catch (e) {}
    };
    getTeamVisibility();
  }, [router.query.organizationName, router.query.teamName]);

  useEffect(() => {
    if (commonData.errorOrganization) {
      setShowError(true);
      setShowErrorMessage(commonData.errorOrganization);
      setShowErrorRequestAccessButton(true);
      // renderSomethingHappened(commonData.errorOrganization, true, commonData, teamVisibility);
    } else if (commonData.errorTeam) {
      setShowError(true);
      setShowErrorMessage(commonData.errorTeam);
      setShowErrorRequestAccessButton(true);
      // return renderSomethingHappened(commonData.errorTeam, true, commonData, teamVisibility);
    } else if (!reportData) {
      setShowError(true);
      setShowErrorMessage("Can't retrieve report's contents");
      setShowErrorRequestAccessButton(false);
      // return renderSomethingHappened("Can't retrieve report's contents");
    } else if (reportData.errorReport) {
      setShowError(true);
      setShowErrorMessage(reportData.errorReport);
      setShowErrorRequestAccessButton(true);
      // return renderSomethingHappened(reportData.errorReport, true, commonData, teamVisibility);
    } else if (report && commonData && !hasPermissionReadReport) {
      setShowError(true);
      setShowErrorMessage("You don't have enough permissions to see this report");
      setShowErrorRequestAccessButton(true);
      // return renderSomethingHappened("You don't have enough permissions to see this report", true, commonData, teamVisibility);
    } else {
      setShowError(false);
    }
  }, [router.query, commonData.errorOrganization, commonData.errorTeam, reportData, reportData?.errorReport, hasPermissionReadReport]);

  const reportUrl = `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`;

  return (
    <>
      {showError && <SomethingHappenedReport whatHappened={showErrorMessage} addRequestAccessButton={showErrorRequestAccessButton} commonData={commonData} teamVisibility={teamVisibility} />}
      {!showError && (
        <div>
          <div className={classNames('hidden lg:block z-0 fixed lg:flex lg:flex-col h-full overflow--auto top-0 border-r ', sidebarOpen ? 'bg-gray-50 top-0 ' : 'bg-white')}>
            <div>
              <div className="flex flex-1 flex-col pt-32 mt-2">
                <nav className="flex-1 space-y-1">
                  <PureSideOverlayPanel key={report?.name} cacheKey={report?.name} setSidebarOpen={(p) => setSidebarOpen(p)}>
                    <>
                      {report && (
                        <React.Fragment>
                          <div className="border-b border-gray-200">
                            <nav className="pl-1 -mb-px flex space-x-8" aria-label="Tabs">
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
                              <PureTree
                                path={currentPath}
                                basePath={router.basePath}
                                commonData={commonData}
                                report={report}
                                version={router.query.version as string}
                                selfTree={selfTree}
                                parentTree={parentTree}
                                selectedFile={fileToRender!}
                                // onNavigation={(e) => {
                                //   e.preventDefault()
                                //   router.push(e.currentTarget.href)
                                // }}
                              />
                            )}
                          </div>
                        </React.Fragment>
                      )}
                    </>
                  </PureSideOverlayPanel>
                </nav>
              </div>
            </div>
          </div>

          <div className={classNames('flex flex-1 flex-col', sidebarOpen ? 'pl-64' : 'lg:pl-10')}>
            <main>
              <div className="w-full px-4 sm:px-6 md:px-10">
                <div className="py-4">
                  {report && (
                    <>
                      <div className="w-full flex lg:flex-col flex-col justify-between rounded">
                        <div className="w-full p-4">
                          <PureReportHeader
                            reportUrl={`${reportUrl}`}
                            frontEndUrl={frontEndUrl}
                            versions={versions}
                            fileToRender={fileToRender}
                            report={report}
                            authors={authors}
                            version={version}
                            onUpvoteReport={async () => {
                              if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
                                return;
                              }

                              await dispatch(toggleUserStarReportAction(report.id as string));
                              refreshReport();
                            }}
                            hasPermissionEditReport={
                              hasPermissionEditReport || /* report.user_id === commonData.user?.id || */ (report.author_ids.includes(commonData.user?.id as string) && hasPermissionEditReportOnlyMine)
                            }
                            hasPermissionDeleteReport={hasPermissionDeleteReport}
                            commonData={commonData}
                            onSetFileAsMainFile={setReportFileAsMainFile}
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
                          {gitCommit && (
                            <div className="bg-gray-100 text-gray-500 rounded bg-slate-50">
                              <div className="flex flex-row content-center items-center mt-2 p-4 text-sm text-slate-700">
                                <FontAwesomeIcon
                                  size="xl"
                                  style={{
                                    marginRight: 8,
                                  }}
                                  icon={faGithub}
                                />
                                <span className="grow">{gitCommit.message}</span>
                                <div className="mt-1 sm:mt-0 sm:col-span-2">
                                  <div className="max-w-lg flex rounded-md shadow-sm">
                                    <input
                                      defaultValue={gitCommit.hash.slice(0, 8)}
                                      type="text"
                                      disabled
                                      className="flex-1 block focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
                                      style={{ width: 100 }}
                                    />
                                    <button
                                      type="button"
                                      className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 sm:text-sm"
                                      onClick={async () => {
                                        navigator.clipboard.writeText(gitCommit.hash);
                                        setCopiedCommitSha(true);
                                        if (timeoutId != null) {
                                          clearTimeout(timeoutId);
                                        }
                                        const t: NodeJS.Timeout = setTimeout(() => {
                                          setCopiedCommitSha(false);
                                        }, 3000);
                                        setTimeoutId(t);
                                      }}
                                    >
                                      {!copiedCommitSha && <ClipboardCopyIcon className="w-5 h-5" />}
                                      {copiedCommitSha && 'Copied!'}
                                    </button>
                                  </div>
                                </div>
                                <span className="ml-1">on {format(new Date(gitCommit.date), 'MMM d, yyyy HH:mm')}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="border-y p-0 mx-4">
                          {fileToRender && onlyVisibleCell && (
                            <div className="w-full flex justify-end p-2 prose prose-sm text-xs max-w-none">
                              Showing only this cell.
                              <button
                                onClick={() => {
                                  const qs = { ...router.query };
                                  delete qs.cell;
                                  return router.push({
                                    query: { ...qs },
                                  });
                                }}
                                className="ml-1 text-blue-500"
                              >
                                View entire notebook
                              </button>
                            </div>
                          )}

                          {fileToRender && (
                            <UnpureReportRender
                              key={fileToRender.id}
                              fileToRender={fileToRender}
                              report={report}
                              channelMembers={channelMembers}
                              commonData={commonData}
                              onlyVisibleCell={onlyVisibleCell}
                              frontEndUrl={frontEndUrl}
                              enabledCreateInlineComment={hasPermissionCreateInlineComment}
                              enabledEditInlineComment={hasPermissionEditInlineComment}
                              enabledDeleteInlineComment={hasPermissionDeleteInlineComment}
                              isCurrentUserVerified={isCurrentUserVerified}
                              isCurrentUserSolvedCaptcha={isCurrentUserSolvedCaptcha}
                              setUser={setUser}
                              isLastVersion={isLastVersion}
                            />
                          )}

                          {!fileToRender && (
                            <button
                              type="button"
                              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              <span className="mt-2 block text-sm font-medium text-gray-900">Please choose a file in the filebrowser on the left.</span>
                            </button>
                          )}
                        </div>

                        {hasPermissionReadComment && (
                          <div ref={refComments} className="block pb-44 w-full p-4 pl-8">
                            <div className="prose max-w-none ">
                              <Tooltip target=".comments-info" />
                              <h4>
                                Report{`'`}s Comments{' '}
                                <FontAwesomeIcon
                                  className="comments-info"
                                  data-pr-tooltip="These comments are global to the report, and are shown in all files"
                                  style={{ height: '15px', color: '#bbb', paddingBottom: '10px', paddingLeft: '2px' }}
                                  icon={faCircleInfo}
                                />
                              </h4>
                            </div>
                            <PureComments
                              report={report}
                              commonData={commonData}
                              hasPermissionCreateComment={hasPermissionCreateComment}
                              hasPermissionDeleteComment={hasPermissionDeleteComment}
                              channelMembers={channelMembers}
                              submitComment={submitComment}
                              defaultPlaceholderText="Write a new report's global comment"
                              userSelectorHook={(id?: string): UserDTO | undefined => {
                                return id ? (userEntities.find((u) => u.id === id) as UserDTO | undefined) : undefined;
                              }}
                              onDeleteComment={async (id: string) => {
                                if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
                                  return;
                                }
                                await dispatch(deleteCommentAction(id as string));
                              }}
                              commentSelectorHook={(parentId: string | null = null) => {
                                const values: Comment[] = Object.values(allComments || []);
                                if (values.length === 0) {
                                  return [];
                                }
                                const filtered: Comment[] = values.filter((comment: Comment) => {
                                  return comment!.comment_id === parentId;
                                });
                                // Sort comments by created_at desc
                                filtered.sort((a: Comment, b: Comment) => {
                                  return moment(a.created_at!).isAfter(moment(b.created_at!)) ? -1 : 1;
                                });
                                return filtered;
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </main>
          </div>
          {scrollDirection === ScrollDirection.Down && !isInViewport && (
            <div className="sticky bottom-20 text-center">
              <button
                type="button"
                onClick={() => refComments.current?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-medium shadow-sm hover:bg-gray-50 focus:outline-none"
                style={{
                  fontSize: '14px',
                  color: '#234361',
                  boxShadow: 'rgb(0 0 0 / 24%) 0px 3px 8px',
                  border: 'none',
                }}
              >
                <ArrowSmDownIcon
                  className="mr-1 h-6 w-6 text-gray-400"
                  aria-hidden="true"
                  style={{
                    color: '#234361',
                  }}
                />
                Go to comments
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
