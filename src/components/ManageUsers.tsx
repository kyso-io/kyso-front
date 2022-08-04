import { Menu, Transition } from '@headlessui/react';
import { SearchIcon } from '@heroicons/react/outline';
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid';
import type { UserDTO } from '@kyso-io/kyso-model';
import { GlobalPermissionsEnum, OrganizationPermissionsEnum, TeamMembershipOriginEnum, TeamPermissionsEnum } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import slugify from 'slugify';
import checkPermissions from '../helpers/check-permissions';
import { Helper } from '../helpers/Helper';
import type { CommonData } from '../hooks/use-common-data';
import { useCommonData } from '../hooks/use-common-data';
import type { Member } from '../types/member';

const MAX_USERS_TO_SHOW = 5;
const REMOVE_USER_VALUE = 'remove';

const getInitials = (str: string) => {
  if (!str) {
    return '';
  }
  return str
    .split(' ')
    .map((name: string) => name[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const debouncedFetchData = debounce((cb: () => void) => {
  cb();
}, 750);

interface Props {
  members: Member[];
  users: UserDTO[];
  onInputChange: (query: string) => void;
  showTeamRoles: boolean;
  onUpdateRoleMember: (userId: string, organizationRole: string, teamRole?: string) => void;
  onInviteNewUser: (email: string, organizationRole: string, teamRole?: string) => void;
  onRemoveUser: (userId: string) => void;
}

const ManageUsers = ({ members, users, onInputChange, showTeamRoles, onUpdateRoleMember, onInviteNewUser, onRemoveUser }: Props) => {
  const router = useRouter();
  const [query, setQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserDTO | Member | null>(null);
  const [requesting, setRequesting] = useState<boolean>(false);
  const [selectedOrgRole, setSelectedOrgRole] = useState<string>('');
  const [selectedTeamRole, setSelectedTeamRole] = useState<string>('');
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number>(-1);
  const [isEmail, setIsEmail] = useState<boolean>(false);
  const [inputDeleteUser, setInputDeleteUser] = useState<string>('');
  const [keyDeleteUser, setKeyDeleteUser] = useState<string>('');

  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });
  const isOrgAdmin: boolean = useMemo(() => checkPermissions(commonData, GlobalPermissionsEnum.GLOBAL_ADMIN) || checkPermissions(commonData, OrganizationPermissionsEnum.ADMIN), [commonData]);
  const isTeamAdmin: boolean = useMemo(() => checkPermissions(commonData, TeamPermissionsEnum.ADMIN), [commonData]);

  const organizationRoles: { value: string; label: string }[] = useMemo(() => {
    const data: { value: string; label: string }[] = [
      { value: 'organization-admin', label: 'Organization Admin' },
      { value: 'team-admin', label: 'Team Admin' },
      { value: 'team-contributor', label: 'Team Contributor' },
      { value: 'team-reader', label: 'Team Reader' },
    ];
    if (selectedUser) {
      if (members.length > 0) {
        const index: number = members.findIndex((member: Member) => member.id === selectedUser.id);
        if (index > -1) {
          data.push({ value: 'remove', label: 'Remove' });
        }
      } else if (users.length > 0) {
        const index: number = users.findIndex((user: UserDTO) => user.id === selectedUser.id);
        if (index > -1) {
          data.push({ value: REMOVE_USER_VALUE, label: 'Remove' });
        }
      }
    }
    return data;
  }, [selectedUser, members, users]);

  const teamRoles: { value: string; label: string }[] = useMemo(() => {
    const data: { value: string; label: string }[] = [
      { value: 'team-admin', label: 'Team Admin' },
      { value: 'team-contributor', label: 'Team Contributor' },
      { value: 'team-reader', label: 'Team Reader' },
    ];
    if (selectedUser) {
      if (members.length > 0) {
        const member: Member | undefined = members.find((m: Member) => m.id === selectedUser.id);
        if (member) {
          if (member?.membership_origin === TeamMembershipOriginEnum.TEAM) {
            data.push({ value: 'remove', label: 'Remove' });
          }
        }
      } else if (users.length > 0) {
        const index: number = users.findIndex((user: UserDTO) => user.id === selectedUser.id);
        if (index > -1) {
          data.push({ value: REMOVE_USER_VALUE, label: 'Remove' });
        }
      }
    }
    return data;
  }, [selectedUser, members, users]);

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
    setSelectedTeamRole('');
    setInputDeleteUser('');
    setKeyDeleteUser('');
  };

  let plusMembers = 0;
  if (members.length > MAX_USERS_TO_SHOW) {
    plusMembers = members.length - MAX_USERS_TO_SHOW;
  }

  let selectedUserInitials: string = '';
  if (selectedUser && !selectedUser.avatar_url) {
    selectedUserInitials = getInitials((selectedUser as UserDTO).display_name || (selectedUser as Member).username);
  }

  return (
    <React.Fragment>
      <Menu as="div" className="ml-2 relative inline-block text-left">
        <div>
          <Menu.Button className="flex items-center">
            <div className="flex -space-x-1 relative z-0 overflow-hidden">
              {members.slice(0, MAX_USERS_TO_SHOW).map((member: Member) => {
                if (member.avatar_url) {
                  return <img key={member.id} className={`object-cover inline-block h-6 w-6 rounded-full ring-2 ring-white`} src={member.avatar_url} alt="" />;
                }
                const initials: string = getInitials(member.username);
                return (
                  <span key={member.id} className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-500">
                    <span className="text-xs font-medium leading-none text-white">{initials}</span>
                  </span>
                );
              })}
            </div>
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
            className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity/5 focus:outline-none"
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
              {(!query || query.length === 0) && !selectedUser && (
                <React.Fragment>
                  <span className="my-4 text-xs font-medium text-gray-600">Members:</span>
                  <ul role="list" className="mt-1" style={{ maxHeight: 200, overflowY: 'scroll' }}>
                    {members.map((member: Member, index: number) => {
                      let roles: string | undefined = organizationRoles.find((e: { value: string; label: string }) => e.value === member.organization_roles[0])?.label;
                      if (member.team_roles && member.team_roles.length > 0) {
                        roles += ` / ${organizationRoles.find((e: { value: string; label: string }) => e.value === member.team_roles[0])?.label}`;
                      }
                      let initials: string = '';
                      if (!member.avatar_url) {
                        initials = getInitials(member.username);
                      }
                      return (
                        <li
                          key={member.id}
                          className={clsx('py-1', isOrgAdmin || (isTeamAdmin && showTeamRoles) ? 'cursor-pointer' : 'cursor-default')}
                          onClick={() => {
                            if (isOrgAdmin || (isTeamAdmin && showTeamRoles)) {
                              setSelectedOrgRole(member.organization_roles[0]!);
                              if (member.team_roles && member.team_roles.length > 0) {
                                setSelectedTeamRole(member.team_roles[0]!);
                              }
                              setSelectedUser({ ...member });
                              setSelectedMemberIndex(index);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="shrink-0">
                              {member.avatar_url ? (
                                <img className="object-cover inline-block h-6 w-6 rounded-full ring-2 ring-white" src={member.avatar_url} alt="" />
                              ) : (
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-500">
                                  <span className="text-xs font-medium leading-none text-white">{initials}</span>
                                </span>
                              )}
                            </div>
                            <div className="flex-1" style={{ marginLeft: 10 }}>
                              <p className="text-xs font-medium text-gray-900 truncate">{member.username}</p>
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
              {query && !requesting && users.length === 0 && isEmail && isOrgAdmin && (
                <React.Fragment>
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="shrink-0">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-500">
                        <span className="text-xs font-medium leading-none text-white">{query[0]?.toUpperCase()}</span>
                      </span>
                    </div>
                    <div className="flex-1" style={{ marginLeft: 10 }}>
                      <p className="text-xs font-medium text-gray-900 truncate">{query}</p>
                      <div className="flex flex-row">
                        <select
                          value={selectedOrgRole}
                          onChange={(e) => setSelectedOrgRole(e.target.value)}
                          className="mt-1 mr-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="">Select a role</option>
                          {organizationRoles.map((role: { value: string; label: string }) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        {showTeamRoles && (
                          <select
                            value={selectedTeamRole}
                            onChange={(e) => setSelectedTeamRole(e.target.value)}
                            className="mt-1 ml-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="">Select a role</option>
                            {teamRoles.map((role: { value: string; label: string }) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
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
                          !selectedOrgRole || (!selectedTeamRole && showTeamRoles) ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
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
                          !selectedOrgRole || (!selectedTeamRole && showTeamRoles) ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
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
                          !selectedOrgRole || (!selectedTeamRole && showTeamRoles) ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
                        )}
                        onClick={() => {
                          const member: Member = members[selectedMemberIndex]!;
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
                        'mt-3 mr-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 bg-slate-300 hover:bg-slate-300 focus:ring-slate-300',
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
                      let initials: string = '';
                      if (!user.avatar_url) {
                        initials = getInitials(user.name);
                      }
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
                          className={clsx('py-1', isOrgAdmin ? 'cursor-pointer' : 'cursor-default')}
                          onClick={() => {
                            if (!isOrgAdmin) {
                              return;
                            }
                            // Check if user is member
                            const index: number = members.findIndex((m: Member) => m.id === user.id);
                            if (index !== -1) {
                              setSelectedOrgRole(members[index]!.organization_roles[0]!);
                              if (members[index]?.team_roles && members[index]!.team_roles.length > 0) {
                                setSelectedTeamRole(members[index]!.team_roles[0]!);
                              }
                            }
                            setSelectedUser(user);
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="shrink-0">
                              {user.avatar_url ? (
                                <img className="h-6 w-6 rounded-full" src={user.avatar_url} alt="" />
                              ) : (
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-500">
                                  <span className="text-xs font-medium leading-none text-white">{initials}</span>
                                </span>
                              )}
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
              {selectedUser && (
                <React.Fragment>
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="shrink-0">
                      {selectedUser.avatar_url ? (
                        <img className="object-cover inline-block h-6 w-6 rounded-full ring-2 ring-white" src={selectedUser.avatar_url} alt="" />
                      ) : (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-500">
                          <span className="text-xs font-medium leading-none text-white">{selectedUserInitials}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex-1" style={{ marginLeft: 10 }}>
                      <p className="text-xs font-medium text-gray-900 truncate">{(selectedUser as UserDTO).display_name || selectedUser.username}</p>
                      <div className="flex flex-row">
                        <select
                          disabled={!isOrgAdmin}
                          value={selectedOrgRole}
                          onChange={(e) => setSelectedOrgRole(e.target.value)}
                          className="mt-1 mr-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="">Select a role</option>
                          {organizationRoles.map((role: { value: string; label: string }) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        {showTeamRoles && (
                          <select
                            value={selectedTeamRole}
                            onChange={(e) => setSelectedTeamRole(e.target.value)}
                            className="mt-1 ml-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="">Select a role</option>
                            {teamRoles.map((role: { value: string; label: string }) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedOrgRole === REMOVE_USER_VALUE && (
                    <div className="mt-4">
                      <p className="text-sm">
                        The user <strong>{selectedUser.username}</strong> will be removed from the Organization <strong>{commonData.organization.display_name}</strong>.
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
                  {selectedTeamRole === REMOVE_USER_VALUE && (
                    <div className="mt-4">
                      <p className="text-sm">
                        The user <strong>{selectedUser.username}</strong> will be removed from the Channel <strong>#{commonData.team.sluglified_name}</strong>.
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
                  <div className="flex flex-row-reverse">
                    {selectedMemberIndex === -1 && selectedUser && (
                      <button
                        type="button"
                        disabled={!selectedOrgRole || (!selectedTeamRole && showTeamRoles)}
                        className={clsx(
                          'mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white  focus:outline-none focus:ring-2 focus:ring-offset-2',
                          !selectedOrgRole || (!selectedTeamRole && showTeamRoles) ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
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
                          !selectedOrgRole || (!selectedTeamRole && showTeamRoles) ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
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
                        disabled={inputDeleteUser !== keyDeleteUser}
                        className={clsx(
                          'mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white  focus:outline-none focus:ring-2 focus:ring-offset-2',
                          inputDeleteUser !== keyDeleteUser ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
                        )}
                        onClick={() => {
                          const member: Member = members[selectedMemberIndex]!;
                          onRemoveUser(member.id);
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
                          !selectedOrgRole || (!selectedTeamRole && showTeamRoles) ? 'bg-slate-500 hover:bg-slate-500 focus:ring-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
                        )}
                        onClick={() => {
                          const member: Member = members[selectedMemberIndex]!;
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
                        'mt-3 mr-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 bg-slate-300 hover:bg-slate-300 focus:ring-slate-300',
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