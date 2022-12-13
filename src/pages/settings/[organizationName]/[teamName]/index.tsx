/* eslint-disable @typescript-eslint/no-explicit-any */
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { Dialog, Listbox, Transition } from '@headlessui/react';
import { LinkIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { CheckIcon, ExclamationCircleIcon } from '@heroicons/react/solid';
import type { KysoSetting, NormalizedResponseDTO, OrganizationMember, ResourcePermissions, TeamMember } from '@kyso-io/kyso-model';
import {
  AddUserOrganizationDto,
  GlobalPermissionsEnum,
  InviteUserDto,
  KysoSettingsEnum,
  OrganizationPermissionsEnum,
  TeamMembershipOriginEnum,
  TeamPermissionsEnum,
  TeamVisibilityEnum,
  UpdateOrganizationMembersDTO,
  UpdateTeamMembersDTO,
  UserDTO,
  UserRoleDTO,
} from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import CaptchaModal from '../../../../components/CaptchaModal';
import ChannelVisibility from '../../../../components/ChannelVisibility';
import PureAvatar from '../../../../components/PureAvatar';
import SettingsAside from '../../../../components/SettingsAside';
import { OrganizationSettingsTab } from '../../../../enums/organization-settings-tab';
import { HelperPermissions } from '../../../../helpers/check-permissions';
import { Helper } from '../../../../helpers/Helper';
import { useRedirectIfNoJWT } from '../../../../hooks/use-redirect-if-no-jwt';
import { TailwindFontSizeEnum } from '../../../../tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '../../../../tailwind/enum/tailwind-height.enum';
import { TailwindWidthSizeEnum } from '../../../../tailwind/enum/tailwind-width.enum';
import type { CommonData } from '../../../../types/common-data';
import type { Member } from '../../../../types/member';

const OrganizationRoleToLabel: { [role: string]: string } = {
  'organization-admin': 'Admin of this organization',
  'team-admin': 'Full access all channels',
  'team-contributor': 'Can edit all channels',
  'team-reader': 'Can comment all channels',
};

const TeamRoleToLabel: { [role: string]: string } = {
  'organization-admin': 'Full access',
  'team-admin': 'Full access',
  'team-contributor': 'Can edit',
  'team-reader': 'Can comment',
};

interface Props {
  commonData: CommonData;
  setUser: (user: UserDTO) => void;
}

const debouncedFetchData = debounce((cb: () => void) => {
  cb();
}, 750);

const Index = ({ commonData, setUser }: Props) => {
  const router = useRouter();
  useRedirectIfNoJWT();
  const { organizationName, teamName } = router.query;
  const [query, setQuery] = useState<string>('');
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [requesting, setRequesting] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [openInviteUserModal, setOpenInviteUserModal] = useState<boolean>(false);
  const [openEditMemberModal, setOpenEditMemberModal] = useState<boolean>(false);
  const [openDeleteMemberModal, setOpenDeleteMemberModal] = useState<boolean>(false);
  const [organizationRole, setOrganizationRole] = useState<string>('');
  const [teamRole, setTeamRole] = useState<string>('');
  const isOrgAdmin: boolean = useMemo(() => {
    const copyCommonData: CommonData = { ...commonData, team: null };
    return HelperPermissions.checkPermissions(copyCommonData, GlobalPermissionsEnum.GLOBAL_ADMIN) || HelperPermissions.checkPermissions(copyCommonData, OrganizationPermissionsEnum.ADMIN);
  }, [commonData]);
  const isTeamAdmin: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, TeamPermissionsEnum.ADMIN), [commonData]);
  const organizationsRoles: { label: string; value: string }[] = useMemo(() => {
    const data: { label: string; value: string }[] = [];
    for (const orgRole in OrganizationRoleToLabel) {
      if (OrganizationRoleToLabel[orgRole]) {
        data.push({ label: OrganizationRoleToLabel[orgRole]!, value: orgRole });
      }
    }
    return data;
  }, []);
  const teamsRoles: { label: string; value: string }[] = useMemo(() => {
    const data: { label: string; value: string }[] = [];
    for (const orgRole in TeamRoleToLabel) {
      if (TeamRoleToLabel[orgRole] && orgRole !== 'organization-admin') {
        data.push({ label: TeamRoleToLabel[orgRole]!, value: orgRole });
      }
    }
    return data;
  }, []);
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);
  const hasPermissionEditChannel: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, TeamPermissionsEnum.EDIT), [commonData]);
  const hasPermissionDeleteChannel: boolean = useMemo(
    () => HelperPermissions.checkPermissions(commonData, [OrganizationPermissionsEnum.ADMIN, TeamPermissionsEnum.ADMIN, TeamPermissionsEnum.DELETE]),
    [commonData],
  );
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState<boolean>(false);
  const [textTeamModal, setTextTeamModal] = useState<string>('');
  const [showCaptchaModal, setShowCaptchaModal] = useState<boolean>(false);
  const teams: ResourcePermissions[] = useMemo(() => {
    let data: ResourcePermissions[] = [];
    if (!commonData.organization || !commonData.permissions || !commonData.permissions.teams) {
      return data;
    }
    data = commonData.permissions.teams.filter((resourcePermissions: ResourcePermissions) => resourcePermissions.organization_id === commonData.organization!.id);
    data.sort((a: ResourcePermissions, b: ResourcePermissions) => {
      const displayNameA: string = a.display_name.toLowerCase();
      const displayNameB: string = b.display_name.toLowerCase();
      if (displayNameA < displayNameB) {
        return -1;
      }
      if (displayNameA > displayNameB) {
        return 1;
      }
      return 0;
    });
    return data;
  }, [commonData.permissions, commonData.organization]);

  useEffect(() => {
    const getData = async () => {
      try {
        const api: Api = new Api();
        const resultKysoSetting: NormalizedResponseDTO<KysoSetting[]> = await api.getPublicSettings();
        const index: number = resultKysoSetting.data.findIndex((item: KysoSetting) => item.key === KysoSettingsEnum.HCAPTCHA_ENABLED);
        if (index !== -1) {
          setCaptchaIsEnabled(resultKysoSetting.data[index]!.value === 'true');
        }
      } catch (errorHttp: any) {
        Helper.logError(errorHttp.response.data, errorHttp);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (!commonData.team) {
      return;
    }
    getTeamMembers();
  }, [commonData.team]);

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
    if (!showDeleteTeamModal) {
      setTimeout(() => {
        setTextTeamModal('');
      }, 1000);
    }
  }, [showDeleteTeamModal]);

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
          /**
           * this weird filter is there because sometimes team_roles looks like [null],
           * it has an element of null
           */

          userMember.team_roles = teamMember.team_roles.filter((r) => !!r);
          userMember.membership_origin = teamMember.membership_origin;
        } else if (member) {
          member.team_roles = teamMember.team_roles.filter((r) => !!r);
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
            team_roles: teamMember.team_roles.filter((r) => !!r),
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

  const editMember = (member: Member) => {
    setSelectedMember(member);
    setOpenEditMemberModal(true);
    setOrganizationRole(member.organization_roles[0]!);
    if (member.team_roles.length > 0) {
      setTeamRole(member.team_roles[0]!);
    } else {
      setTeamRole(member.organization_roles[0]!);
    }
  };

  const deleteMember = (member: Member) => {
    setSelectedMember(member);
    setOpenDeleteMemberModal(true);
  };

  const updateMemberRole = async (): Promise<void> => {
    setRequesting(true);
    const index: number = members.findIndex((m: Member) => m.id === selectedMember?.id);
    if (index === -1) {
      try {
        const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
        const addUserOrganizationDto: AddUserOrganizationDto = new AddUserOrganizationDto(commonData.organization!.id!, selectedMember!.id!, organizationRole);
        await api.addUserToOrganization(addUserOrganizationDto);
      } catch (e) {
        Helper.logError('Unexpected error', e);
      }
      if (teamRole) {
        try {
          const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
          const userRoleDTO: UserRoleDTO = new UserRoleDTO(selectedMember!.id!, teamRole);
          const updateTeamMembersDTO: UpdateTeamMembersDTO = new UpdateTeamMembersDTO([userRoleDTO]);
          await api.updateTeamMemberRoles(commonData.team!.id!, updateTeamMembersDTO);
        } catch (e) {
          Helper.logError('Unexpected error', e);
        }
      }
    } else {
      if (!members[index]!.organization_roles.includes(organizationRole)) {
        try {
          const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
          const userRoleDTO: UserRoleDTO = new UserRoleDTO(selectedMember!.id!, organizationRole);
          const updateOrganizationMembersDTO: UpdateOrganizationMembersDTO = new UpdateOrganizationMembersDTO([userRoleDTO]);
          await api.updateOrganizationMemberRoles(commonData.organization!.id!, updateOrganizationMembersDTO);
        } catch (e) {
          Helper.logError('Unexpected error', e);
        }
      }
      if (teamRole && !members[index]!.team_roles.includes(teamRole)) {
        try {
          const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
          const userRoleDTO: UserRoleDTO = new UserRoleDTO(selectedMember!.id!, teamRole);
          const updateTeamMembersDTO: UpdateTeamMembersDTO = new UpdateTeamMembersDTO([userRoleDTO]);
          await api.updateTeamMemberRoles(commonData.team!.id!, updateTeamMembersDTO);
        } catch (e) {
          Helper.logError('Unexpected error', e);
        }
      }
    }
    getTeamMembers();
    setOpenEditMemberModal(false);
    setOpenInviteUserModal(false);
    setSelectedMember(null);
    setSelectedUser(null);
    setOrganizationRole('');
    setTeamRole('');
    setUsers(users.filter((u: UserDTO) => u.id !== selectedMember?.id));
    setRequesting(false);
  };

  const removeMember = async (): Promise<void> => {
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      await api.deleteUserFromTeam(commonData.team!.id!, selectedMember!.id);
      getTeamMembers();
      setOpenDeleteMemberModal(false);
      setSelectedMember(null);
    } catch (e) {
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
        const userDTO: UserDTO = new UserDTO(term, term, term, term, term, '', '', '', '', '', '', new Date(), [], true, false);
        usersNotInOrg.push(userDTO);
      }
      setUsers(usersNotInOrg);
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
    setRequesting(false);
  };

  const inviteNewUser = async (): Promise<void> => {
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const inviteUserDto: InviteUserDto = new InviteUserDto(selectedUser?.email!, commonData.organization!.sluglified_name, organizationRole);
      if (teamRole) {
        api.setTeamSlug(commonData.team!.sluglified_name);
        inviteUserDto.teamSlug = commonData.team!.sluglified_name;
        inviteUserDto.teamRole = teamRole;
      }
      await api.inviteNewUser(inviteUserDto);
      getTeamMembers();
      setOrganizationRole('');
      setTeamRole('');
      setQuery('');
      setUsers(users.filter((u: UserDTO) => u.id !== selectedMember?.id));
      setSelectedMember(null);
      setOpenInviteUserModal(false);
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
    setRequesting(true);
  };

  const updateTeamVisiblity = async (teamVisiblityEnum: TeamVisibilityEnum) => {
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);
      await api.updateTeam(commonData.team?.id!, { visibility: teamVisiblityEnum } as any);
      router.reload();
    } catch (e: any) {
      Helper.logError(e.response.data, e);
    }
    setRequesting(false);
  };

  const deleteTeam = async () => {
    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowCaptchaModal(true);
      return;
    }
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      await api.deleteTeam(commonData.team!.id!);
    } catch (error: any) {
      Helper.logError(error.response.data, error);
      setShowDeleteTeamModal(false);
      setTextTeamModal('');
      setRequesting(false);
    }
    window.location.href = `/settings/${commonData.organization?.sluglified_name}`;
  };

  const onCloseCaptchaModal = async (refreshUser: boolean) => {
    setShowCaptchaModal(false);
    if (refreshUser) {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
      setUser(result.data);
    }
  };

  const exportMembersInCsv = async () => {
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token);
      const result: Buffer = await api.exportTeamMembers(commonData.team!.id!);
      const blob: Blob = new Blob([result], { type: 'text/csv;charset=utf-8;' });
      const url: string = URL.createObjectURL(blob);
      const aLink = document.createElement('a');
      aLink.setAttribute('href', url);
      aLink.setAttribute('download', `${commonData.team?.sluglified_name}-members.csv`);
      aLink.style.visibility = 'hidden';
      document.body.appendChild(aLink);
      aLink.click();
      document.body.removeChild(aLink);
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
    setRequesting(false);
  };

  useEffect(() => {
    if (!router.isReady || !commonData?.permissions) {
      return;
    }
    const organizationResourcePermissions: ResourcePermissions | undefined = commonData.permissions.organizations?.find(
      (resourcePermissions: ResourcePermissions) => resourcePermissions.name === (organizationName as string),
    );
    if (!organizationResourcePermissions) {
      router.push('/settings');
      return;
    }
    if (!organizationResourcePermissions.role_names!.includes('organization-admin')) {
      router.push('/settings');
    }
  }, [router.isReady, commonData?.permissions]);

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-1/6">
        <SettingsAside commonData={commonData} />
      </div>
      <div className="w-4/6">
        <div className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* ORGANIZATION HEADER */}
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
                <button
                  className="rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => {
                    window.location.href = `/settings/${commonData.organization?.sluglified_name}?edit=true`;
                  }}
                >
                  Edit
                </button>
              </div>
              <div className="py-3">
                <a href={commonData.organization?.link} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  {commonData.organization?.link}
                </a>
                {commonData.organization?.location && <p className="text-sm text-gray-500 py-2">{commonData.organization?.location}</p>}
                <p className="text-md text-gray-500">{commonData.organization?.bio}</p>
              </div>
            </div>

            {/* TABS */}
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  {Helper.organizationSettingsTabs.map((tab: { key: OrganizationSettingsTab; name: string }) => (
                    <a
                      key={tab.name}
                      href={`/settings/${commonData.organization?.sluglified_name}?tab=${tab.key}`}
                      className={clsx(
                        tab.key === OrganizationSettingsTab.Channels ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                      )}
                      aria-current={tab.key === OrganizationSettingsTab.Channels ? 'page' : undefined}
                    >
                      {tab.name}
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* TEAM HEADER */}
            <div className="flex flex-row items-center mt-6">
              <div className="grow flex flex-row items-center">
                <PureAvatar src={commonData.team?.avatar_url || ''} title={commonData.team?.display_name || ''} size={TailwindHeightSizeEnum.H16} textSize={TailwindFontSizeEnum.XS} className="mr-4" />
                <Listbox
                  value={null}
                  onChange={(resourcePermissions: ResourcePermissions) => {
                    if (resourcePermissions.id !== commonData.team?.id) {
                      window.location.href = `/settings/${commonData.organization?.sluglified_name}/${resourcePermissions.name}`;
                    }
                  }}
                >
                  {({ open }) => (
                    <div className="relative mt-1" style={{ width: '230px' }}>
                      <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                        <span className="inline-flex w-full">
                          <span className="">{commonData.team?.display_name}</span>
                          <ChannelVisibility
                            containerClasses="ml-2"
                            teamVisibility={commonData.team?.visibility!}
                            imageWidth={TailwindWidthSizeEnum.W3}
                            imageMarginX={TailwindWidthSizeEnum.W3}
                            imageMarginY={TailwindWidthSizeEnum.W1}
                            alwaysOnHover={true}
                          />
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                          </svg>
                        </span>
                      </Listbox.Button>
                      <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity/5 focus:outline-none sm:text-sm">
                          {teams.map((resourcePermissions: ResourcePermissions) => (
                            <Listbox.Option
                              key={resourcePermissions.id}
                              className={({ active }) => clsx(active ? 'text-white bg-indigo-600' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9')}
                              value={resourcePermissions}
                            >
                              {({ selected, active }) => (
                                <React.Fragment>
                                  <div className="flex">
                                    <span className={clsx(teamName === resourcePermissions.name ? 'font-semibold' : 'font-normal')}>{resourcePermissions.display_name}</span>
                                    <ChannelVisibility
                                      containerClasses="ml-3"
                                      teamVisibility={resourcePermissions.team_visibility!}
                                      imageWidth={TailwindWidthSizeEnum.W3}
                                      imageMarginX={TailwindWidthSizeEnum.W3}
                                      imageMarginY={TailwindWidthSizeEnum.W1}
                                    />
                                  </div>
                                  {selected ? (
                                    <span className={clsx(active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4')}>
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
                  )}
                </Listbox>
                <a href={`/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}`} className="max-w-2xl text-sm text-blue-500 ml-5">
                  View channel
                  <LinkIcon className="inline-block w-4 h-4 ml-1" />
                </a>
              </div>
              {hasPermissionDeleteChannel && (
                <button
                  className="ml-2 rounded border border-red-300 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => setShowDeleteTeamModal(true)}
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center my-4">
              <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Visiblity:</label>
              {hasPermissionEditChannel ? (
                <Listbox value={null} onChange={(teamVisibilityEnum: TeamVisibilityEnum) => updateTeamVisiblity(teamVisibilityEnum)}>
                  {({ open }) => (
                    <div className="relative ml-6" style={{ width: '200px' }}>
                      <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                        <span className="inline-flex w-full">
                          <span className="">{Helper.ucFirst(commonData.team?.visibility || '')}</span>
                          <ChannelVisibility
                            containerClasses="ml-2"
                            teamVisibility={commonData.team?.visibility!}
                            imageWidth={TailwindWidthSizeEnum.W3}
                            imageMarginX={TailwindWidthSizeEnum.W3}
                            imageMarginY={TailwindWidthSizeEnum.W1}
                            alwaysOnHover={true}
                          />
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                          </svg>
                        </span>
                      </Listbox.Button>
                      <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity/5 focus:outline-none sm:text-sm">
                          {Helper.teamVisibilityValues.map((teamVisibilityEnum: TeamVisibilityEnum) => (
                            <Listbox.Option
                              disabled={!hasPermissionEditChannel || requesting}
                              key={teamVisibilityEnum}
                              className={({ active }) => clsx(active ? 'text-white bg-indigo-600' : 'text-gray-900', 'relative cursor-pointer select-none py-2 pl-3 pr-9')}
                              value={teamVisibilityEnum}
                            >
                              {({ selected, active }) => (
                                <React.Fragment>
                                  <div className="flex">
                                    <span className={clsx(commonData.team?.visibility === teamVisibilityEnum ? 'font-semibold' : 'font-normal')}>{Helper.ucFirst(teamVisibilityEnum)}</span>
                                    <ChannelVisibility
                                      containerClasses="ml-3"
                                      teamVisibility={teamVisibilityEnum!}
                                      imageWidth={TailwindWidthSizeEnum.W3}
                                      imageMarginX={TailwindWidthSizeEnum.W3}
                                      imageMarginY={TailwindWidthSizeEnum.W1}
                                    />
                                  </div>
                                  {selected ? (
                                    <span className={clsx(active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4')}>
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
                  )}
                </Listbox>
              ) : (
                <div
                  style={{ width: '200px' }}
                  className="ml-2 relative cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                >
                  <span className="inline-flex w-full">
                    <span className="">{Helper.ucFirst(commonData.team?.visibility || '')}</span>
                    <ChannelVisibility
                      containerClasses="ml-2"
                      teamVisibility={commonData.team?.visibility!}
                      imageWidth={TailwindWidthSizeEnum.W3}
                      imageMarginX={TailwindWidthSizeEnum.W3}
                      imageMarginY={TailwindWidthSizeEnum.W1}
                      alwaysOnHover={true}
                    />
                  </span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-700">
              <ul style={{ listStyle: 'circle' }}>
                <li>
                  <strong>Protected:</strong> only members within the organization can access this channel&apos;s content.
                </li>
                <li>
                  <strong>Private:</strong> only members of this channel have access to this channel&apos;s content.
                </li>
                <li>
                  <strong>Public:</strong> any member of any organization can access this channel&apos;s content. Reports in this channel can also be viewed by external users with no Kyso account by
                  sharing a report&apos;s shareable link.
                </li>
              </ul>
            </div>

            {/* SEARCH USERS */}
            {isOrgAdmin && (
              <div className="mt-8">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Add users to the channel:</h3>
                <div className="my-8 sm:col-span-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                    placeholder="Search users"
                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {users.map((userDto: UserDTO) => {
                    return (
                      <div
                        key={userDto.id}
                        className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
                      >
                        <div className="shrink-0">
                          <PureAvatar src={userDto.avatar_url} title={userDto.display_name} size={TailwindHeightSizeEnum.H8} textSize={TailwindFontSizeEnum.XS} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <a href={`/user/${userDto.username}`} className="focus:outline-none">
                            <p className="text-sm font-medium text-gray-900">{userDto.display_name}</p>
                            <p className="truncate text-sm text-gray-500">{userDto.email}</p>
                          </a>
                        </div>
                        <div className="flex flex-row">
                          <button
                            disabled={requesting}
                            onClick={() => {
                              if (captchaIsEnabled && commonData.user?.show_captcha === true) {
                                setShowCaptchaModal(true);
                                return;
                              }
                              if (requesting) {
                                return;
                              }
                              setOrganizationRole('organization-admin');
                              setTeamRole('organization-admin');
                              setSelectedUser(userDto);
                              setSelectedMember(userDto as any);
                              setOpenInviteUserModal(true);
                            }}
                            type="button"
                            className="inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            Invite
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TEAM MEMBERS */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mt-8">Channel members ({members.length}):</h3>
              {(isOrgAdmin || isTeamAdmin) && (
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
            <div className="mt-4 mb-6 text-sm text-gray-600">
              {commonData.team?.visibility === TeamVisibilityEnum.PROTECTED && (
                <p>
                  Only the following users can access to this channel. Check the members of this channel and manage them. The roles marked with a organization&apos;s tag comes from the
                  organization&apos;s configuration, and those without tag are explicit members of the channel.
                </p>
              )}
              {commonData.team?.visibility === TeamVisibilityEnum.PRIVATE && <p>Only the following users can access to this channel</p>}
              {commonData.team?.visibility === TeamVisibilityEnum.PUBLIC && (
                <p>
                  All users on Kyso can discover this channel and see its contents. Check the members of this channel and manage them. The roles marked with a organization&apos;s tag comes from the
                  organization&apos;s configuration, and those without tag are explicit members of the channel.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {members.map((member: Member) => {
                const labelRole: string = member.team_roles.length > 0 && TeamRoleToLabel[member.team_roles[0]!] ? TeamRoleToLabel[member.team_roles[0]!]! : '';
                return (
                  <div
                    key={member.id}
                    className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
                  >
                    <div className="shrink-0">
                      <PureAvatar src={member.avatar_url} title={member.display_name} size={TailwindHeightSizeEnum.H8} textSize={TailwindFontSizeEnum.XS} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <a href={`/user/${member.username}`} className="focus:outline-none">
                        <p className="text-sm font-medium text-gray-900">{member.display_name}</p>
                        <p className="truncate text-sm text-gray-500">{labelRole}</p>
                      </a>
                    </div>
                    {(isOrgAdmin || isTeamAdmin) && (
                      <div className="flex flex-row">
                        <div title="Edit member role in the team">
                          <PencilIcon
                            onClick={() => {
                              if (captchaIsEnabled && commonData.user?.show_captcha === true) {
                                setShowCaptchaModal(true);
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
                        {member.membership_origin === TeamMembershipOriginEnum.TEAM && (
                          <div title="Remove member from the team">
                            <TrashIcon
                              onClick={() => {
                                if (captchaIsEnabled && commonData.user?.show_captcha === true) {
                                  setShowCaptchaModal(true);
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
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
              setTeamRole('');
            }, 1500);
          }}
        >
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity/75 transition-opacity" />
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
                        Invite user {selectedUser?.display_name || selectedUser?.username} to the team
                      </Dialog.Title>
                      <div className="mt-2">
                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:pt-5">
                          <label className="block text-sm sm:mt-px sm:pt-2 text-gray-500">Organization role:</label>
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
                      <div className="mt-2">
                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:pt-5">
                          <label className="block text-sm sm:mt-px sm:pt-2 text-gray-500">Team role:</label>
                          <div className="mt-1 sm:col-span-2 sm:mt-0">
                            <select
                              value={teamRole}
                              onChange={(e: any) => setTeamRole(e.target.value)}
                              className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                            >
                              {teamsRoles.map((element: { label: string; value: string }) => (
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
            <div className="fixed inset-0 bg-gray-500 bg-opacity/75 transition-opacity" />
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
                          <label className="block text-sm sm:mt-px sm:pt-2 text-gray-500">Organization role:</label>
                          <div className="mt-1 sm:col-span-2 sm:mt-0">
                            <select
                              disabled={!isOrgAdmin}
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
                      <div className="mt-2">
                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:pt-5">
                          <label className="block text-sm sm:mt-px sm:pt-2 text-gray-500">Team role:</label>
                          <div className="mt-1 sm:col-span-2 sm:mt-0">
                            <select
                              value={teamRole}
                              onChange={(e: any) => setTeamRole(e.target.value)}
                              className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                            >
                              {teamsRoles.map((element: { label: string; value: string }) => (
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
            <div className="fixed inset-0 bg-gray-500 bg-opacity/75 transition-opacity" />
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
                          The user <strong>{selectedMember?.display_name}</strong> will be removed from the team <strong>{commonData.team?.sluglified_name}</strong>. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
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
      {/* DELETE TEAM */}
      <Transition.Root show={showDeleteTeamModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowDeleteTeamModal}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity/75 transition-opacity" />
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
                          The <strong>{commonData.team?.display_name}</strong> channel and all its data will be deleted. This action cannot be undone.
                        </p>
                        <p className="my-2">
                          Please type <strong>&apos;{commonData.team?.sluglified_name}&apos;</strong> in the text box before confirming:
                        </p>
                        <input
                          value={textTeamModal}
                          type="text"
                          onChange={(e) => setTextTeamModal(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className={clsx(
                        'inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
                        requesting || textTeamModal !== commonData.team?.sluglified_name ? 'cursor-not-allowed opacity-50' : '',
                      )}
                      disabled={requesting || textTeamModal !== commonData.team?.sluglified_name}
                      onClick={deleteTeam}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setShowDeleteTeamModal(false)}
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
      {commonData.user && <CaptchaModal user={commonData.user!} open={showCaptchaModal} onClose={onCloseCaptchaModal} />}
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
