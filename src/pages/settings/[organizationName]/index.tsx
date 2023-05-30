/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint no-prototype-builtins: "off" */
/* eslint no-continue: "off" */
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { Dialog, Switch, Transition } from '@headlessui/react';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { BookOpenIcon, ChatAlt2Icon, DocumentDuplicateIcon, ExclamationCircleIcon, LinkIcon, MailIcon, SearchIcon, UserGroupIcon, XIcon } from '@heroicons/react/solid';
import type { NormalizedResponseDTO, OrganizationMember, PaginatedResponseDto, ResourcePermissions, Team, TeamInfoDto, TeamsInfoQuery } from '@kyso-io/kyso-model';
import {
  AddUserOrganizationDto,
  AllowDownload,
  GlobalPermissionsEnum,
  InviteUserDto,
  KysoSettingsEnum,
  OnboardingProgress,
  OrganizationPermissionsEnum,
  TeamPermissionsEnum,
  UpdateJoinCodesDto,
  UpdateOrganizationMembersDTO,
  UserDTO,
  UserRoleDTO,
} from '@kyso-io/kyso-model';
// @ts-ignore
import ExpirationDateModal from '@/components/ExpirationDateModal';
import Pagination from '@/components/Pagination';
import PureAvatar from '@/components/PureAvatar';
import SettingsAside from '@/components/SettingsAside';
import { OrganizationSettingsTab } from '@/enums/organization-settings-tab';
import { ToasterIcons } from '@/enums/toaster-icons';
import { Helper } from '@/helpers/Helper';
import { checkJwt } from '@/helpers/check-jwt';
import { HelperPermissions } from '@/helpers/check-permissions';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { CommonData } from '@/types/common-data';
import type { Member } from '@/types/member';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import { Tooltip } from 'flowbite-react';
import debounce from 'lodash.debounce';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import ReadMoreReact from 'read-more-react';
import Link from 'next/link';
import { usePublicSetting } from '../../../hooks/use-public-setting';

const OrganizationRoleToLabel: { [role: string]: string } = {
  'organization-admin': 'Admin of this organization',
  'team-admin': 'Full access all channels',
  'team-contributor': 'Can edit all channels',
  'team-reader': 'Can comment all channels',
};

const debouncedFetchData = debounce((cb: () => void) => {
  cb();
}, 750);

const LIMIT_MEMBERS_BY_PAGE = 8;

const Index = ({ commonData, showToaster, hideToaster, isCurrentUserVerified, isCurrentUserSolvedCaptcha, isUserLogged }: IKysoApplicationLayoutProps) => {
  const router = useRouter();
  useRedirectIfNoJWT();
  const enableInvitationLinksGloballyStr: any | null = usePublicSetting(KysoSettingsEnum.ENABLE_INVITATION_LINKS_GLOBALLY);
  const { tab, edit, organizationName } = router.query;
  const ref = useRef<any>(null);
  const [query, setQuery] = useState<string>('');
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [requesting, setRequesting] = useState<boolean>(false);
  const [requestingTeamsInfo, setRequestingTeamsInfo] = useState<boolean>(false);
  const [queryTeam, setQueryTeam] = useState<string>('');
  const debounceTeamsInfoQuery = useMemo(() => debounce((text: string) => getTeamsInfo(1, text), 1000), [commonData.organization]);
  const [members, setMembers] = useState<Member[]>([]);
  const [queryUsers, setQueryUsers] = useState<string>('');
  const [paginationFilteredMembers, setPaginationFilteredMembers] = useState<{ page: number; numPages: number }>({
    page: 0,
    numPages: 0,
  });
  const filteredMembers: Member[] = useMemo(() => {
    if (!queryUsers) {
      return members;
    }
    const queryUserLower: string = queryUsers.toLowerCase();
    return members.filter((member: Member) => {
      const emailLower: string = member.email.toLowerCase();
      const displayNameLower: string = member.display_name.toLowerCase();
      return emailLower.includes(queryUserLower) || displayNameLower.includes(queryUserLower);
    });
  }, [members, queryUsers]);
  const filteredMembersPaginated: Member[] = useMemo(() => {
    if (filteredMembers.length === 0) {
      return [];
    }
    const start: number = (paginationFilteredMembers.page - 1) * LIMIT_MEMBERS_BY_PAGE;
    const end: number = start + LIMIT_MEMBERS_BY_PAGE;
    return filteredMembers.slice(start, end);
  }, [filteredMembers, paginationFilteredMembers]);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [openInviteUserModal, setOpenInviteUserModal] = useState<boolean>(false);
  const [openEditMemberModal, setOpenEditMemberModal] = useState<boolean>(false);
  const [openDeleteMemberModal, setOpenDeleteMemberModal] = useState<boolean>(false);
  const [organizationRole, setOrganizationRole] = useState<string>('');
  const [inputDeleteUser, setInputDeleteUser] = useState<string>('');
  const isOrgAdmin: boolean = useMemo(() => {
    const copyCommonData: CommonData = { ...commonData, team: null };
    return HelperPermissions.checkPermissions(copyCommonData, GlobalPermissionsEnum.GLOBAL_ADMIN) || HelperPermissions.checkPermissions(copyCommonData, OrganizationPermissionsEnum.ADMIN);
  }, [commonData]);
  const organizationsRoles: { label: string; value: string }[] = useMemo(() => {
    const data: { label: string; value: string }[] = [];
    for (const orgRole in OrganizationRoleToLabel) {
      if (OrganizationRoleToLabel[orgRole]) {
        data.push({ label: OrganizationRoleToLabel[orgRole]!, value: orgRole });
      }
    }
    return data;
  }, []);
  const hasPermissionCreateChannel: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, TeamPermissionsEnum.CREATE), [commonData]);
  const [invitationsLinksGloballyEnabled, setInvitationsLinksGloballyEnabled] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [bio, setBio] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [allowDownload, setAllowDownload] = useState<AllowDownload>(AllowDownload.ALL);
  const [file, setFile] = useState<File | null>(null);
  const [urlLocalFile, setUrlLocalFile] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState<string>('');
  const [allowedAccessDomains, setAllowedAccessDomains] = useState<string[]>([]);
  const [errorNewDomain, setErrorNewDomain] = useState<string>('');
  const [centralizedNotifications, setCentralizedNotifications] = useState<boolean>(false);
  const [emailsCentralizedNotifications, setEmailsCentralizedNotifications] = useState<string[]>([]);
  const [newEmailCentralizedNotifications, setNewEmailCentralizedNotifications] = useState<string>('');
  const [slackToken, setSlackToken] = useState<string>('');
  const [slackChannel, setSlackChannel] = useState<string>('');
  const [teamsIncomingWebhookUrl, setTeamsIncomingWebhookUrl] = useState<string>('');
  const [errorNewEmail, setErrorNewEmail] = useState<string>('');
  const [loginKyso, setLoginKyso] = useState<boolean>(false);
  const [loginGoogle, setLoginGoogle] = useState<boolean>(false);
  const [loginGithub, setLoginGithub] = useState<boolean>(false);
  const [loginBitbucket, setLoginBitbucket] = useState<boolean>(false);
  const [loginGitlab, setLoginGitlab] = useState<boolean>(false);
  // const [showOpenPingIdModal, setShowOpenPingIdModal] = useState<boolean>(true);
  const [showDeleteOrgModal, setShowDeleteOrgModal] = useState<boolean>(false);
  const [textOrgModal, setTextOrgModal] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<OrganizationSettingsTab>(OrganizationSettingsTab.Channels);

  const checkIfSlackChanged = () => {
    const slackChanged: boolean = commonData.organization!.options!.notifications!.slackToken !== slackToken || commonData.organization!.options!.notifications!.slackChannel !== slackChannel;
    if (slackChanged) {
      return true;
    }
    return false;
  };

  const checkIfTeamsChanged = () => {
    const teamsChanged: boolean = commonData.organization!.options!.notifications!.teamsIncomingWebhookUrl !== teamsIncomingWebhookUrl;
    if (teamsChanged) {
      return true;
    }
    return false;
  };

  const checkIfCentralizedCommunicationsChanged = () => {
    if (commonData.organization && commonData.organization.options && commonData.organization.options.notifications && commonData.organization.options.notifications.hasOwnProperty('centralized')) {
      if (commonData.organization!.options!.notifications!.centralized !== centralizedNotifications) {
        return true;
      }
      const centralizedChanged: boolean = !Helper.arrayEquals(commonData.organization!.options!.notifications!.emails, emailsCentralizedNotifications);
      if (centralizedChanged) {
        return true;
      }
    }
    if (centralizedNotifications) {
      return true;
    }
    return false;
  };

  const notificationsChanged: boolean = useMemo(() => {
    if (!isOrgAdmin) {
      return false;
    }
    if (!commonData.organization) {
      return false;
    }
    return checkIfCentralizedCommunicationsChanged() || checkIfSlackChanged() || checkIfTeamsChanged();
  }, [commonData.organization, centralizedNotifications, emailsCentralizedNotifications, slackChannel, slackToken, teamsIncomingWebhookUrl]);

  const [teamsInfo, setTeamsInfo] = useState<NormalizedResponseDTO<PaginatedResponseDto<TeamInfoDto>> | null>(null);
  const enabledInvitationLinks: boolean = useMemo(() => {
    if (!isOrgAdmin) {
      return false;
    }
    if (!commonData.organization) {
      return false;
    }
    return commonData.organization.join_codes !== null && commonData.organization.join_codes.enabled;
  }, [isOrgAdmin, commonData.organization]);
  const [isOpenExpirationDateModal, setIsOpenExpirationDateModal] = useState<boolean>(false);
  const [validUntil, setValidUntil] = useState<Date | null>(null);

  useEffect(() => {
    if (!commonData.user) {
      return undefined;
    }
    const interval = setInterval(() => {
      const validJwt: boolean = checkJwt();
      if (!validJwt) {
        router.replace('/logout');
      }
    }, Helper.CHECK_JWT_TOKEN_MS);
    return () => clearInterval(interval);
  }, [commonData.user]);

  useEffect(() => {
    if (!edit) {
      return;
    }
    setEditing(edit === 'true');
  }, [edit]);

  useEffect(() => {
    if (!tab) {
      return;
    }
    switch (tab) {
      case OrganizationSettingsTab.Channels:
        setSelectedTab(OrganizationSettingsTab.Channels);
        break;
      case OrganizationSettingsTab.Members:
        setSelectedTab(OrganizationSettingsTab.Members);
        break;
      case OrganizationSettingsTab.Access:
        setSelectedTab(OrganizationSettingsTab.Access);
        break;
      case OrganizationSettingsTab.Notifications:
        setSelectedTab(OrganizationSettingsTab.Notifications);
        break;
      default:
        break;
    }
  }, [tab]);

  useEffect(() => {
    if (!enableInvitationLinksGloballyStr) {
      return;
    }
    setInvitationsLinksGloballyEnabled(enableInvitationLinksGloballyStr === 'true');
  }, [enableInvitationLinksGloballyStr]);

  useEffect(() => {
    if (!isOrgAdmin) {
      return;
    }
    if (commonData.organization) {
      setBio(commonData.organization!.bio);
      setLink(commonData.organization!.link);
      setLocation(commonData.organization!.location);
      setAllowDownload(commonData.organization!.allow_download);
      setAllowedAccessDomains(commonData.organization!.allowed_access_domains || []);
      if (commonData.organization?.options) {
        if (commonData.organization.options?.notifications) {
          setCentralizedNotifications(commonData.organization.options.notifications.centralized);
          setEmailsCentralizedNotifications(commonData.organization.options.notifications.emails || []);
          setSlackToken(commonData.organization.options.notifications.slackToken || '');
          setSlackChannel(commonData.organization.options.notifications.slackChannel || '');
          setTeamsIncomingWebhookUrl(commonData.organization.options.notifications.teamsIncomingWebhookUrl || '');
        }
        // DEPRECATED
        /*
        if (commonData.organization.options?.auth) {
          setLoginKyso(commonData.organization.options.auth.allow_login_with_kyso || false);
          setLoginGoogle(commonData.organization.options.auth.allow_login_with_google || false);
          setLoginGithub(commonData.organization.options.auth.allow_login_with_github || false);
          setLoginBitbucket(commonData.organization.options.auth.allow_login_with_bitbucket || false);
          setLoginGitlab(commonData.organization.options.auth.allow_login_with_gitlab || false);
        }
        */
      }
    } else {
      setBio('');
      setLink('');
      setLocation('');
      setAllowDownload(AllowDownload.ALL);
      setAllowedAccessDomains([]);
      setCentralizedNotifications(false);
      setEmailsCentralizedNotifications([]);
      setSlackToken('');
      setTeamsIncomingWebhookUrl('');
      setSlackChannel('');
      setLoginKyso(false);
      setLoginGoogle(false);
      setLoginGithub(false);
      setLoginBitbucket(false);
      setLoginGitlab(false);
    }
  }, [isOrgAdmin, commonData?.organization]);

  useEffect(() => {
    if (!commonData.organization) {
      return;
    }
    if (commonData.organization.join_codes?.valid_until) {
      setValidUntil(commonData.organization.join_codes.valid_until);
    }
    getOrganizationMembers();
  }, [commonData?.organization]);

  useEffect(() => {
    if (!query || query.length === 0) {
      setUsers([]);
      setRequesting(false);
      return;
    }
    setRequesting(true);
    debouncedFetchData(() => {
      searchUsers(query);
    });
  }, [query]);

  useEffect(() => {
    if (!showDeleteOrgModal) {
      setTimeout(() => {
        setTextOrgModal('');
      }, 1000);
    }
  }, [showDeleteOrgModal]);

  useEffect(() => {
    if (!commonData.organization || !commonData.permissions || !commonData.permissions.teams) {
      return;
    }
    getTeamsInfo(1, '');
  }, [commonData.permissions, commonData.organization]);

  useEffect(() => {
    if (!router.isReady || !commonData?.permissions) {
      return;
    }
    const organizationResourcePermissions: ResourcePermissions | undefined = commonData.permissions.organizations?.find(
      (resourcePermissions: ResourcePermissions) => resourcePermissions.name === (organizationName as string),
    );
    if (!organizationResourcePermissions) {
      router.push('/settings');
    }
  }, [router.isReady, commonData?.permissions]);

  useEffect(() => {
    setPaginationFilteredMembers({
      page: 1,
      numPages: filteredMembers.length > 0 ? Math.ceil(filteredMembers.length / LIMIT_MEMBERS_BY_PAGE) : 0,
    });
  }, [filteredMembers]);

  const getTeamsInfo = async (page: number, search: string) => {
    setRequestingTeamsInfo(true);
    try {
      const api: Api = new Api(commonData.token);
      const teamsInfoQuery: TeamsInfoQuery = {
        organizationId: commonData.organization!.id!,
        teamId: '',
        page,
        limit: 24,
        search,
      };
      const result: NormalizedResponseDTO<PaginatedResponseDto<TeamInfoDto>> = await api.getTeamsInfo(teamsInfoQuery);
      setTeamsInfo(result);
    } catch (e) {
      /* eslint-disable no-console */
      console.log(e);
    }
    setRequestingTeamsInfo(false);
  };

  const onChangeInputFile = (e: any) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUrlLocalFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  const submit = async () => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    try {
      showToaster('Updating organization profile...', ToasterIcons.INFO);
      const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name);
      if (file !== null) {
        setRequesting(true);
        await api.updateOrganizationImage(commonData.organization!.id!, file);
      }
      await api.updateOrganization(commonData.organization!.id!, {
        bio,
        link,
        location,
        allow_download: allowDownload,
      } as any);

      showToaster('Organization updated successfully', ToasterIcons.SUCCESS);

      router.reload();
    } catch (e: any) {
      /* eslint-disable no-console */
      console.log(e.response.data);
      showToaster("We're sorry! Something happened trying to perform the operation. Please try it again.", ToasterIcons.ERROR);
    } finally {
      setRequesting(false);
    }
  };

  const submitNotifications = async () => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    if (centralizedNotifications && emailsCentralizedNotifications.length === 0) {
      showToaster('Please enter at least one valid email for centralized notifications', ToasterIcons.INFO);
      return;
    }
    try {
      setRequesting(true);
      const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name);
      await api.updateOrganizationOptions(commonData.organization!.id!, {
        auth: {
          allow_login_with_kyso: loginKyso,
          allow_login_with_google: loginGoogle,
          allow_login_with_github: loginGithub,
          allow_login_with_bitbucket: loginBitbucket,
          allow_login_with_gitlab: loginGitlab,
          otherProviders: [],
        },
        notifications: {
          centralized: centralizedNotifications,
          emails: emailsCentralizedNotifications,
          slackToken,
          slackChannel,
          teamsIncomingWebhookUrl,
        },
      } as any);
      router.push(`/settings/${commonData.organization?.sluglified_name}?tab=${OrganizationSettingsTab.Notifications}`);
    } catch (e: any) {
      /* eslint-disable no-console */
      showToaster("We're sorry! Something happened trying to perform the operation. Please try it again.", ToasterIcons.ERROR);
    } finally {
      setRequesting(false);
    }
  };

  const getOrganizationMembers = async () => {
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
      const result: NormalizedResponseDTO<OrganizationMember[]> = await api.getOrganizationMembers(commonData!.organization!.id!);
      const m: Member[] = [];
      let userMember: Member | null = null;
      result.data.forEach((organizationMember: OrganizationMember) => {
        if (organizationMember.id === commonData!.user?.id) {
          userMember = {
            id: organizationMember.id!,
            nickname: organizationMember.nickname,
            username: organizationMember.username,
            display_name: organizationMember.nickname,
            avatar_url: organizationMember.avatar_url ? organizationMember.avatar_url : '',
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
            avatar_url: organizationMember.avatar_url ? organizationMember.avatar_url : '',
            email: organizationMember.email,
            organization_roles: organizationMember.organization_roles,
            team_roles: [],
          });
        }
      });
      if (userMember) {
        m.unshift(userMember);
      }
      setMembers(m);
    } catch (e) {
      Helper.logError('Unexpected error', e);
    } finally {
      setRequesting(false);
    }
  };

  const editMember = (member: Member) => {
    setSelectedMember(member);
    setOpenEditMemberModal(true);
    setOrganizationRole(member.organization_roles[0]!);
  };

  const deleteMember = (member: Member) => {
    setSelectedMember(member);
    setOpenDeleteMemberModal(true);
  };

  const updateMemberRole = async (): Promise<void> => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    setRequesting(true);
    const index: number = members.findIndex((m: Member) => m.id === selectedMember?.id);
    if (index === -1) {
      try {
        const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
        const addUserOrganizationDto: AddUserOrganizationDto = new AddUserOrganizationDto(commonData.organization!.id!, selectedMember!.id!, organizationRole);
        await api.addUserToOrganization(addUserOrganizationDto);
        showToaster('User invited successfully.', ToasterIcons.SUCCESS);
      } catch (e) {
        showToaster('We are sorry! Something happened inviting the user. Please try again.', ToasterIcons.ERROR);
        Helper.logError('Unexpected error', e);
      }
    } else if (!members[index]!.organization_roles.includes(organizationRole)) {
      try {
        const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
        const userRoleDTO: UserRoleDTO = new UserRoleDTO(selectedMember!.id!, organizationRole);
        const updateOrganizationMembersDTO: UpdateOrganizationMembersDTO = new UpdateOrganizationMembersDTO([userRoleDTO]);
        await api.updateOrganizationMemberRoles(commonData.organization!.id!, updateOrganizationMembersDTO);
        showToaster('User invited successfully.', ToasterIcons.SUCCESS);
      } catch (e) {
        showToaster('We are sorry! Something happened inviting the user. Please try again.', ToasterIcons.ERROR);
        Helper.logError('Unexpected error', e);
      }
    }

    getOrganizationMembers();
    setOpenEditMemberModal(false);
    setOpenInviteUserModal(false);
    setSelectedMember(null);
    setSelectedUser(null);
    setOrganizationRole('');
    setUsers(users.filter((u: UserDTO) => u.id !== selectedMember?.id));
    setRequesting(false);
  };

  const removeMember = async (): Promise<void> => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      await api.removeUserFromOrganization(commonData!.organization!.id!, selectedMember!.id);
      showToaster('Member removed successfully.', ToasterIcons.SUCCESS);
      getOrganizationMembers();
      setOpenDeleteMemberModal(false);
      setSelectedMember(null);
      setInputDeleteUser('');
    } catch (e) {
      showToaster("We're sorry! Something happened removing the user. Please try again.", ToasterIcons.ERROR);
      Helper.logError('Unexpected error', e);
    }
    setRequesting(false);
  };

  const searchUsers = async (term: string): Promise<void> => {
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
      const result: NormalizedResponseDTO<UserDTO[]> = await api.getUsers({
        userIds: [],
        page: 1,
        per_page: 1000,
        sort: '',
        search: term,
      });
      const usersNotInOrg: UserDTO[] = result.data.filter((user: UserDTO) => {
        return !members.find((member: Member) => member.id === user.id);
      });
      if (usersNotInOrg.length === 0 && Helper.isEmail(term)) {
        const userDTO: UserDTO = new UserDTO('', term, term, term, term, '', '', '', '', '', '', new Date(), [], true, false, true, OnboardingProgress.createEmpty());
        usersNotInOrg.push(userDTO);
      }
      setUsers(usersNotInOrg);
    } catch (e) {
      /* eslint-disable no-console */
      console.log(e);
    }
    setRequesting(false);
  };

  const inviteNewUser = async (): Promise<void> => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
      const inviteUserDto: InviteUserDto = new InviteUserDto(selectedUser?.email!, commonData.organization!.sluglified_name, organizationRole);
      await api.inviteNewUser(inviteUserDto);
      showToaster('User invited successfully.', ToasterIcons.SUCCESS);
      getOrganizationMembers();
      setOrganizationRole('');
      setQuery('');
      setUsers(users.filter((u: UserDTO) => u.id !== selectedMember?.id));
      setSelectedMember(null);
      setOpenInviteUserModal(false);
    } catch (e) {
      showToaster("We're sorry! Something happened inviting the user. Please try again.", ToasterIcons.ERROR);
      Helper.logError('Unexpected error', e);
    }
    setRequesting(false);
  };

  const deleteOrganization = async () => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      await api.deleteOrganization(commonData.organization!.id!);
      router.push('/settings');
    } catch (error: any) {
      /* eslint-disable no-console */
      console.log(error.response.data.message);
      setShowDeleteOrgModal(false);
      setTextOrgModal('');
      setRequesting(false);
    }
  };

  const exportMembersInCsv = async () => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const result: Buffer = await api.exportOrganizationMembers(commonData.organization!.id!);
      const blob: Blob = new Blob([result], { type: 'text/csv;charset=utf-8;' });
      const url: string = URL.createObjectURL(blob);
      const aLink = document.createElement('a');
      aLink.setAttribute('href', url);
      aLink.setAttribute('download', `${commonData.organization?.sluglified_name}-members.csv`);
      aLink.style.visibility = 'hidden';
      document.body.appendChild(aLink);
      aLink.click();
      document.body.removeChild(aLink);
    } catch (e) {
      showToaster('Error exporting members to CSV', ToasterIcons.ERROR);
      Helper.logError('Unexpected error', e);
    }
    setRequesting(false);
  };

  const onChangeJoinCodes = async (result: boolean) => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name);
      const updateJoinCodesDto: UpdateJoinCodesDto = new UpdateJoinCodesDto(result, commonData.organization!.join_codes!.valid_until);
      await api.updateJoinCodes(commonData.organization!.id!, updateJoinCodesDto);
      router.push(`/settings/${commonData.organization!.sluglified_name}?tab=access`);
    } catch (e) {
      setRequesting(false);
      showToaster('Error generating invitation links. Please review that your account is verified', ToasterIcons.ERROR);
      Helper.logError('Error generating invitation links', e);
    }
  };

  const onCloseExpirationDateModal = async (date: Date | null) => {
    if (!date) {
      setIsOpenExpirationDateModal(false);
      return;
    }
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name);
      const updateJoinCodesDto: UpdateJoinCodesDto = new UpdateJoinCodesDto(true, date);
      if (commonData.organization?.join_codes) {
        await api.updateJoinCodes(commonData.organization!.id!, updateJoinCodesDto);
      } else {
        await api.createJoinCodes(commonData.organization!.id!, updateJoinCodesDto);
      }
      router.push(`/settings/${commonData.organization!.sluglified_name}?tab=access`);
    } catch (e) {
      setRequesting(false);
      setIsOpenExpirationDateModal(false);
      showToaster('Error generating invitation links. Please review that your account is verified', ToasterIcons.ERROR);
      Helper.logError('Error generating invitation links', e);
    }
  };

  const updateAllowedAccessDomains = async (updatedAllowedAccessDomains: string[]) => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    try {
      setRequesting(true);
      const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name);
      await api.updateOrganization(commonData.organization!.id!, { allowed_access_domains: updatedAllowedAccessDomains, allow_download: commonData.organization?.allow_download! } as any);
      router.push(`/settings/${commonData.organization?.sluglified_name}?tab=${OrganizationSettingsTab.Access}`);
    } catch (e: any) {
      /* eslint-disable no-console */
      console.log(e.response.data);
      showToaster('Error updating access domains. Please try again.', ToasterIcons.ERROR);
    } finally {
      setRequesting(false);
    }
  };

  const onPageChange = async (page: number) => {
    getTeamsInfo(page, queryTeam);
  };

  if (isUserLogged === null) {
    return null;
  }

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-1/6">
        <SettingsAside commonData={commonData} />
      </div>
      <div className="w-4/6">
        <div className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-5">
              <div className="flex items-center">
                <PureAvatar
                  src={commonData.organization?.avatar_url || ''}
                  title={commonData.organization?.display_name || ''}
                  size={TailwindHeightSizeEnum.H16}
                  textSize={TailwindFontSizeEnum.XS}
                  className="mr-4"
                />
                <h2 className="grow text-3xl font-bold tracking-tight sm:text-4xl">{commonData.organization?.display_name}</h2>
                {isOrgAdmin && !editing && (
                  <React.Fragment>
                    <button
                      className="rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setEditing(true)}
                    >
                      {editing ? 'Cancel' : 'Edit'}
                    </button>
                    <button
                      className="ml-2 rounded border border-red-300 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setShowDeleteOrgModal(true)}
                    >
                      Delete
                    </button>
                  </React.Fragment>
                )}
              </div>
              {editing ? (
                <div className="sm:space-y-5">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Organization Information</h3>
                  </div>
                  <div className="space-y-6 sm:space-y-5">
                    <div className="sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                      <label className="block text-sm font-medium text-gray-700">Photo</label>
                      <div className="mt-1 sm:col-span-2 sm:mt-0">
                        <div className="flex items-center">
                          {(commonData.organization?.avatar_url === null || commonData.organization?.avatar_url === '') && file === null && (
                            <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                              <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"></path>
                              </svg>
                            </span>
                          )}
                          {commonData.organization?.avatar_url && file === null && (
                            <PureAvatar
                              src={commonData.organization.avatar_url}
                              title={`${commonData.organization.display_name} avatar`}
                              size={TailwindHeightSizeEnum.H12}
                              textSize={TailwindFontSizeEnum.XS}
                            />
                          )}
                          {urlLocalFile !== null && (
                            <PureAvatar src={urlLocalFile} title={`${commonData.organization?.display_name} avatar`} size={TailwindHeightSizeEnum.H12} textSize={TailwindFontSizeEnum.XS} />
                          )}
                          <button
                            disabled={requesting}
                            onClick={() => ref.current.click()}
                            className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            {commonData.organization?.avatar_url !== null ? 'Change' : 'Select'}
                          </button>
                          {urlLocalFile !== null && (
                            <button
                              disabled={requesting}
                              onClick={() => {
                                setFile(null);
                                setUrlLocalFile(null);
                              }}
                              className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              Remove
                            </button>
                          )}
                          <input
                            ref={ref}
                            type="file"
                            accept="image/*"
                            onClick={(event: any) => {
                              event.target.value = null;
                            }}
                            onChange={onChangeInputFile}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                      <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Bio:</label>
                      <div className="mt-1 sm:col-span-2 sm:mt-0">
                        <textarea
                          value={bio}
                          onChange={(e: any) => setBio(e.target.value)}
                          name="bio"
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        ></textarea>
                        {/* {showErrorBio && <p className="mt-2 text-sm text-red-500">This field is mandatory.</p>} */}
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                      <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Link:</label>
                      <div className="mt-1 sm:col-span-2 sm:mt-0">
                        <input
                          value={link}
                          onChange={(e: any) => setLink(e.target.value)}
                          type="text"
                          name="link"
                          className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                        />
                        {/* {showErrorLink && <p className="mt-2 text-sm text-red-500">This field is mandatory.</p>} */}
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                      <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Location:</label>
                      <div className="mt-1 sm:col-span-2 sm:mt-0">
                        <input
                          value={location}
                          onChange={(e: any) => setLocation(e.target.value)}
                          type="text"
                          name="link"
                          className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                        />
                        {/* {showErrorLocation && <p className="mt-2 text-sm text-red-500">This field is mandatory.</p>} */}
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                      <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Download reports:</label>
                      <div className="mt-1 sm:col-span-2 sm:mt-0">
                        <select
                          id="allowDownload"
                          name="allowDownload"
                          value={allowDownload}
                          onChange={(e: any) => setAllowDownload(e.target.value)}
                          className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                        >
                          <option value={AllowDownload.ALL}>All</option>
                          <option value={AllowDownload.ONLY_MEMBERS}>Only members</option>
                          <option value={AllowDownload.NONE}>None</option>
                        </select>
                        {/* {showErrorLocation && <p className="mt-2 text-sm text-red-500">This field is mandatory.</p>} */}
                      </div>
                    </div>
                  </div>
                  <div className="pt-5 sm:border-t sm:border-gray-200">
                    <div className="flex justify-end">
                      <button
                        disabled={requesting}
                        onClick={() => {
                          setLink('');
                          setBio('');
                          setLocation('');
                          setFile(null);
                          setEditing(false);
                        }}
                        type="button"
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={requesting}
                        onClick={submit}
                        type="submit"
                        className={clsx(
                          'ml-3 inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 k-bg-primary',
                          requesting && 'opacity-50 cursor-not-allowed',
                        )}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-3">
                  {commonData.organization?.link && (
                    <Link href={commonData.organization?.link} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                      {commonData.organization?.link}
                    </Link>
                  )}
                  {commonData.organization?.location && <p className="text-sm text-gray-500 py-2">{commonData.organization?.location}</p>}
                  {Helper.isBrowser() && <ReadMoreReact text={commonData.organization?.bio || ''} ideal={200} readMoreText={'Read more...'} />}
                </div>
              )}
            </div>

            {/* TABS */}
            {!editing && (
              <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {Helper.organizationSettingsTabs.map((organizationSettingsTab: { key: OrganizationSettingsTab; name: string }) => {
                      if (!isOrgAdmin && (organizationSettingsTab.key === OrganizationSettingsTab.Access || organizationSettingsTab.key === OrganizationSettingsTab.Notifications)) {
                        return null;
                      }
                      return (
                        <a
                          key={organizationSettingsTab.name}
                          href="#"
                          onClick={(e: any) => {
                            e.preventDefault();
                            setSelectedTab(organizationSettingsTab.key);
                          }}
                          className={clsx(
                            organizationSettingsTab.key === selectedTab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                          )}
                          aria-current={organizationSettingsTab.key === selectedTab ? 'page' : undefined}
                        >
                          {organizationSettingsTab.name}
                        </a>
                      );
                    })}
                  </nav>
                </div>
              </div>
            )}

            {/* TAB CHANNELS */}
            {!editing && selectedTab === OrganizationSettingsTab.Channels && (
              <React.Fragment>
                {hasPermissionCreateChannel && (
                  <Link
                    href={`/${organizationName}/create-channel`}
                    className="text-gray-500 hover:bg-gray-50 hover:text-gray-900 flex items-center px-3 py-2 text-xs lg:text-sm rounded-md"
                    role="none"
                    style={{ float: 'right' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-1" role="none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" role="none"></path>
                    </svg>
                    Create
                  </Link>
                )}

                <div className="mt-5">
                  <input
                    value={queryTeam}
                    onChange={(e) => {
                      setQueryTeam(e.target.value);
                      debounceTeamsInfoQuery(e.target.value);
                    }}
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Search channels..."
                  />
                </div>
                {requestingTeamsInfo ? (
                  <div className="flex justify-center mt-5" role="status">
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
                ) : teamsInfo !== null && teamsInfo.data !== null && teamsInfo.data.results.length > 0 ? (
                  <React.Fragment>
                    <div className="mt-6 text-center">
                      <ul role="list" className="mx-auto space-y-16 sm:grid sm:grid-cols-2 sm:gap-16 sm:space-y-0 lg:max-w-5xl lg:grid-cols-3">
                        {teamsInfo !== null &&
                          teamsInfo.relations !== null &&
                          teamsInfo.relations.team !== null &&
                          teamsInfo.data !== null &&
                          teamsInfo.data.results.map((teamInfo: TeamInfoDto) => {
                            if (!teamsInfo.relations!.team!.hasOwnProperty(teamInfo.team_id)) {
                              return null;
                            }
                            const team: Team = teamsInfo.relations!.team[teamInfo.team_id];
                            const resourcePermissions: ResourcePermissions | undefined = commonData.permissions!.teams!.find((rp: ResourcePermissions) => rp.id === teamInfo.team_id);
                            if (!resourcePermissions) {
                              return null;
                            }
                            if (!resourcePermissions.role_names) {
                              return null;
                            }
                            const role: string = OrganizationRoleToLabel.hasOwnProperty(resourcePermissions.role_names[0]!)
                              ? OrganizationRoleToLabel[resourcePermissions.role_names[0]!]!
                              : resourcePermissions.role_names[0]!;
                            return (
                              <li
                                key={teamInfo.team_id}
                                className="overflow-hidden rounded-md border border-gray-300 bg-white cursor-pointer"
                                onClick={() => router.push(`/settings/${commonData.organization!.sluglified_name}/${team.sluglified_name}`)}
                              >
                                <div className="space-y-1 text-lg font-medium leading-6 mt-5" style={{ height: '48px' }}>
                                  <h3 style={{ color: '#234361' }}>{team.display_name}</h3>
                                  <span className="text-sm font-normal truncate">{role}</span>
                                </div>
                                <div className="my-10">
                                  <PureAvatar
                                    src={team.avatar_url || ''}
                                    title={team.display_name}
                                    size={TailwindHeightSizeEnum.H36}
                                    textSize={TailwindFontSizeEnum.XXXXL}
                                    style={{ width: 128, height: 128 }}
                                  />
                                </div>
                                <div className="space-y-2 border-t py-4 px-2">
                                  <ul role="list" className="flex justify-around space-x-5 cursor-pointer">
                                    <li>
                                      <Tooltip content="Reports" placement="bottom">
                                        <div className="flex items-center relative">
                                          <BookOpenIcon className="h-6 w-6 mr-1" fill="#628CF9" aria-hidden="true" />
                                          <span style={{ color: '#797A83' }} className="font-normal text-sm">
                                            {teamInfo.reports}
                                          </span>
                                        </div>
                                      </Tooltip>
                                    </li>
                                    <li>
                                      <Tooltip content="Members" placement="bottom">
                                        <div className="flex items-center">
                                          <UserGroupIcon className="h-6 w-6 mr-1" fill="#F1AB7A" aria-hidden="true" />
                                          <span style={{ color: '#797A83' }} className="font-normal text-sm">
                                            {teamInfo.members}
                                          </span>
                                        </div>
                                      </Tooltip>
                                    </li>
                                    <li>
                                      <Tooltip content="Comments" placement="bottom">
                                        <div className="flex items-center">
                                          <ChatAlt2Icon className="h-6 w-6 mr-1" fill="#70CBE1" aria-hidden="true" />
                                          <span style={{ color: '#797A83' }} className="font-normal text-sm">
                                            {teamInfo.comments}
                                          </span>
                                        </div>
                                      </Tooltip>
                                    </li>
                                  </ul>
                                </div>
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                    <div className="mt-8">
                      <Pagination page={teamsInfo.data.currentPage} numPages={teamsInfo.data.totalPages} onPageChange={onPageChange} />
                    </div>
                  </React.Fragment>
                ) : (
                  <p className="mt-10 text-sm text-gray-500">There are no channels.</p>
                )}
              </React.Fragment>
            )}

            {/* TAB MEMBERS */}
            {!editing && selectedTab === OrganizationSettingsTab.Members && (
              <React.Fragment>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 my-8">Organization members ({filteredMembers.length}):</h3>
                  {isOrgAdmin && (
                    <button
                      className={clsx(
                        'rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                        requesting ? 'opacity-50 cursor-not-allowed' : '',
                      )}
                      disabled={requesting}
                      onClick={exportMembersInCsv}
                    >
                      Export members
                    </button>
                  )}
                </div>
                <div className="mb-5 relative">
                  <input
                    value={queryUsers}
                    onChange={(e) => setQueryUsers(e.target.value)}
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Search members..."
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {queryUsers ? (
                      <div className="cursor-pointer" onClick={() => setQueryUsers('')}>
                        <XIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      </div>
                    ) : (
                      <SearchIcon className="h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {filteredMembersPaginated.map((member: Member) => {
                    const labelRole: string =
                      member.organization_roles.length > 0 && OrganizationRoleToLabel[member.organization_roles[0]!] ? OrganizationRoleToLabel[member.organization_roles[0]!]! : '';
                    return (
                      <div
                        key={member.id}
                        className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
                      >
                        <div className="shrink-0">
                          <PureAvatar src={member.avatar_url} title={member.display_name} username={member?.username} size={TailwindHeightSizeEnum.H8} textSize={TailwindFontSizeEnum.XS} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/user/${member.username}`} className="focus:outline-none">
                            <p className="text-sm font-medium text-gray-900">{member.display_name}</p>
                            <p className="truncate text-sm text-gray-500">{labelRole}</p>
                          </Link>
                        </div>
                        {isOrgAdmin && (
                          <div className="flex flex-row">
                            <div title="Edit member role in the organization">
                              <PencilIcon
                                onClick={() => {
                                  const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(
                                    isCurrentUserVerified(),
                                    isCurrentUserSolvedCaptcha(),
                                    showToaster,
                                    commonData,
                                  );

                                  if (!isValid) {
                                    return;
                                  }
                                  if (requesting) {
                                    return;
                                  }
                                  editMember(member);
                                }}
                                className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer"
                                aria-hidden="true"
                              />
                            </div>
                            <div title="Remove member from the organization">
                              <TrashIcon
                                onClick={() => {
                                  const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(
                                    isCurrentUserVerified(),
                                    isCurrentUserSolvedCaptcha(),
                                    showToaster,
                                    commonData,
                                  );

                                  if (!isValid) {
                                    return;
                                  }
                                  if (requesting) {
                                    return;
                                  }
                                  deleteMember(member);
                                }}
                                className="mr-1 h-5 w-5 text-red-400 group-hover:text-gray-500 cursor-pointer"
                                aria-hidden="true"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredMembersPaginated.length === 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">There are no members.</p>
                    </div>
                  )}
                </div>
                {paginationFilteredMembers.numPages > 0 && (
                  <div className="my-6">
                    <Pagination
                      page={paginationFilteredMembers.page}
                      numPages={paginationFilteredMembers.numPages}
                      onPageChange={(page: number) => setPaginationFilteredMembers({ ...paginationFilteredMembers, page })}
                    />
                  </div>
                )}
                {isOrgAdmin && (
                  <div className="mt-4">
                    {/* SEARCH USERS */}
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mt-8 mb-4">Add users to the organization:</h3>
                    <div className="my-4 relative">
                      <input
                        type="text"
                        value={query}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                        placeholder="Search users..."
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {requesting ? (
                          <svg aria-hidden="true" className="w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            ></path>
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            ></path>
                          </svg>
                        ) : query ? (
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              setQuery('');
                              setUsers([]);
                            }}
                          >
                            <XIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          </div>
                        ) : (
                          <SearchIcon className="h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {users.map((userDto: UserDTO) => {
                        let showErrorDomain = true;
                        if (commonData.organization?.allowed_access_domains && commonData.organization.allowed_access_domains.length > 0) {
                          for (const domain of commonData.organization.allowed_access_domains) {
                            if (userDto.email.endsWith(domain)) {
                              showErrorDomain = false;
                              break;
                            }
                          }
                        } else {
                          showErrorDomain = false;
                        }
                        return (
                          <div
                            key={userDto.email}
                            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
                          >
                            <div className="shrink-0">
                              <PureAvatar src={userDto.avatar_url || ''} title={userDto.display_name} size={TailwindHeightSizeEnum.H8} textSize={TailwindFontSizeEnum.XS} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={userDto.id ? `/user/${userDto.username}` : ''}
                                onClick={(e) => {
                                  if (!userDto.id) {
                                    e.preventDefault();
                                  }
                                }}
                                className={clsx('focus:outline-none', userDto.id ? 'cursor-pointer' : 'cursor-default')}
                              >
                                <p className="text-sm font-medium text-gray-900">{userDto.display_name}</p>
                                <p className="truncate text-sm text-gray-500">{userDto.email}</p>
                                {showErrorDomain && (
                                  <React.Fragment>
                                    <p className="truncate text-sm text-red-500 mt-2">Your organization doesn&apos;t allow this domain</p>
                                    <p className="truncate text-sm text-red-500 mt-2">Allowed domains are: {commonData.organization?.allowed_access_domains.map((x) => `${x} - `)} </p>
                                  </React.Fragment>
                                )}
                              </Link>
                            </div>
                            <div className="flex flex-row">
                              <button
                                disabled={requesting || showErrorDomain}
                                onClick={() => {
                                  const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(
                                    isCurrentUserVerified(),
                                    isCurrentUserSolvedCaptcha(),
                                    showToaster,
                                    commonData,
                                  );

                                  if (!isValid) {
                                    return;
                                  }
                                  if (requesting) {
                                    return;
                                  }
                                  setOrganizationRole('organization-admin');
                                  setSelectedUser(userDto);
                                  setSelectedMember(userDto as any);
                                  setOpenInviteUserModal(true);
                                }}
                                type="button"
                                className={clsx(
                                  'inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                                  requesting || showErrorDomain ? 'opacity-50 cursor-not-allowed' : '',
                                )}
                              >
                                Invite
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {!requesting && query && users.length === 0 && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">No users have been found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </React.Fragment>
            )}

            {/* TAB ACCESS */}
            {!editing && selectedTab === OrganizationSettingsTab.Access && (
              <React.Fragment>
                {/* INVITATION LINKS */}
                {invitationsLinksGloballyEnabled ? (
                  <div className="space-y-6 sm:space-y-5 mt-8">
                    <div className="flex items-center">
                      <h3 className="grow text-lg font-medium leading-6 text-gray-900">Invitation Links:</h3>
                      {commonData.organization?.join_codes && (
                        <Switch
                          disabled={requesting || !isOrgAdmin}
                          checked={enabledInvitationLinks}
                          onChange={onChangeJoinCodes}
                          className={clsx(
                            'ml-5 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                          )}
                          style={{
                            backgroundColor: enabledInvitationLinks ? 'rgb(79 70 229)' : 'gray',
                            borderColor: enabledInvitationLinks ? '' : 'gray',
                          }}
                        >
                          <span className="sr-only">Use setting</span>
                          <span
                            aria-hidden="true"
                            className={clsx(
                              enabledInvitationLinks ? 'translate-x-5' : 'translate-x-0',
                              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                            )}
                          />
                        </Switch>
                      )}
                    </div>
                    {commonData.organization?.join_codes ? (
                      commonData.organization.join_codes.enabled ? (
                        <React.Fragment>
                          <p className="text-sm text-gray-500">
                            Share these links to invite users to your organization. These links will{' '}
                            <strong>expire on {moment(commonData.organization!.join_codes.valid_until).format('Do MMM YYYY')},</strong> and will be replaced by new ones for security reasons, or you
                            can{' '}
                            <span className="text-blue-500 underline cursor-pointer" onClick={() => setIsOpenExpirationDateModal(true)}>
                              update the expiration date
                            </span>
                            .
                          </p>
                          <div>
                            <p className="text-sm">For channel readers / can comment all channels:</p>
                            <div className="flex items-center">
                              <p className="text-normal text-gray-500 my-1">{`${window.location.origin}/${commonData.organization!.sluglified_name}?join=${
                                commonData.organization!.join_codes!.reader
                              }`}</p>
                              <button
                                type="button"
                                title="Copy to clipboard"
                                className="ml-4 inline-flex items-center rounded border border-gray-300 bg-white px-1 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/${commonData.organization!.sluglified_name}?join=${commonData.organization!.join_codes!.reader}`);
                                  showToaster('Copied to clipboard', ToasterIcons.INFO);

                                  setTimeout(() => {
                                    hideToaster();
                                  }, 3000);
                                }}
                              >
                                <DocumentDuplicateIcon className="w-5 h-5"></DocumentDuplicateIcon>
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm">For channel contributors / can edit all channels:</p>
                            <div className="flex items-center">
                              <p className="text-normal text-gray-500 my-1">{`${window.location.origin}/${commonData.organization!.sluglified_name}?join=${
                                commonData.organization!.join_codes!.contributor
                              }`}</p>
                              <button
                                type="button"
                                title="Copy to clipboard"
                                className="ml-4 inline-flex items-center rounded border border-gray-300 bg-white px-1 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/${commonData.organization!.sluglified_name}?join=${commonData.organization!.join_codes!.contributor}`);
                                  showToaster('Copied to clipboard', ToasterIcons.INFO);

                                  setTimeout(() => {
                                    hideToaster();
                                  }, 3000);
                                }}
                              >
                                <DocumentDuplicateIcon className="w-5 h-5"></DocumentDuplicateIcon>
                              </button>
                            </div>
                          </div>
                        </React.Fragment>
                      ) : (
                        <p className="text-sm text-gray-500">Invitation links are disabled in this organization.</p>
                      )
                    ) : (
                      <p className="text-sm text-gray-500">
                        Share these links to invite users to your organization. You have not active links for now. Please, create your links{' '}
                        <span className="text-blue-500 underline cursor-pointer" onClick={() => setIsOpenExpirationDateModal(true)}>
                          here
                        </span>
                        .
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 sm:space-y-5 mt-8">
                    <div className="flex items-center">
                      <h3 className="grow text-lg font-medium leading-6 text-gray-900">Invitation Links:</h3>
                    </div>
                    <p className="text-sm text-gray-500">Invitation links are disabled globally.</p>
                  </div>
                )}
                {isOrgAdmin && (
                  <React.Fragment>
                    <div className="space-y-6 sm:space-y-5 mt-8">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Access</h3>
                      <p className="text-sm text-gray-500">Restrict access to a specific email domain. Only users with matching domain will be able to join the organization.</p>
                      <div className="flex items-center">
                        <input
                          value={newDomain}
                          type="text"
                          placeholder="Write an access domain. e.g. example.com"
                          className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          onChange={(e: any) => {
                            if (e.target.value) {
                              setNewDomain(e.target.value.toLowerCase());
                            } else {
                              setNewDomain('');
                            }
                            setErrorNewDomain('');
                          }}
                        />
                        <button
                          disabled={!newDomain || requesting || !Helper.isValidUrl(newDomain)}
                          onClick={() => {
                            const index: number = allowedAccessDomains.indexOf(newDomain);
                            if (index !== -1) {
                              setErrorNewDomain('Domain already registered');
                              return;
                            }
                            const newAllowedAccessDomains: string[] = [...allowedAccessDomains, newDomain];
                            updateAllowedAccessDomains(newAllowedAccessDomains);
                          }}
                          className={clsx(
                            'ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                            !newDomain || requesting || !Helper.isValidUrl(newDomain) ? 'opacity-50 cursor-not-allowed' : '',
                          )}
                        >
                          Add
                        </button>
                      </div>
                      {errorNewDomain && (
                        <p className="text-sm text-red-500" style={{ marginTop: 10 }}>
                          {errorNewDomain}
                        </p>
                      )}
                      {allowedAccessDomains.length > 0 && (
                        <React.Fragment>
                          <dt className="text-sm font-medium text-gray-500">Valid domains:</dt>
                          <ul role="list" className="divide-y divide-gray-200 rounded-md border border-gray-200 block w-full max-w-lg">
                            {allowedAccessDomains.map((domain: string, index: number) => (
                              <li key={index} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                                <div className="flex w-0 flex-1 items-center">
                                  <LinkIcon className="h-5 w-5 shrink-0 text-gray-400" />
                                  <span className="ml-2 w-0 flex-1 truncate">{domain}</span>
                                </div>
                                <div className="ml-4 shrink-0">
                                  <span
                                    onClick={() => {
                                      const newDomains: string[] = allowedAccessDomains.filter((d: string) => d !== domain);
                                      updateAllowedAccessDomains(newDomains);
                                    }}
                                    className="font-medium text-red-600 hover:text-red-500 cursor-pointer"
                                  >
                                    Remove
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </React.Fragment>
                      )}
                    </div>
                  </React.Fragment>
                )}
              </React.Fragment>
            )}

            {/* TAB NOTIFICATIONS */}
            {!editing && selectedTab === OrganizationSettingsTab.Notifications && (
              <React.Fragment>
                <div className="space-y-1 mt-8 mb-4 sm:border-b sm:border-gray-200 pb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Centralized communications</h3>
                  <p className="max-w-2xl text-sm text-gray-500">Configure a shared email address to centralize Kyso communications</p>
                </div>
                <div className="pt-6 sm:pt-5 my-4">
                  <div role="group" aria-labelledby="label-email">
                    <div className="sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4">
                      <div className="text-base font-medium text-gray-900 sm:text-sm sm:text-gray-700" id="label-email">
                        Enable Centralized Communications
                      </div>
                      <div className="mt-4 sm:col-span-2 sm:mt-0">
                        <div className="max-w-lg space-y-4">
                          <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                              <input
                                checked={centralizedNotifications}
                                onChange={(e: any) => setCentralizedNotifications(e.target.checked)}
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {centralizedNotifications && (
                  <React.Fragment>
                    <div className="my-4 flex items-center">
                      <input
                        value={newEmailCentralizedNotifications}
                        type="email"
                        placeholder="Enter an email"
                        className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        onChange={(e: any) => {
                          if (e.target.value) {
                            setNewEmailCentralizedNotifications(e.target.value);
                          } else {
                            setNewEmailCentralizedNotifications('');
                          }
                          setErrorNewEmail('');
                        }}
                      />
                      <button
                        disabled={!newEmailCentralizedNotifications || requesting || !Helper.isEmail(newEmailCentralizedNotifications)}
                        onClick={() => {
                          const index: number = emailsCentralizedNotifications.indexOf(newEmailCentralizedNotifications);
                          if (index !== -1) {
                            setErrorNewEmail('Email already registered');
                            return;
                          }
                          if (!Helper.isEmail(newEmailCentralizedNotifications)) {
                            setErrorNewEmail('Invalid email');
                            return;
                          }
                          setEmailsCentralizedNotifications([...emailsCentralizedNotifications, newEmailCentralizedNotifications]);
                          setNewEmailCentralizedNotifications('');
                          setErrorNewEmail('');
                        }}
                        className={clsx(
                          'ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                          !newEmailCentralizedNotifications || requesting || !Helper.isEmail(newEmailCentralizedNotifications) ? 'opacity-50 cursor-not-allowed' : '',
                        )}
                      >
                        Add
                      </button>
                    </div>
                    {errorNewEmail && (
                      <p className="text-sm text-red-500" style={{ marginTop: 10 }}>
                        {errorNewEmail}
                      </p>
                    )}
                    {emailsCentralizedNotifications.length > 0 && (
                      <div className="my-4">
                        <dt className="text-sm font-medium text-gray-500 mb-4">Emails:</dt>
                        <ul role="list" className="divide-y divide-gray-200 rounded-md border border-gray-200 block w-full max-w-lg my-2">
                          {emailsCentralizedNotifications.map((email: string, index: number) => (
                            <li key={index} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                              <div className="flex w-0 flex-1 items-center">
                                <MailIcon className="h-5 w-5 shrink-0 text-gray-400" />
                                <span className="ml-2 w-0 flex-1 truncate">{email}</span>
                              </div>
                              <div className="ml-4 shrink-0">
                                <span
                                  onClick={() => {
                                    const newEmails: string[] = emailsCentralizedNotifications.filter((e: string) => e !== email);
                                    setEmailsCentralizedNotifications(newEmails);
                                  }}
                                  className="font-medium text-red-600 hover:text-red-500 cursor-pointer"
                                >
                                  Remove
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </React.Fragment>
                )}
                <div className="space-y-1 mt-8 mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Slack integration</h3>
                  <p className="max-w-2xl text-sm text-gray-500">Configure your slack integration to receive all the updates in your organization</p>
                </div>
                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                  <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Slack Token</label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      value={slackToken}
                      onChange={(e) => setSlackToken(e.target.value)}
                      type="text"
                      className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                    />
                  </div>
                </div>
                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5 mt-5">
                  <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Slack Channel</label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      value={slackChannel}
                      onChange={(e) => setSlackChannel(e.target.value)}
                      type="text"
                      className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1 mt-8 mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Teams integration</h3>
                  <p className="max-w-2xl text-sm text-gray-500">Configure your teams integration to receive all the updates in your organization</p>
                </div>
                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5 mt-5">
                  <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Teams Incoming Webhook Url</label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      value={teamsIncomingWebhookUrl}
                      onChange={(e) => setTeamsIncomingWebhookUrl(e.target.value)}
                      type="text"
                      className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                    />
                  </div>
                </div>
                <div className="pt-5 sm:border-t sm:border-gray-200 mt-5">
                  <div className="flex justify-end">
                    <button
                      disabled={requesting}
                      onClick={() => {
                        router.push(`/settings/${commonData.organization?.sluglified_name}?tab=${OrganizationSettingsTab.Notifications}`);
                      }}
                      type="button"
                      className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={requesting || !notificationsChanged}
                      onClick={submitNotifications}
                      type="submit"
                      className={clsx(
                        'ml-3 inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 k-bg-primary',
                        requesting || !notificationsChanged ? 'opacity-50 cursor-not-allowed' : '',
                      )}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
      {/* INVITE USER */}
      <Transition.Root show={openInviteUserModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            setOpenInviteUserModal(false);
            setTimeout(() => {
              setSelectedUser(null);
              setOrganizationRole('');
            }, 1500);
          }}
        >
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500/50 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mt-3 sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Invite user {selectedUser?.display_name || selectedUser?.username} to the organization
                      </Dialog.Title>
                      <div className="mt-2">
                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:pt-5">
                          <label className="block text-sm sm:mt-px sm:pt-2 text-gray-500">Select an option:</label>
                          <div className="mt-1 sm:col-span-2 sm:mt-0">
                            <select
                              value={organizationRole}
                              onChange={(e: any) => setOrganizationRole(e.target.value)}
                              className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                            >
                              {organizationsRoles.map((element: { label: string; value: string }) => (
                                <option key={element.value} value={element.value}>
                                  {element.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                      disabled={organizationRole === ''}
                      onClick={() => {
                        if (selectedUser?.id === selectedUser?.email) {
                          inviteNewUser();
                        } else {
                          updateMemberRole();
                        }
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                      onClick={() => {
                        setOpenInviteUserModal(false);
                        setTimeout(() => {
                          setSelectedUser(null);
                          setOrganizationRole('');
                        }, 1500);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      {/* EDIT MEMBER ROLE */}
      <Transition.Root show={openEditMemberModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            setOpenEditMemberModal(false);
            setTimeout(() => {
              setSelectedMember(null);
              setOrganizationRole('');
            }, 1500);
          }}
        >
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500/50 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mt-3 sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Update member&apos;s role for user {selectedMember?.display_name}
                      </Dialog.Title>
                      <div className="mt-2">
                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:pt-5">
                          <label className="block text-sm sm:mt-px sm:pt-2 text-gray-500">Select an option:</label>
                          <div className="mt-1 sm:col-span-2 sm:mt-0">
                            <select
                              value={organizationRole}
                              onChange={(e: any) => setOrganizationRole(e.target.value)}
                              className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                            >
                              {organizationsRoles.map((element: { label: string; value: string }) => (
                                <option key={element.value} value={element.value}>
                                  {element.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                      disabled={organizationRole === ''}
                      onClick={updateMemberRole}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                      onClick={() => {
                        setOpenEditMemberModal(false);
                        setTimeout(() => {
                          setSelectedMember(null);
                          setOrganizationRole('');
                        }, 1500);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      {/* DELETE MEMBER MODAL */}
      <Transition.Root show={openDeleteMemberModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            setOpenDeleteMemberModal(false);
            setTimeout(() => {
              setSelectedMember(null);
            }, 1500);
          }}
        >
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500/50 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Remove member
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          The user <strong>{selectedMember?.display_name}</strong> will be removed from the Organization <strong>{commonData.organization?.display_name}</strong>. This action cannot be
                          undone.
                        </p>
                        <p className="text-sm text-gray-500 my-3">
                          Please type <strong>{selectedMember?.username}</strong> in the text box before confirming.
                        </p>
                        <input
                          value={inputDeleteUser}
                          type="text"
                          onChange={(e) => setInputDeleteUser(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      disabled={inputDeleteUser !== selectedMember?.username}
                      className={clsx(
                        'inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
                        inputDeleteUser !== selectedMember?.username ? 'bg-red-400 hover:bg-red-400 focus:ring-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:ring-red-900',
                      )}
                      onClick={removeMember}
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => {
                        setOpenDeleteMemberModal(false);
                        setTimeout(() => {
                          setSelectedMember(null);
                        }, 1500);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* <PingIdModal open={showOpenPingIdModal} setOpen={setShowOpenPingIdModal} /> */}
      {/* DELETE ORGANIZATION */}
      <Transition.Root show={showDeleteOrgModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowDeleteOrgModal}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500/50 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Remove organization
                      </Dialog.Title>
                      <div className="mt-2 text-gray-500 text-sm">
                        <p className="">
                          The <strong>{commonData.organization?.display_name}</strong> organization and all its data will be deleted. This action cannot be undone.
                        </p>
                        <p className="my-2">
                          Please type <strong>&apos;{commonData.organization?.sluglified_name}&apos;</strong> in the text box before confirming:
                        </p>
                        <input
                          value={textOrgModal}
                          type="text"
                          onChange={(e) => setTextOrgModal(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && textOrgModal === commonData.organization?.sluglified_name && !requesting) {
                              deleteOrganization();
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className={clsx(
                        'inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
                        requesting || textOrgModal !== commonData.organization?.sluglified_name ? 'cursor-not-allowed k-bg-primary-disabled' : 'k-bg-primary',
                      )}
                      disabled={requesting || textOrgModal !== commonData.organization?.sluglified_name}
                      onClick={deleteOrganization}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setShowDeleteOrgModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <ExpirationDateModal date={validUntil} isOpen={isOpenExpirationDateModal} onClose={onCloseExpirationDateModal} requesting={requesting} />
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
