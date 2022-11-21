/* eslint-disable @typescript-eslint/no-explicit-any */
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { Dialog, Transition } from '@headlessui/react';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { ExclamationCircleIcon, LinkIcon, MailIcon } from '@heroicons/react/solid';
import type { KysoSetting, NormalizedResponseDTO, OrganizationMember } from '@kyso-io/kyso-model';
import { AddUserOrganizationDto, GlobalPermissionsEnum, InviteUserDto, KysoSettingsEnum, OrganizationPermissionsEnum, UpdateOrganizationMembersDTO, UserDTO, UserRoleDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import CaptchaModal from '../../../components/CaptchaModal';
import PureAvatar from '../../../components/PureAvatar';
import SettingsAside from '../../../components/SettingsAside';
import ToasterNotification from '../../../components/ToasterNotification';
import { checkJwt } from '../../../helpers/check-jwt';
import { HelperPermissions } from '../../../helpers/check-permissions';
import { Helper } from '../../../helpers/Helper';
import { useRedirectIfNoJWT } from '../../../hooks/use-redirect-if-no-jwt';
import { TailwindColor } from '../../../tailwind/enum/tailwind-color.enum';
import { TailwindFontSizeEnum } from '../../../tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '../../../tailwind/enum/tailwind-height.enum';
import type { CommonData } from '../../../types/common-data';
import type { Member } from '../../../types/member';

const OrganizationRoleToLabel: { [role: string]: string } = {
  'organization-admin': 'Admin of this organization',
  'team-admin': 'Full access all channels',
  'team-contributor': 'Can edit all channels',
  'team-reader': 'Can comment all channels',
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
  const ref = useRef<any>(null);
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
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [bio, setBio] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [urlLocalFile, setUrlLocalFile] = useState<string | null>(null);
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);
  const [newDomain, setNewDomain] = useState<string>('');
  const [allowedAccessDomains, setAllowedAccessDomains] = useState<string[]>([]);
  const [errorNewDomain, setErrorNewDomain] = useState<string>('');
  const [centralizedNotifications, setCentralizedNotifications] = useState<boolean>(false);
  const [emailsCentralizedNotifications, setEmailsCentralizedNotifications] = useState<string[]>([]);
  const [newEmailCentralizedNotifications, setNewEmailCentralizedNotifications] = useState<string>('');
  const [errorNewEmail, setErrorNewEmail] = useState<string>('');
  const [loginKyso, setLoginKyso] = useState<boolean>(false);
  const [loginGoogle, setLoginGoogle] = useState<boolean>(false);
  const [loginGithub, setLoginGithub] = useState<boolean>(false);
  const [loginBitbucket, setLoginBitbucket] = useState<boolean>(false);
  const [loginGitlab, setLoginGitlab] = useState<boolean>(false);
  // const [showOpenPingIdModal, setShowOpenPingIdModal] = useState<boolean>(true);
  const [showDeleteOrgModal, setShowDeleteOrgModal] = useState<boolean>(false);
  const [textOrgModal, setTextOrgModal] = useState<string>('');
  const [showCaptchaModal, setShowCaptchaModal] = useState<boolean>(false);

  useEffect(() => {
    const result: boolean = checkJwt();
    setUserIsLogged(result);
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
    if (!isOrgAdmin) {
      return;
    }
    if (commonData.organization) {
      setBio(commonData.organization!.bio);
      setLink(commonData.organization!.link);
      setLocation(commonData.organization!.location);
      setAllowedAccessDomains(commonData.organization!.allowed_access_domains || []);
      if (commonData.organization?.options) {
        if (commonData.organization.options?.notifications) {
          setCentralizedNotifications(commonData.organization.options.notifications.centralized);
          setEmailsCentralizedNotifications(commonData.organization.options.notifications.emails || []);
        }
        if (commonData.organization.options?.auth) {
          setLoginKyso(commonData.organization.options.auth.allow_login_with_kyso || false);
          setLoginGoogle(commonData.organization.options.auth.allow_login_with_google || false);
          setLoginGithub(commonData.organization.options.auth.allow_login_with_github || false);
          setLoginBitbucket(commonData.organization.options.auth.allow_login_with_bitbucket || false);
          setLoginGitlab(commonData.organization.options.auth.allow_login_with_gitlab || false);
        }
      }
    } else {
      setBio('');
      setLink('');
      setLocation('');
      setAllowedAccessDomains([]);
      setCentralizedNotifications(false);
      setEmailsCentralizedNotifications([]);
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

  const onChangeInputFile = (e: any) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUrlLocalFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  const submit = async () => {
    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowCaptchaModal(true);
      return;
    }
    if (commonData.user?.email_verified === false) {
      setShowToaster(true);
      setMessageToaster('Please verify your email');
      return;
    }
    try {
      setMessageToaster('Updating organization profile...');
      const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name);
      if (file !== null) {
        setShowToaster(true);
        setRequesting(true);
        await api.updateOrganizationImage(commonData.organization!.id!, file);
      }
      await api.updateOrganization(commonData.organization!.id!, {
        bio,
        link,
        location,
      } as any);
      router.reload();
    } catch (e: any) {
      console.log(e.response.data);
    } finally {
      setRequesting(false);
      setShowToaster(false);
      setMessageToaster('');
    }
  };

  const submitAccess = async () => {
    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowCaptchaModal(true);
      return;
    }
    if (commonData.user?.email_verified === false) {
      setShowToaster(true);
      setMessageToaster('Please verify your email');
      return;
    }
    if (centralizedNotifications && emailsCentralizedNotifications.length === 0) {
      setShowToaster(true);
      setMessageToaster('Please enter at least one valid email for centrilized notifications');
      return;
    }
    try {
      setRequesting(true);
      const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name);
      if (JSON.stringify(commonData.organization!.allowed_access_domains) !== JSON.stringify(allowedAccessDomains)) {
        await api.updateOrganization(commonData.organization!.id!, {
          allowed_access_domains: allowedAccessDomains,
        } as any);
      }
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
        },
      } as any);
      router.reload();
    } catch (e: any) {
      console.log(e.response.data);
    } finally {
      setRequesting(false);
      setShowToaster(false);
      setMessageToaster('');
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
      if (userMember) {
        m.unshift(userMember);
      }
      setMembers(m);
    } catch (e) {
      console.error(e);
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
    setRequesting(true);
    const index: number = members.findIndex((m: Member) => m.id === selectedMember?.id);
    if (index === -1) {
      try {
        const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
        const addUserOrganizationDto: AddUserOrganizationDto = new AddUserOrganizationDto(commonData.organization!.id!, selectedMember!.id!, organizationRole);
        await api.addUserToOrganization(addUserOrganizationDto);
      } catch (e) {
        console.error(e);
      }
    } else if (!members[index]!.organization_roles.includes(organizationRole)) {
      try {
        const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
        const userRoleDTO: UserRoleDTO = new UserRoleDTO(selectedMember!.id!, organizationRole);
        const updateOrganizationMembersDTO: UpdateOrganizationMembersDTO = new UpdateOrganizationMembersDTO([userRoleDTO]);
        await api.updateOrganizationMemberRoles(commonData.organization!.id!, updateOrganizationMembersDTO);
      } catch (e) {
        console.error(e);
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
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      await api.removeUserFromOrganization(commonData!.organization!.id!, selectedMember!.id);
      getOrganizationMembers();
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
        const userDTO: UserDTO = new UserDTO(term, term, term, term, term, '', '', '', '', '', '', new Date(), [], true, false);
        usersNotInOrg.push(userDTO);
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
      const api: Api = new Api(commonData.token, commonData!.organization!.sluglified_name);
      const inviteUserDto: InviteUserDto = new InviteUserDto(selectedUser?.email!, commonData.organization!.sluglified_name, organizationRole);
      await api.inviteNewUser(inviteUserDto);
      getOrganizationMembers();
      setOrganizationRole('');
      setQuery('');
      setUsers(users.filter((u: UserDTO) => u.id !== selectedMember?.id));
      setSelectedMember(null);
      setOpenInviteUserModal(false);
    } catch (e) {
      console.error(e);
    }
    setRequesting(false);
  };

  const deleteOrganization = async () => {
    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowCaptchaModal(true);
      return;
    }
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      await api.deleteOrganization(commonData.organization!.id!);
    } catch (error: any) {
      console.log(error.response.data.message);
      setShowDeleteOrgModal(false);
      setTextOrgModal('');
      setRequesting(false);
    }
    window.location.href = '/';
  };

  const onCloseCaptchaModal = async (refreshUser: boolean) => {
    setShowCaptchaModal(false);
    if (refreshUser) {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
      setUser(result.data);
    }
  };

  if (userIsLogged === null) {
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
                    {/* <p className="mt-1 max-w-2xl text-sm text-gray-500">Use a permanent address where you can receive mail.</p> */}
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
                          'ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
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
                  <a href={commonData.organization?.link} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                    {commonData.organization?.link}
                  </a>
                  {commonData.organization?.location && <p className="text-sm text-gray-500 py-2">{commonData.organization?.location}</p>}
                  <p className="text-md text-gray-500">{commonData.organization?.bio}</p>
                </div>
              )}
            </div>
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
                      disabled={!newDomain || requesting}
                      onClick={() => {
                        const index: number = allowedAccessDomains.indexOf(newDomain);
                        if (index !== -1) {
                          setErrorNewDomain('Domain already registered');
                          return;
                        }
                        if (!Helper.isValidUrl(newDomain)) {
                          setErrorNewDomain('Invalid domain');
                          return;
                        }
                        setAllowedAccessDomains([...allowedAccessDomains, newDomain]);
                        setNewDomain('');
                      }}
                      className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
                                  setAllowedAccessDomains(newDomains);
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
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Configure notifications</h3>
                  <div className="mt-4 space-y-4">
                    <div className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          checked={centralizedNotifications}
                          onChange={(e: any) => setCentralizedNotifications(e.target.checked)}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label className="font-medium text-gray-700">Centralized comunication</label>
                      </div>
                    </div>
                  </div>
                  {centralizedNotifications && (
                    <React.Fragment>
                      <div className="flex items-center">
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
                          disabled={!newEmailCentralizedNotifications || requesting}
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
                          className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
                        <React.Fragment>
                          <dt className="text-sm font-medium text-gray-500">Emails:</dt>
                          <ul role="list" className="divide-y divide-gray-200 rounded-md border border-gray-200 block w-full max-w-lg">
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
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  )}
                  {/* <h3 className="text-lg font-medium leading-6 text-gray-900">Configure your custom login page</h3>
                  <div className="mt-4 space-y-4">
                    <div className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          checked={loginKyso}
                          onChange={(e: any) => setLoginKyso(e.target.checked)}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label className="font-medium text-gray-700">Allow login with Kyso local users</label>
                      </div>
                    </div>
                    <div className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          checked={loginGithub}
                          onChange={(e: any) => setLoginGithub(e.target.checked)}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label className="font-medium text-gray-700">Allow login with Github</label>
                      </div>
                    </div>
                    <div className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          checked={loginBitbucket}
                          onChange={(e: any) => setLoginBitbucket(e.target.checked)}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label className="font-medium text-gray-700">Allow login with Bitbucket</label>
                      </div>
                    </div>
                    <div className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          checked={loginGitlab}
                          onChange={(e: any) => setLoginGitlab(e.target.checked)}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label className="font-medium text-gray-700">Allow login with Gitlab</label>
                      </div>
                    </div>
                    <div className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          checked={loginGoogle}
                          onChange={(e: any) => setLoginGoogle(e.target.checked)}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label className="font-medium text-gray-700">Allow login with Google</label>
                      </div>
                    </div>
                  </div> */}
                  <div className="pt-5 sm:border-t sm:border-gray-200">
                    <div className="flex justify-end">
                      <button
                        disabled={requesting}
                        onClick={() => router.reload()}
                        type="button"
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={requesting}
                        onClick={submitAccess}
                        type="submit"
                        className={clsx(
                          'ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                          requesting && 'opacity-50 cursor-not-allowed',
                        )}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            )}
            {isOrgAdmin && (
              <div className="mt-4">
                {/* SEARCH USERS */}
                <h3 className="text-lg font-medium leading-6 text-gray-900 my-4">Add users to the organization:</h3>
                <div className="my-4 sm:col-span-2">
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
            {/* ORGANIZATION MEMBERS */}
            <h3 className="text-lg font-medium leading-6 text-gray-900 my-8">Organization members ({members.length}):</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {members.map((member: Member) => {
                const labelRole: string = member.organization_roles.length > 0 && OrganizationRoleToLabel[member.organization_roles[0]!] ? OrganizationRoleToLabel[member.organization_roles[0]!]! : '';
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
                    {isOrgAdmin && (
                      <div className="flex flex-row">
                        <div title="Edit member role in the organization">
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
                        <div title="Remove member from the organization">
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
                          The user <strong>{selectedMember?.display_name}</strong> will be removed from the Organization <strong>{commonData.organization?.display_name}</strong>. This action cannot be
                          undone.
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
      {/* <PingIdModal open={showOpenPingIdModal} setOpen={setShowOpenPingIdModal} /> */}
      {/* DELETE ORGANIZATION */}
      <Transition.Root show={showDeleteOrgModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowDeleteOrgModal}>
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
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className={clsx(
                        'inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
                        requesting || textOrgModal !== commonData.organization?.sluglified_name ? 'cursor-not-allowed opacity-50' : '',
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
      {commonData.user && <CaptchaModal user={commonData.user!} open={showCaptchaModal} onClose={onCloseCaptchaModal} />}
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
