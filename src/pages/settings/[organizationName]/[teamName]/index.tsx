/* eslint-disable @typescript-eslint/no-explicit-any */
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { Dialog, Transition } from '@headlessui/react';
import { LinkIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
import type { InviteUserDto, KysoSetting, NormalizedResponseDTO, OrganizationMember, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import { GlobalPermissionsEnum, KysoSettingsEnum, OrganizationPermissionsEnum, TeamMembershipOriginEnum, TeamPermissionsEnum, TeamVisibilityEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import PureAvatar from '../../../../components/PureAvatar';
import SettingsAside from '../../../../components/SettingsAside';
import ToasterNotification from '../../../../components/ToasterNotification';
import checkPermissions from '../../../../helpers/check-permissions';
import { Helper } from '../../../../helpers/Helper';
import { useRedirectIfNoJWT } from '../../../../hooks/use-redirect-if-no-jwt';
import { TailwindColor } from '../../../../tailwind/enum/tailwind-color.enum';
import { TailwindFontSizeEnum } from '../../../../tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '../../../../tailwind/enum/tailwind-height.enum';
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
}

const debouncedFetchData = debounce((cb: () => void) => {
  cb();
}, 750);

const Index = ({ commonData }: Props) => {
  const router = useRouter();
  useRedirectIfNoJWT();
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
    return checkPermissions(copyCommonData, GlobalPermissionsEnum.GLOBAL_ADMIN) || checkPermissions(copyCommonData, OrganizationPermissionsEnum.ADMIN);
  }, [commonData]);
  const isTeamAdmin: boolean = useMemo(() => checkPermissions(commonData, TeamPermissionsEnum.ADMIN), [commonData]);
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
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);
  const hasPermissionEditChannel: boolean = useMemo(() => checkPermissions(commonData, TeamPermissionsEnum.EDIT), [commonData]);

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
        console.error(errorHttp.response.data);
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

  const getTeamMembers = async () => {
    const m: Member[] = [];
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const resultOrgMembers: NormalizedResponseDTO<OrganizationMember[]> = await api.getOrganizationMembers(commonData.organization!.id!);
      let userMember: Member | null = null;
      resultOrgMembers.data.forEach((organizationMember: OrganizationMember) => {
        if (organizationMember.id === commonData.user?.id) {
          userMember = {
            id: organizationMember.id,
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
            id: organizationMember.id,
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
            id: teamMember.id,
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
      console.error(e);
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
        await api.addUserToOrganization({
          organizationId: commonData.organization!.id!,
          userId: selectedMember?.id!,
          role: organizationRole,
        });
      } catch (e) {
        console.error(e);
      }
      if (teamRole) {
        try {
          const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
          await api.updateTeamMemberRoles(commonData.team!.id!, {
            members: [
              {
                userId: selectedMember?.id!,
                role: teamRole,
              },
            ],
          });
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      if (!members[index]!.organization_roles.includes(organizationRole)) {
        try {
          const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
          await api.updateOrganizationMemberRoles(commonData.organization!.id!, {
            members: [
              {
                userId: selectedMember?.id!,
                role: organizationRole,
              },
            ],
          });
        } catch (e) {
          console.error(e);
        }
      }
      if (teamRole && !members[index]!.team_roles.includes(teamRole)) {
        try {
          const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
          await api.updateTeamMemberRoles(commonData.team!.id!, {
            members: [
              {
                userId: selectedMember?.id!,
                role: teamRole,
              },
            ],
          });
        } catch (e) {
          console.error(e);
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
      console.error(e);
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
        usersNotInOrg.push({
          id: term,
          email: term,
          username: term,
          name: term,
          display_name: term,
          bio: '',
          plan: '',
          avatar_url: '',
          background_image_url: '',
          location: '',
          link: '',
          created_at: new Date(),
          accounts: [],
          email_verified: true,
          show_captcha: false,
        });
      }
      setUsers(usersNotInOrg);
    } catch (e) {
      console.log(e);
    }
    setRequesting(false);
  };

  const inviteNewUser = async (): Promise<void> => {
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      const inviteUserDto: InviteUserDto = {
        email: selectedUser?.email!,
        organizationSlug: commonData.organization!.sluglified_name,
        organizationRole,
      };
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
      console.error(e);
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
      console.log(e.response.data);
    }
    setRequesting(false);
  };

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-1/6">
        <SettingsAside commonData={commonData} />
      </div>
      <div className="w-4/6">
        <div className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-row items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{commonData.team?.display_name}</h3>
              <a href={`/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}`} className="max-w-2xl text-sm text-gray-500 ml-5">
                View channel
                <LinkIcon className="inline-block w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:pt-5 mb-5">
              <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Visiblity:</label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <select
                  disabled={!hasPermissionEditChannel || requesting}
                  value={commonData.team?.visibility}
                  onChange={(e: any) => updateTeamVisiblity(e.target.value)}
                  name="teamVisiblity"
                  className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                >
                  <option value={TeamVisibilityEnum.PROTECTED}>Protected</option>
                  <option value={TeamVisibilityEnum.PRIVATE}>Private</option>
                  <option value={TeamVisibilityEnum.PUBLIC}>Public</option>
                </select>
              </div>
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
            {isOrgAdmin && (
              <React.Fragment>
                {/* SEARCH USERS */}
                <h3 className="text-lg font-medium leading-6 text-gray-900">Add users to the team:</h3>
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
                                setShowToaster(true);
                                setMessageToaster('Please verify the captcha');
                                setTimeout(() => {
                                  setShowToaster(false);
                                  sessionStorage.setItem('redirectUrl', `/settings/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}`);
                                  router.push('/captcha');
                                }, 2000);
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
              </React.Fragment>
            )}
            {/* TEAM MEMBERS */}
            <h3 className="text-lg font-medium leading-6 text-gray-900 mt-8">Team members:</h3>
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
                                setShowToaster(true);
                                setMessageToaster('Please verify the captcha');
                                setTimeout(() => {
                                  setShowToaster(false);
                                  sessionStorage.setItem('redirectUrl', `/settings/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}`);
                                  router.push('/captcha');
                                }, 2000);
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
                                  setShowToaster(true);
                                  setMessageToaster('Please verify the captcha');
                                  setTimeout(() => {
                                    setShowToaster(false);
                                    sessionStorage.setItem('redirectUrl', `/settings/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}`);
                                    router.push('/captcha');
                                  }, 2000);
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
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
      <ToasterNotification
        show={showToaster}
        setShow={setShowToaster}
        icon={<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />}
        message={messageToaster}
        backgroundColor={TailwindColor.SLATE_50}
      />
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;