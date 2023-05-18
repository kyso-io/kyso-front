/* eslint-disable @typescript-eslint/no-explicit-any */
import DelayedContent from '@/components/DelayedContent';
import { RegisteredUsersAlert } from '@/components/RegisteredUsersAlert';
import SettingsAside from '@/components/SettingsAside';
import { ToasterIcons } from '@/enums/toaster-icons';
import { Helper } from '@/helpers/Helper';
import { checkJwt } from '@/helpers/check-jwt';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { Switch } from '@headlessui/react';
import { InformationCircleIcon } from '@heroicons/react/solid';
import type { NormalizedResponseDTO, ResourcePermissions, UserNotificationsSettings } from '@kyso-io/kyso-model';
import { NotificationsSettings, UpdateUserNotificationsSettings, UserNotificationsSettingsScope } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

enum Tab {
  GlobalConfiguration = 'Global Configuration',
  OrganizationAndChannel = 'Organization and Channel',
}

const tabs: Tab[] = [Tab.GlobalConfiguration, Tab.OrganizationAndChannel];

const options: { title: string; description: string; key: string; disabled_for_channel: boolean }[] = [
  // ORGANIZATION
  {
    title: 'New member in your organization',
    description: 'Receive a notification every time a new member is added to you organization',
    key: 'new_member_organization',
    disabled_for_channel: true,
  },
  {
    title: 'Removed member from your organization',
    description: 'Receive a notification every time a member is removed from your organization',
    key: 'removed_member_in_organization',
    disabled_for_channel: true,
  },
  {
    title: 'Changed role in your organization',
    description: 'Receive a notification every time your role in the organization changes',
    key: 'updated_role_in_organization',
    disabled_for_channel: true,
  },
  {
    title: 'Organization removed',
    description: 'Receive a notification every time an organization is removed',
    key: 'organization_removed',
    disabled_for_channel: true,
  },
  // CHANNEL
  {
    title: 'New channel',
    description: 'Receive a notification every time a new channel is created.',
    key: 'new_channel',
    disabled_for_channel: true,
  },
  {
    title: 'New member in your channel',
    description: 'Receive a notification every time a new member is added to you channel',
    key: 'new_member_channel',
    disabled_for_channel: false,
  },
  {
    title: 'Removed member from your channel',
    description: 'Receive a notification every time a member is removed from your channel',
    key: 'removed_member_in_channel',
    disabled_for_channel: false,
  },
  {
    title: 'Changed role in your channel',
    description: 'Receive a notification every time your role in the channel changes',
    key: 'updated_role_in_channel',
    disabled_for_channel: false,
  },
  {
    title: 'Channel removed',
    description: 'Receive a notification every time a channel is removed',
    key: 'channel_removed',
    disabled_for_channel: false,
  },
  // REPORT
  {
    title: 'New report',
    description: 'Receive a notification every time a new report is created.',
    key: 'new_report',
    disabled_for_channel: false,
  },
  {
    title: 'New report version',
    description: 'Receive a notification every time a new version of a report is uploaded.',
    key: 'new_report_version',
    disabled_for_channel: false,
  },
  {
    title: 'Report removed',
    description: 'Receive a notification every time a report is removed',
    key: 'report_removed',
    disabled_for_channel: false,
  },
  {
    title: 'New comment in report',
    description: 'Receive a notification every time a new comment is added to a report',
    key: 'new_comment_in_report',
    disabled_for_channel: false,
  },
  {
    title: 'Reply comment in report',
    description: 'Receive a notification every time a comment is replied in a report',
    key: 'replay_comment_in_report',
    disabled_for_channel: false,
  },
  {
    title: 'New mention in report',
    description: 'Receive a notification every time you are mentioned in a report',
    key: 'new_mention_in_report',
    disabled_for_channel: false,
  },
  {
    title: 'Report comment removed',
    description: 'Receive a notification every time a comment is removed from a report',
    key: 'report_comment_removed',
    disabled_for_channel: false,
  },
];

const Index = ({ commonData, showToaster, hideToaster }: IKysoApplicationLayoutProps) => {
  const router = useRouter();
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.GlobalConfiguration);
  const [notificationsSettings, setNotificationsSettings] = useState<NotificationsSettings>(new NotificationsSettings());
  const [userNotificationsSettings, setUserNotificationsSettings] = useState<UserNotificationsSettings | null>(null);
  const [organizationId, setOrganizationId] = useState<string>('');
  const [isGlobalInheritanceBroken, setIsGlobalInheritanceBroken] = useState<boolean>(false);
  const [isOrganizationInheritanceBroken, setIsOrganizationInheritanceBroken] = useState<boolean>(false);
  const [teamId, setTeamId] = useState<string>('');
  const organizationsResourcePermissions: ResourcePermissions[] = useMemo(() => {
    if (!commonData.permissions) {
      return [];
    }
    return commonData.permissions.organizations!.sort((a: ResourcePermissions, b: ResourcePermissions) =>
      a.display_name.toLowerCase() > b.display_name.toLowerCase() ? 1 : a.display_name.toLowerCase() < b.display_name.toLowerCase() ? -1 : 0,
    );
  }, [commonData.permissions]);
  const teamsResourcePermissions: ResourcePermissions[] = useMemo(() => {
    if (!organizationId) {
      return [];
    }
    if (!commonData.permissions) {
      return [];
    }
    return commonData.permissions
      .teams!.filter((trp: ResourcePermissions) => trp.organization_id === organizationId)
      .sort((a: ResourcePermissions, b: ResourcePermissions) =>
        a.display_name.toLowerCase() > b.display_name.toLowerCase() ? 1 : a.display_name.toLowerCase() < b.display_name.toLowerCase() ? -1 : 0,
      );
  }, [commonData.permissions, organizationId]);

  useEffect(() => {
    const result: boolean = checkJwt();
    setUserIsLogged(result);
  }, []);

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
    if (!commonData.token) {
      return;
    }
    if (!commonData.permissions) {
      return;
    }
    const getData = async () => {
      try {
        const api: Api = new Api(commonData.token);
        const result: NormalizedResponseDTO<UserNotificationsSettings> = await api.getUserNotificationsSetting();
        setUserNotificationsSettings(result.data);
      } catch (e) {}
    };
    getData();
  }, [commonData.token]);

  const buildFinalNotificationSettings = (
    orgNotificationSettings: NotificationsSettings | undefined,
    teamNotificationSettings: NotificationsSettings | undefined,
    globalNotificationSettings: NotificationsSettings,
  ) => {
    let finalSettings: NotificationsSettings | undefined = new NotificationsSettings();

    if (globalNotificationSettings) {
      finalSettings = globalNotificationSettings;
    }

    // If there is organization settings, that overwrites globals
    if (orgNotificationSettings) {
      finalSettings = orgNotificationSettings;
      setIsGlobalInheritanceBroken(true);
    } else {
      setIsGlobalInheritanceBroken(false);
    }

    // If there is team settings, that overwrite SOME of the properties
    if (teamNotificationSettings) {
      setIsOrganizationInheritanceBroken(true);

      for (const option of options) {
        if (option.disabled_for_channel === false) {
          // fuck off typescript
          // @ts-ignore
          finalSettings[option.key] = teamNotificationSettings[option.key];
        }
      }
    } else {
      setIsOrganizationInheritanceBroken(false);
    }

    return finalSettings;
  };

  const refreshData = async () => {
    try {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<UserNotificationsSettings> = await api.getUserNotificationsSetting();

      let selectedChannelSettings;
      let selectedOrganizationSettings;

      if (!result.data) {
        return;
      }

      if (Helper.isPropertyInObject(result.data.organization_settings, organizationId)) {
        selectedOrganizationSettings = result.data.organization_settings[organizationId]!;
      } else {
        selectedOrganizationSettings = undefined;
      }

      if (Helper.isPropertyInObject(result.data.channels_settings, organizationId)) {
        if (Helper.isPropertyInObject(result.data.channels_settings[organizationId]!, teamId)) {
          selectedChannelSettings = result.data.channels_settings[organizationId]![teamId]!;
        } else {
          selectedChannelSettings = undefined;
        }
      } else {
        selectedChannelSettings = undefined;
      }

      const finalPermissions: NotificationsSettings = buildFinalNotificationSettings(selectedOrganizationSettings, selectedChannelSettings, result.data.global_settings);
      const refreshedUserNotificationsSettings: NormalizedResponseDTO<UserNotificationsSettings> = await api.getUserNotificationsSetting();

      setUserNotificationsSettings(refreshedUserNotificationsSettings.data);
      setNotificationsSettings(finalPermissions);
    } catch (e) {}
  };

  useEffect(() => {
    if (!userNotificationsSettings) {
      return;
    }

    let selectedChannelSettings;
    let selectedOrganizationSettings;

    if (Helper.isPropertyInObject(userNotificationsSettings.organization_settings, organizationId)) {
      selectedOrganizationSettings = userNotificationsSettings.organization_settings[organizationId]!;
    } else {
      selectedOrganizationSettings = undefined;
    }

    if (Helper.isPropertyInObject(userNotificationsSettings.channels_settings, organizationId)) {
      if (Helper.isPropertyInObject(userNotificationsSettings.channels_settings[organizationId]!, teamId)) {
        selectedChannelSettings = userNotificationsSettings.channels_settings[organizationId]![teamId]!;
      } else {
        selectedChannelSettings = undefined;
      }
    } else {
      selectedChannelSettings = undefined;
    }

    const finalPermissions: NotificationsSettings = buildFinalNotificationSettings(selectedOrganizationSettings, selectedChannelSettings, userNotificationsSettings.global_settings);

    setNotificationsSettings(finalPermissions);
  }, [userNotificationsSettings, selectedTab, organizationId, teamId]);

  const onUpdateUserNotificationsSettings = async (nss: NotificationsSettings) => {
    const api: Api = new Api(commonData.token);
    if (selectedTab === Tab.GlobalConfiguration) {
      try {
        const updateUserNotificationsSettings: UpdateUserNotificationsSettings = new UpdateUserNotificationsSettings(UserNotificationsSettingsScope.Global, nss);
        const result: NormalizedResponseDTO<UserNotificationsSettings> = await api.updateUserNotificationsSettingsGlobal(updateUserNotificationsSettings);
        setUserNotificationsSettings(result.data);
        showToaster('Global configuration updated', ToasterIcons.INFO);
      } catch (e) {
        showToaster("We're sorry! Something happenend trying to execute the operation. Please try again", ToasterIcons.ERROR);
      }
    } else if (teamId) {
      try {
        const updateUserNotificationsSettings: UpdateUserNotificationsSettings = new UpdateUserNotificationsSettings(UserNotificationsSettingsScope.Channel, nss);
        const result: NormalizedResponseDTO<UserNotificationsSettings> = await api.updateUserNotificationsSettingsOrganizationChannel(organizationId, teamId, updateUserNotificationsSettings);
        setUserNotificationsSettings(result.data);
        showToaster('Channel configuration updated', ToasterIcons.INFO);
      } catch (e) {
        showToaster("We're sorry! Something happenend trying to execute the operation. Please try again", ToasterIcons.ERROR);
      }
    } else {
      try {
        const updateUserNotificationsSettings: UpdateUserNotificationsSettings = new UpdateUserNotificationsSettings(UserNotificationsSettingsScope.Organization, nss);
        const result: NormalizedResponseDTO<UserNotificationsSettings> = await api.updateUserNotificationsSettingsOrganization(organizationId, updateUserNotificationsSettings);
        setUserNotificationsSettings(result.data);
        showToaster('Organization configuration updated', ToasterIcons.INFO);
      } catch (e) {
        showToaster("We're sorry! Something happenend trying to execute the operation. Please try again", ToasterIcons.ERROR);
      }
    }
  };

  if (userIsLogged === null || userNotificationsSettings === null) {
    return null;
  }

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-1/6">
        <SettingsAside commonData={commonData} />
      </div>
      <div className="w-4/6">
        {userIsLogged ? (
          <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8 lg:py-12">
            <div className="space-y-12">
              <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
                {/* TABS */}
                <div className="hidden sm:block">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                      {tabs.map((tab: Tab) => (
                        <span
                          key={tab}
                          className={clsx(
                            tab === selectedTab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                            'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium cursor-pointer',
                          )}
                          aria-current={tab === selectedTab ? 'page' : undefined}
                          onClick={() => {
                            if (tab === Tab.GlobalConfiguration) {
                              setOrganizationId('');
                              setTeamId('');
                              refreshData();
                            }
                            setSelectedTab(tab);
                          }}
                        >
                          {tab}
                        </span>
                      ))}
                    </nav>
                  </div>
                </div>
                {/* NOTIFICATIONS SETTINGS */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">{selectedTab === Tab.GlobalConfiguration ? 'Global configuration' : 'Configuration per organization or channel'}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedTab === Tab.GlobalConfiguration
                        ? 'This configuration is applied generally for you user at Kyso. You can overwrite this configuration per organization and channel.'
                        : 'You can override the global configuration per organization and channel'}
                    </p>
                  </div>
                  {selectedTab === Tab.OrganizationAndChannel && (
                    <>
                      <div className="grid grid-cols-4 gap-4 py-4">
                        <label className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">Organization:</label>
                        <select
                          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          onChange={(e) => {
                            setTeamId('');
                            setOrganizationId(e.target.value);
                            refreshData();
                          }}
                        >
                          {organizationsResourcePermissions.map((orp: ResourcePermissions) => (
                            <option key={orp.id} value={orp.id}>
                              {orp.display_name}
                            </option>
                          ))}
                        </select>
                        <label className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">Channel:</label>
                        <select
                          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          onChange={(e) => {
                            setTeamId(e.target.value);
                            refreshData();
                          }}
                        >
                          <option value="">All</option>
                          {teamsResourcePermissions.map((trp: ResourcePermissions) => (
                            <option key={trp.id} value={trp.id}>
                              {trp.display_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  {teamId === '' && isGlobalInheritanceBroken && !isOrganizationInheritanceBroken && (
                    <DelayedContent>
                      <div className="rounded-md bg-blue-50 p-4 mb-4">
                        <div className="flex">
                          <div className="shrink-0">
                            <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3 flex-1 md:flex md:justify-between">
                            <p className="text-sm text-blue-700">
                              This organization has its own configuration and does not follows the Global Configuration anymore, so the changes done in the Global Configuration will not be propagated
                              to this organization.
                              <br />
                              <button
                                type="button"
                                className={clsx(
                                  'mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white  focus:outline-none focus:ring-2 focus:ring-offset-2',
                                  'k-bg-primary focus:ring-indigo-900',
                                )}
                                onClick={async () => {
                                  try {
                                    const api: Api = new Api(commonData.token);
                                    await api.deleteUserNotificationsSettingsOrganization(organizationId);

                                    showToaster('Restoration to global configuration done successfully', ToasterIcons.INFO);
                                    await refreshData();
                                  } catch (e) {
                                    showToaster('Something happened trying to restore to global configuration. Please try again', ToasterIcons.ERROR);
                                  }
                                }}
                              >
                                Restore to global settings
                              </button>
                            </p>
                          </div>
                        </div>
                      </div>
                    </DelayedContent>
                  )}
                  {isOrganizationInheritanceBroken && (
                    <DelayedContent>
                      <div className="rounded-md bg-blue-50 p-4 mb-4">
                        <div className="flex">
                          <div className="shrink-0">
                            <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3 flex-1 md:flex md:justify-between">
                            <p className="text-sm text-blue-700">
                              This channel has it's own configuration and does not follows the Organization Configuration anymore, then the changes done in the Organization Configuration will not be
                              propagated to this channel, except those which don't apply to the channel.
                              <br />
                              <button
                                type="button"
                                className={clsx(
                                  'mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white  focus:outline-none focus:ring-2 focus:ring-offset-2',
                                  'k-bg-primary focus:ring-indigo-900',
                                )}
                                onClick={async () => {
                                  try {
                                    const api: Api = new Api(commonData.token);
                                    await api.deleteUserNotificationsSettingsOrganizationChannel(organizationId, teamId);

                                    showToaster('Restoration to organization configuration done successfully', ToasterIcons.INFO);
                                    await refreshData();
                                  } catch (e) {
                                    showToaster('Something happened trying to restore to organization configuration. Please try again', ToasterIcons.ERROR);
                                  }
                                }}
                              >
                                Restore to organization settings
                              </button>
                            </p>
                          </div>
                        </div>
                      </div>
                    </DelayedContent>
                  )}
                  <div className="space-y-6 sm:space-y-5">
                    {options.map((option: { title: string; description: string; key: string; disabled_for_channel: boolean }, index: number) => {
                      const checked: boolean = Helper.isPropertyInObject(notificationsSettings, option.key) && (notificationsSettings as any)[option.key] === true;
                      const isDisabled: boolean = option.disabled_for_channel && teamId !== '';
                      return (
                        <div key={index} className="flex items-center sm:border-t sm:border-gray-200 pt-5">
                          <div className="sm:grid grow">
                            <h4 className="text-base font-semibold leading-6 text-gray-900">{option.title}</h4>
                            <p className=" text-sm text-gray-500">{option.description}</p>
                            {isDisabled && (
                              <p className="text-sm text-gray-500 font-bold mt-3">
                                This parameter acts at the organization level. Please, select &quot;all&quot; in &quot;channel&quot; to be able to edit it.
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <Switch
                              disabled={isDisabled}
                              checked={checked}
                              onChange={async () => {
                                const newNotificationsSettings: NotificationsSettings = new NotificationsSettings();
                                Object.assign(newNotificationsSettings, notificationsSettings);
                                (newNotificationsSettings as any)[option.key] = !checked;
                                if (option.disabled_for_channel && teamId !== '') {
                                  delete (newNotificationsSettings as any).new_member_organization;
                                  delete (newNotificationsSettings as any).removed_member_in_organization;
                                  delete (newNotificationsSettings as any).updated_role_in_organization;
                                  delete (newNotificationsSettings as any).organization_removed;
                                  delete (newNotificationsSettings as any).new_channel;
                                }
                                await onUpdateUserNotificationsSettings(newNotificationsSettings);
                                hideToaster();
                              }}
                              className={clsx(
                                'ml-5 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                              )}
                              style={{
                                backgroundColor: isDisabled ? (checked ? '#BCB8F5' : '#D1D1D1') : checked ? 'rgb(79 70 229)' : 'gray',
                                borderColor: isDisabled ? (checked ? '#BCB8F5' : '#D1D1D1') : checked ? '' : 'gray',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <span className="sr-only">Enable notifications</span>
                              <span
                                aria-hidden="true"
                                className={clsx(
                                  checked ? 'translate-x-5' : 'translate-x-0',
                                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                )}
                              />
                            </Switch>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <RegisteredUsersAlert />
        )}
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
