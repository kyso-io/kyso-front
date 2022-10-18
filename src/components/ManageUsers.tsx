import ListboxWithText from '@/components/PureListBoxWithText';
import PureNotification from '@/components/PureNotification';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { CommonData } from '@/types/common-data';
import { Menu, Transition } from '@headlessui/react';
import { SearchIcon } from '@heroicons/react/outline';
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid';
import type { UserDTO } from '@kyso-io/kyso-model';
import { GlobalPermissionsEnum, OrganizationPermissionsEnum, TeamMembershipOriginEnum, TeamPermissionsEnum, TeamVisibilityEnum } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import slugify from 'slugify';
import { HelperPermissions } from '../helpers/check-permissions';
import { Helper } from '../helpers/Helper';
import type { Member } from '../types/member';
import PureAvatar from './PureAvatar';
import PureAvatarGroup from './PureAvatarGroup';

const MAX_USERS_TO_SHOW = 5;
const REMOVE_USER_VALUE = 'remove';

const debouncedFetchData = debounce((cb: () => void) => {
  cb();
}, 750);

interface Props {
  commonData: CommonData;
  members: Member[];
  users: UserDTO[];
  onInputChange: (query: string) => void;
  showTeamRoles: boolean;
  onUpdateRoleMember: (userId: string, organizationRole: string, teamRole?: string) => void;
  onInviteNewUser: (email: string, organizationRole: string, teamRole?: string) => void;
  onRemoveUser: (userId: string, type: TeamMembershipOriginEnum) => void;
}

const ManageUsers = ({ commonData, members, users, onInputChange, showTeamRoles, onUpdateRoleMember, onInviteNewUser, onRemoveUser }: Props) => {
  const router = useRouter();
  const [query, setQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserDTO | Member | null>(null);
  const [requesting, setRequesting] = useState<boolean>(false);
  const [selectedOrgRole, setSelectedOrgRole] = useState<string>('');
  const [selectedTeamRole, setSelectedTeamRole] = useState<string>('');
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number>(-1);

  const [selectedOrgLabel, setSelectedOrgLabel] = useState<string>('Select an option');
  const [selectedTeamLabel, setSelectedTeamLabel] = useState<string>('Select an option');

  const [notificationType, setNotificationType] = useState<string>('');
  const [notificationMessage, setNotificationMessage] = useState<string>('');

  const [isEmail, setIsEmail] = useState<boolean>(false);
  const [inputDeleteUser, setInputDeleteUser] = useState<string>('');
  const [keyDeleteUser, setKeyDeleteUser] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const isOrgAdmin: boolean = useMemo(() => {
    const copyCommonData: CommonData = { ...commonData, team: null };
    return HelperPermissions.checkPermissions(copyCommonData, GlobalPermissionsEnum.GLOBAL_ADMIN) || HelperPermissions.checkPermissions(copyCommonData, OrganizationPermissionsEnum.ADMIN);
  }, [commonData]);
  const isTeamAdmin: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, TeamPermissionsEnum.ADMIN), [commonData]);

  const filteredMembers: Member[] = useMemo(() => {
    let m: Member[] = members;
    if (commonData?.team && commonData.team.visibility === TeamVisibilityEnum.PRIVATE) {
      m = members.filter((member: Member) => member.membership_origin === TeamMembershipOriginEnum.TEAM);
    }
    return m;
  }, [commonData?.team, members]);

  const organizationRoles: { value: string; label: string; description: string }[] = useMemo(() => {
    const data: { value: string; label: string; description: string }[] = [
      { value: 'organization-admin', label: 'Admin of this organization', description: `Can change organization's settings` },
      { value: 'team-admin', label: 'Full access all channels', description: `Can change channels' settings` },
      { value: 'team-contributor', label: 'Can edit all channels', description: 'Can create new reports across channels' },
      { value: 'team-reader', label: 'Can comment all channels', description: 'Can read and create comment, but cannot create new reports' },
    ];
    if (selectedUser) {
      if (members.length > 0) {
        const index: number = members.findIndex((member: Member) => member.id === selectedUser.id);
        if (index > -1) {
          data.push({ value: 'remove', label: 'Remove access', description: '' });
        }
      } else if (users.length > 0) {
        const index: number = users.findIndex((user: UserDTO) => user.id === selectedUser.id);
        if (index > -1) {
          data.push({ value: REMOVE_USER_VALUE, label: 'Remove', description: '' });
        }
      }
    }
    return data;
  }, [selectedUser, members, users]);

  const teamRoles: { value: string; label: string; description: string }[] = useMemo(() => {
    const data: { value: string; label: string; description: string }[] = [
      { value: 'team-admin', label: 'Full access', description: `Can change this channel's settings` },
      { value: 'team-contributor', label: 'Can edit', description: 'Can create new reports in this channels' },
      { value: 'team-reader', label: 'Can comment', description: 'Can read and create comment, but cannot create new reports' },
    ];
    if (selectedUser) {
      if (filteredMembers.length > 0) {
        const member: Member | undefined = filteredMembers.find((m: Member) => m.id === selectedUser.id);
        if (member) {
          if (member?.membership_origin === TeamMembershipOriginEnum.TEAM) {
            data.push({ value: 'remove', label: 'Remove access', description: '' });
          }
        }
      } else if (users.length > 0) {
        const index: number = users.findIndex((user: UserDTO) => user.id === selectedUser.id);
        if (index > -1) {
          data.push({ value: REMOVE_USER_VALUE, label: 'Remove access', description: '' });
        }
      }
    }
    return data;
  }, [selectedUser, filteredMembers, users]);

  useEffect(() => {
    if (!query || query.length === 0) {
      setRequesting(false);
      return;
    }
    setRequesting(true);
    debouncedFetchData(() => {
      onInputChange(query);
    });
    setIsEmail(Helper.isEmail(query));
  }, [query]);

  useEffect(() => {
    setRequesting(false);
  }, [users]);

  useEffect(() => {
    if (selectedUser) {
      setKeyDeleteUser(slugify(selectedUser.username).toLowerCase());
    } else {
      setKeyDeleteUser('');
    }
  }, [selectedUser]);

  const clearData = () => {
    setQuery('');
    setSelectedUser(null);
    setSelectedMemberIndex(-1);
    setSelectedOrgRole('');
    setSelectedOrgLabel('Select an option');
    setSelectedTeamLabel('Select an option');
    setSelectedTeamRole('');
    setInputDeleteUser('');
    setKeyDeleteUser('');
    setErrorMessage('');
  };

  let plusMembers = 0;
  if (filteredMembers.length > MAX_USERS_TO_SHOW) {
    plusMembers = filteredMembers.length - MAX_USERS_TO_SHOW;
  }

  const delayedCallback = debounce(async () => {
    setNotificationType('');
    setNotificationMessage('');
  }, 3000);

  return (
    <React.Fragment>
      <div className="text-left">{notificationMessage && <PureNotification message={notificationMessage} type={notificationType} />}</div>
      <Menu as="div" className="ml-2 relative inline-block text-left">
        <div>
          <Menu.Button
            className="flex items-center
              text-sm
              font-small
              rounded-md
              text-gray-500
              focus:outline-none
              focus:ring-0
              border 
              border-transparent
              bg-white
              hover:bg-gray-100          
              px-2.5 py-1.5"
          >
            <PureAvatarGroup data={filteredMembers.slice(0, MAX_USERS_TO_SHOW)}></PureAvatarGroup>
            {plusMembers > 0 && <div className="ml-2 text-sm font-semibold text-slate-500 dark:text-slate-200">+{plusMembers}</div>}
            <ChevronDownIcon className="ml-2 h-5 w-5" aria-hidden="true" />
          </Menu.Button>
        </div>
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
            className="origin-top-right absolute right-0 mt-2 px-4 py-2 min-w-max rounded-md shadow-lg bg-white ring-1 ring-gray-200 ring-opacity/5 focus:outline-none"
            style={{ zIndex: 100, width: showTeamRoles ? 380 : selectedUser ? 380 : 280 }}
          >
            <div className="py-2 px-4">
              {!selectedUser && (
                <div className="my-1 relative rounded-md shadow-sm">
                  <input
                    value={query}
                    type="text"
                    name="account-number"
                    id="account-number"
                    className="h-8 focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder={isOrgAdmin ? 'Add email, user...' : 'Search user...'}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {requesting && (
                      <div className="pointer-events-none">
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
                      </div>
                    )}
                    {!query && !requesting && <SearchIcon className="h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />}
                    {query && !requesting && (
                      <div className="cursor-pointer" onClick={clearData}>
                        <XIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* show current org/channel users and roles */}
              {(!query || query.length === 0) && !selectedUser && (
                <React.Fragment>
                  <span className="my-4 text-xs font-medium text-gray-600">Members:</span>
                  <ul role="list" className="mt-1" style={{ maxHeight: 200, overflowY: 'scroll' }}>
                    {filteredMembers.map((member: Member, index: number) => {
                      let roles: string | undefined = '';
                      let fromOrganization = true;

                      if (member.team_roles && member.team_roles.length > 0) {
                        roles = `${teamRoles.find((e: { value: string; label: string }) => e.value === member.team_roles[0])?.label}`;
                        fromOrganization = false;
                      } else {
                        roles = organizationRoles.find((e: { value: string; label: string }) => e.value === member.organization_roles[0])?.label;
                      }

                      if (roles === 'undefined' && !fromOrganization) {
                        // If it's undefined, probably means that it's an organization admin, because that role
                        // is only in organizationRoles, and not in teamRoles.

                        // So in this case, just assign it directly
                        roles = 'Admin of this organization';
                      }

                      return (
                        <li
                          key={member.id}
                          className={clsx(
                            'p-2 hover:bg-gray-100',
                            !commonData.user || isOrgAdmin || (isTeamAdmin && showTeamRoles) ? 'cursor-pointer' : 'cursor-default',
                            commonData.user?.id === member.id ? 'border rounded' : '',
                          )}
                          onClick={() => {
                            if (!(!commonData.user || isOrgAdmin || (isTeamAdmin && showTeamRoles))) {
                              setNotificationMessage('You need admin permission to continue');
                              setNotificationType('warning');
                              delayedCallback();
                            }

                            if (!commonData.user) {
                              router.push(`/user/${member.username}`);
                            } else if (isOrgAdmin || (isTeamAdmin && showTeamRoles)) {
                              let orgLabel = 'Admin of this organization';
                              if (member.organization_roles[0]! === 'team-admin') {
                                orgLabel = 'Full access all channels';
                              }
                              if (member.organization_roles[0]! === 'team-contributor') {
                                orgLabel = 'Can edit all channels';
                              }
                              if (member.organization_roles[0]! === 'team-reader') {
                                orgLabel = 'Can comment all channels';
                              }
                              setSelectedOrgLabel(orgLabel);
                              setSelectedOrgRole(member.organization_roles[0]!);

                              if (member.team_roles && member.team_roles.length > 0) {
                                let teamLabel = 'Full access';
                                if (member.team_roles[0]! === 'team-contributor') {
                                  teamLabel = 'Can edit';
                                }
                                if (member.team_roles[0]! === 'team-reader') {
                                  teamLabel = 'Can comment';
                                }
                                setSelectedTeamLabel(teamLabel);
                                setSelectedTeamRole(member.team_roles[0]!);
                              }
                              setSelectedUser({ ...member });
                              setSelectedMemberIndex(index);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="shrink-0">
                              <PureAvatar src={member.avatar_url} title={member.display_name} size={TailwindHeightSizeEnum.H6} textSize={TailwindFontSizeEnum.XS} />
                            </div>
                            <div className="flex-1" style={{ marginLeft: 10 }}>
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {member.display_name}
                                {commonData.user?.id === member.id ? (
                                  <span className="bg-orange-100 text-orange-800 text-xs font-semibold mr-2 px-2.5 py-1 rounded-xl dark:bg-orange-200 dark:text-orange-900">You</span>
                                ) : (
                                  ''
                                )}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{roles}</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </React.Fragment>
              )}
              {query && !requesting && users.length === 0 && !isEmail && <span className="my-4 text-xs font-medium text-gray-600">There are no users...</span>}
              {query && !requesting && users.length === 0 && isEmail && !isOrgAdmin && <span className="my-4 text-xs font-medium text-gray-600">There are no users...</span>}
              {/* new kyso user with email */}
              {query && !requesting && users.length === 0 && isEmail && isOrgAdmin && (
                <React.Fragment>
                  <div className="flex items-top space-x-4 mt-4">
                    <div className="shrink-0">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-500">
                        <span className="text-xs font-medium leading-none text-white">{query[0]?.toUpperCase()}</span>
                      </span>
                    </div>
                    <div className="flex-1" style={{ marginLeft: 10 }}>
                      <p className="text-xs font-medium text-gray-900 truncate mt-1">{query}</p>
                      <div className="flex flex-row">
                        {organizationRoles && (
                          <div>
                            <p className="mt-1 mr-1 block w-full pl-1 pr-10 pt-3 text-xs font-medium text-gray-600 truncate ">Organization Role</p>
                            <ListboxWithText
                              selectedLabel={selectedOrgLabel}
                              isOrgAdmin={isOrgAdmin}
                              roles={organizationRoles}
                              setSelectedRole={(value) => {
                                setSelectedOrgRole(value);
                              }}
                              setSelectedLabel={(label) => setSelectedOrgLabel(label)}
                            />
                          </div>
                        )}
                        {showTeamRoles && teamRoles && (
                          <div className="ml-4">
                            <p className="mt-1 mr-1 block w-full pl-1 pr-10 pt-3 text-xs font-medium text-gray-600 truncate ">Channel Role</p>
                            <ListboxWithText
                              selectedLabel={selectedTeamLabel}
                              isOrgAdmin={isOrgAdmin}
                              roles={teamRoles}
                              setSelectedRole={(value) => {
                                setSelectedTeamRole(value);
                              }}
                              setSelectedLabel={(label) => setSelectedTeamLabel(label)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row-reverse">
                    {selectedMemberIndex === -1 && selectedUser && (
                      <button
                        type="button"
                        disabled={!selectedOrgRole || (!selectedTeamRole && showTeamRoles)}
                        className={clsx(
                          'mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white  focus:outline-none focus:ring-2 focus:ring-offset-2',
                          !selectedOrgRole || (!selectedTeamRole && showTeamRoles) ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-kyso-600  hover:bg-kyso-700  focus:ring-indigo-900',
                        )}
                        onClick={() => {
                          onUpdateRoleMember(selectedUser.id, selectedOrgRole, selectedTeamRole);
                          clearData();
                        }}
                      >
                        Invite
                      </button>
                    )}
                    {selectedMemberIndex === -1 && !selectedUser && isEmail && (
                      <button
                        type="button"
                        disabled={!selectedOrgRole || (!selectedTeamRole && showTeamRoles)}
                        className={clsx(
                          'mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white  focus:outline-none focus:ring-2 focus:ring-offset-2',
                          !selectedOrgRole || (!selectedTeamRole && showTeamRoles) ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-kyso-600  hover:bg-kyso-700  focus:ring-indigo-900',
                        )}
                        onClick={() => {
                          onInviteNewUser(query, selectedOrgRole, selectedTeamRole);
                          clearData();
                        }}
                      >
                        Invite
                      </button>
                    )}
                    {selectedMemberIndex !== -1 && (
                      <button
                        type="button"
                        disabled={!selectedOrgRole || (!selectedTeamRole && showTeamRoles)}
                        className={clsx(
                          'mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white  focus:outline-none focus:ring-2 focus:ring-offset-2',
                          !selectedOrgRole || (!selectedTeamRole && showTeamRoles) ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-kyso-600  hover:bg-kyso-700  focus:ring-indigo-900',
                        )}
                        onClick={() => {
                          const member: Member = filteredMembers[selectedMemberIndex]!;
                          onUpdateRoleMember(member.id, selectedOrgRole, selectedTeamRole);
                          clearData();
                        }}
                      >
                        Save
                      </button>
                    )}
                    <button
                      onClick={clearData}
                      type="button"
                      className={clsx(
                        'mt-3 mr-2 inline-flex items-center px-2.5 py-1.5 border border-gray-500 text-xs font-medium rounded shadow-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white hover:bg-gray-100 focus:ring-gray-100',
                      )}
                    >
                      Cancel
                    </button>
                  </div>
                </React.Fragment>
              )}
              {query && !requesting && users.length > 0 && !selectedUser && (
                <React.Fragment>
                  <span className="my-4 text-xs font-medium text-gray-600">Select a person:</span>
                  <ul role="list" className="mt-1" style={{ maxHeight: 200, overflowY: 'scroll' }}>
                    {users.map((user: UserDTO) => {
                      const member: Member | undefined = members.find((m: Member) => m.id === user.id);
                      let roles: string | undefined = '';

                      if (member) {
                        roles = organizationRoles.find((e: { value: string; label: string }) => e.value === member.organization_roles[0])?.label;
                        if (member.team_roles && member.team_roles.length > 0) {
                          roles += ` / ${organizationRoles.find((e: { value: string; label: string }) => e.value === member.team_roles[0])?.label}`;
                        }
                      }
                      return (
                        <li
                          key={user.id}
                          className={clsx('py-1', !commonData.user || isOrgAdmin || (commonData.team != null && isTeamAdmin && member !== undefined) ? 'cursor-pointer' : 'cursor-default')}
                          onClick={() => {
                            if (!commonData.user) {
                              router.push(`/user/${user.username}`);
                            } else if (isOrgAdmin || (commonData.team != null && isTeamAdmin)) {
                              // Check if user is member
                              const index: number = members.findIndex((m: Member) => m.id === user.id);
                              if (!isOrgAdmin && commonData.team != null && isTeamAdmin && index === -1) {
                                return;
                              }
                              if (index !== -1) {
                                setSelectedOrgRole(members[index]!.organization_roles[0]!);
                                if (members[index]?.team_roles && members[index]!.team_roles.length > 0) {
                                  setSelectedTeamRole(members[index]!.team_roles[0]!);
                                }
                              }
                              setSelectedUser(user);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="shrink-0">
                              <PureAvatar src={user.avatar_url} title={user.display_name} size={TailwindHeightSizeEnum.H6} textSize={TailwindFontSizeEnum.XS}></PureAvatar>
                            </div>
                            <div className="flex-1" style={{ marginLeft: 10 }}>
                              <p className="text-xs font-medium text-gray-900 truncate">{user.display_name}</p>
                              {member ? <p className="text-xs text-gray-500 truncate">{roles}</p> : <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </React.Fragment>
              )}
              {/* user is selected and part of kyso in a channel page and org page */}
              {selectedUser && (
                <React.Fragment>
                  <div className="flex items-top space-x-4 mt-4">
                    <div className="shrink-0">
                      <PureAvatar src={selectedUser.avatar_url} title={selectedUser.display_name} size={TailwindHeightSizeEnum.H6} textSize={TailwindFontSizeEnum.XS}></PureAvatar>
                    </div>
                    <div className="flex-1" style={{ marginLeft: 10 }}>
                      <p className="text-xs font-medium text-gray-900 truncate mt-1">{(selectedUser as UserDTO).display_name || selectedUser.username}</p>
                      <div className="flex flex-row">
                        {organizationRoles && (
                          <div>
                            <p className="mt-1 mr-1 block w-full pl-1 pr-10 pt-3 text-xs font-medium text-gray-600 truncate ">Organization Role</p>
                            <ListboxWithText
                              selectedLabel={selectedOrgLabel}
                              isOrgAdmin={isOrgAdmin}
                              roles={organizationRoles}
                              setSelectedRole={(value) => {
                                setSelectedOrgRole(value);
                              }}
                              setSelectedLabel={(label) => {
                                setSelectedOrgLabel(label);
                              }}
                            />
                          </div>
                        )}
                        {showTeamRoles && teamRoles && (
                          <div className="ml-4">
                            <p className="mt-1 mr-1 block w-full pl-1 pr-10 pt-3 text-xs font-medium text-gray-600 truncate ">Channel Role</p>
                            <ListboxWithText
                              selectedLabel={selectedTeamLabel}
                              isOrgAdmin={isOrgAdmin}
                              roles={teamRoles}
                              setSelectedRole={(value) => {
                                setSelectedTeamRole(value);
                              }}
                              setSelectedLabel={(label) => setSelectedTeamLabel(label)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedOrgRole === REMOVE_USER_VALUE && (
                    <div className="mt-4">
                      <p className="text-sm">
                        The user <strong>{selectedUser.username}</strong> will be removed from the Organization <strong>{commonData.organization?.display_name}</strong>.
                      </p>
                      <p className="text-sm my-2">
                        Please type <strong>&apos;{keyDeleteUser}&apos;</strong> in the text box before confirming:
                      </p>
                      <input
                        value={inputDeleteUser}
                        type="text"
                        onChange={(e) => {
                          setInputDeleteUser(e.target.value);
                          setErrorMessage('');
                        }}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  )}
                  {selectedTeamRole === REMOVE_USER_VALUE && (
                    <div className="mt-4">
                      <p className="text-sm">
                        The user <strong>{selectedUser.username}</strong> will be removed from the Channel <strong>#{commonData.team!.sluglified_name}</strong>.
                      </p>
                      <p className="text-sm my-2">
                        Please type <strong>&apos;{keyDeleteUser}&apos;</strong> in the text box before confirming:
                      </p>
                      <input
                        value={inputDeleteUser}
                        type="text"
                        onChange={(e) => setInputDeleteUser(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  )}
                  {errorMessage && <p className="text-sm text-red-500 my-2">{errorMessage}</p>}
                  <div className="flex flex-row-reverse">
                    {selectedMemberIndex === -1 && selectedUser && (
                      <button
                        type="button"
                        disabled={!selectedOrgRole || (!selectedTeamRole && showTeamRoles)}
                        className={clsx(
                          'mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white  focus:outline-none focus:ring-2 focus:ring-offset-2',
                          !selectedOrgRole || (!selectedTeamRole && showTeamRoles) ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-kyso-600  hover:bg-kyso-700  focus:ring-indigo-900',
                        )}
                        onClick={() => {
                          onUpdateRoleMember(selectedUser.id, selectedOrgRole, selectedTeamRole);
                          clearData();
                        }}
                      >
                        Invite
                      </button>
                    )}
                    {selectedMemberIndex === -1 && !selectedUser && isEmail && (
                      <button
                        type="button"
                        disabled={!selectedOrgRole || (!selectedTeamRole && showTeamRoles)}
                        className={clsx(
                          'mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white  focus:outline-none focus:ring-2 focus:ring-offset-2',
                          !selectedOrgRole || (!selectedTeamRole && showTeamRoles) ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-kyso-600  hover:bg-kyso-700  focus:ring-indigo-900',
                        )}
                        onClick={() => {
                          onInviteNewUser(query, selectedOrgRole, selectedTeamRole);
                          clearData();
                        }}
                      >
                        Invite
                      </button>
                    )}
                    {(selectedOrgRole === REMOVE_USER_VALUE || selectedTeamRole === REMOVE_USER_VALUE) && selectedMemberIndex !== -1 && (
                      <button
                        type="button"
                        className={clsx(
                          'mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white  focus:outline-none focus:ring-2 focus:ring-offset-2',
                          inputDeleteUser !== keyDeleteUser ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-kyso-600  hover:bg-kyso-700  focus:ring-indigo-900',
                        )}
                        onClick={() => {
                          if (inputDeleteUser !== keyDeleteUser) {
                            setErrorMessage('Please type the correct key to remove the user.');
                            return;
                          }
                          const member: Member = filteredMembers[selectedMemberIndex]!;
                          onRemoveUser(member.id, selectedOrgRole === REMOVE_USER_VALUE ? TeamMembershipOriginEnum.ORGANIZATION : TeamMembershipOriginEnum.TEAM);
                          clearData();
                        }}
                      >
                        Save
                      </button>
                    )}
                    {selectedOrgRole !== REMOVE_USER_VALUE && selectedTeamRole !== REMOVE_USER_VALUE && selectedMemberIndex !== -1 && (
                      <button
                        type="button"
                        disabled={!selectedOrgRole || (!selectedTeamRole && showTeamRoles)}
                        className={clsx(
                          'mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white  focus:outline-none focus:ring-2 focus:ring-offset-2',
                          !selectedOrgRole || (!selectedTeamRole && showTeamRoles) ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-kyso-600  hover:bg-kyso-700  focus:ring-indigo-900',
                        )}
                        onClick={() => {
                          const member: Member = filteredMembers[selectedMemberIndex]!;
                          onUpdateRoleMember(member.id, selectedOrgRole, selectedTeamRole);
                          clearData();
                        }}
                      >
                        Save
                      </button>
                    )}
                    <button
                      onClick={clearData}
                      type="button"
                      className={clsx(
                        'mt-3 mr-2 inline-flex items-center px-2.5 py-1.5 border border-gray-500 text-xs font-medium rounded shadow-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white hover:bg-gray-100 focus:ring-gray-100',
                      )}
                    >
                      Cancel
                    </button>
                  </div>
                </React.Fragment>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </React.Fragment>
  );
};

export default ManageUsers;
