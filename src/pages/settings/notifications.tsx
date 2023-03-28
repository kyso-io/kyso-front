/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helper } from '@/helpers/Helper';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { Switch } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/solid';
import type { NormalizedResponseDTO, ResourcePermissions, UserNotificationsSettings } from '@kyso-io/kyso-model';
import { NotificationsSettings, UpdateUserNotificationsSettings, UserNotificationsSettingsScope } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { RegisteredUsersAlert } from '../../components/RegisteredUsersAlert';
import SettingsAside from '../../components/SettingsAside';
import ToasterNotification from '../../components/ToasterNotification';
import { checkJwt } from '../../helpers/check-jwt';
import type { CommonData } from '../../types/common-data';

interface Props {
  commonData: CommonData;
}

enum Tab {
  GlobalConfiguration = 'Global Configuration',
  OrganizationAndChannel = 'Organization and Channel',
}

const tabs: Tab[] = [Tab.GlobalConfiguration, Tab.OrganizationAndChannel];

const options: { title: string; description: string; key: string }[] = [
  // ORGANIZATION
  {
    title: 'New member in your organization',
    description: 'Receive a notification every time a new member is added to you organization',
    key: 'new_member_organization',
  },
  {
    title: 'Removed member from your organization',
    description: 'Receive a notification every time a member is removed from your organization',
    key: 'removed_member_in_organization',
  },
  {
    title: 'Changed role in your organization',
    description: 'Receive a notification every time your role in the organization changes',
    key: 'updated_role_in_organization',
  },
  {
    title: 'Organization removed',
    description: 'Receive a notification every time an organization is removed',
    key: 'organization_removed',
  },
  // CHANNEL
  {
    title: 'New channel',
    description: 'Receive a notification every time a new channel is created.',
    key: 'new_channel',
  },
  {
    title: 'New member in your channel',
    description: 'Receive a notification every time a new member is added to you channel',
    key: 'new_member_channel',
  },
  {
    title: 'Removed member from your channel',
    description: 'Receive a notification every time a member is removed from your channel',
    key: 'removed_member_in_channel',
  },
  {
    title: 'Changed role in your channel',
    description: 'Receive a notification every time your role in the channel changes',
    key: 'updated_role_in_channel',
  },
  {
    title: 'Channel removed',
    description: 'Receive a notification every time a channel is removed',
    key: 'channel_removed',
  },
  // REPORT
  {
    title: 'New report',
    description: 'Receive a notification every time a new report is created.',
    key: 'new_report',
  },
  {
    title: 'New report version',
    description: 'Receive a notification every time a new version of a report is uploaded.',
    key: 'new_report_version',
  },
  {
    title: 'Report removed',
    description: 'Receive a notification every time a report is removed',
    key: 'report_removed',
  },
  {
    title: 'New comment in report',
    description: 'Receive a notification every time a new comment is added to a report',
    key: 'new_comment_in_report',
  },
  {
    title: 'Replay comment in report',
    description: 'Receive a notification every time a comment is replied in a report',
    key: 'replay_comment_in_report',
  },
  {
    title: 'New mention in report',
    description: 'Receive a notification every time you are mentioned in a report',
    key: 'new_mention_in_report',
  },
  {
    title: 'Report comment removed',
    description: 'Receive a notification every time a comment is removed from a report',
    key: 'report_comment_removed',
  },
];

const areEquals = (a: NotificationsSettings, b: NotificationsSettings) => {
  return Object.keys(a).every((key: string) => {
    return (a as any)[key] === (b as any)[key];
  });
};

const Index = ({ commonData }: Props) => {
  const router = useRouter();
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.GlobalConfiguration);
  const [notificationsSettings, setNotificationsSettings] = useState<NotificationsSettings>(new NotificationsSettings());
  const [userNotificationsSettings, setUserNotificationsSettings] = useState<UserNotificationsSettings | null>(null);
  const [organizationId, setOrganizationId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const [show, setShow] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>('');
  const hasChanges: boolean = useMemo(() => {
    if (!userNotificationsSettings) {
      return false;
    }
    if (selectedTab === Tab.GlobalConfiguration) {
      return !areEquals(userNotificationsSettings.global_settings, notificationsSettings);
    }
    if (teamId) {
      /* eslint-disable no-prototype-builtins */
      if (!userNotificationsSettings.channels_settings.hasOwnProperty(organizationId)) {
        return true;
      }
      /* eslint-disable no-prototype-builtins */
      if (!userNotificationsSettings.channels_settings[organizationId]!.hasOwnProperty(teamId)) {
        return true;
      }
      return !areEquals(userNotificationsSettings.channels_settings[organizationId]![teamId]!, notificationsSettings);
    }
    /* eslint-disable no-prototype-builtins */
    if (!userNotificationsSettings.organization_settings.hasOwnProperty(organizationId)) {
      return true;
    }
    return !areEquals(userNotificationsSettings.organization_settings[organizationId]!, notificationsSettings);
  }, [notificationsSettings, organizationId, teamId]);
  const teamsResourcePermissions: ResourcePermissions[] = useMemo(() => {
    if (!organizationId) {
      return [];
    }
    if (!commonData.permissions) {
      return [];
    }
    return commonData.permissions.teams!.filter((trp: ResourcePermissions) => {
      return trp.organization_id === organizationId;
    });
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

  useEffect(() => {
    if (!commonData.permissions) {
      return;
    }
    if (commonData.permissions.organizations!.length > 0) {
      setOrganizationId(commonData.permissions.organizations![0]!.id);
    }
  }, [commonData.permissions]);

  useEffect(() => {
    if (!userNotificationsSettings) {
      return;
    }
    if (selectedTab === Tab.GlobalConfiguration) {
      setNotificationsSettings(userNotificationsSettings.global_settings);
    } else if (teamId) {
      /* eslint-disable no-prototype-builtins */
      if (!userNotificationsSettings.channels_settings.hasOwnProperty(organizationId)) {
        setNotificationsSettings(new NotificationsSettings());
        /* eslint-disable no-lonely-if */
      } else {
        /* eslint-disable no-prototype-builtins */
        if (!userNotificationsSettings.channels_settings[organizationId]!.hasOwnProperty(teamId)) {
          setNotificationsSettings(new NotificationsSettings());
        } else {
          setNotificationsSettings(userNotificationsSettings.channels_settings[organizationId]![teamId]!);
        }
      }
    } else {
      /* eslint-disable no-prototype-builtins */
      if (!userNotificationsSettings.organization_settings.hasOwnProperty(organizationId)) {
        setNotificationsSettings(new NotificationsSettings());
      } else {
        setNotificationsSettings(userNotificationsSettings.organization_settings[organizationId]!);
      }
    }
  }, [userNotificationsSettings, selectedTab, organizationId, teamId]);

  const onUpdateUserNotificationsSettings = async () => {
    const api: Api = new Api(commonData.token);
    if (selectedTab === Tab.GlobalConfiguration) {
      try {
        const updateUserNotificationsSettings: UpdateUserNotificationsSettings = new UpdateUserNotificationsSettings(UserNotificationsSettingsScope.Global, notificationsSettings);
        const result: NormalizedResponseDTO<UserNotificationsSettings> = await api.updateUserNotificationsSettingsGlobal(updateUserNotificationsSettings);
        setUserNotificationsSettings(result.data);
        setAlertText('Global configuration updated');
        setShow(true);
      } catch (e) {}
    } else {
      if (teamId) {
        try {
          const updateUserNotificationsSettings: UpdateUserNotificationsSettings = new UpdateUserNotificationsSettings(UserNotificationsSettingsScope.Channel, notificationsSettings);
          const result: NormalizedResponseDTO<UserNotificationsSettings> = await api.updateUserNotificationsSettingsOrganizationChannel(organizationId, teamId, updateUserNotificationsSettings);
          setUserNotificationsSettings(result.data);
          setAlertText('Channel configuration updated');
          setShow(true);
        } catch (e) {}
      } else {
        try {
          const updateUserNotificationsSettings: UpdateUserNotificationsSettings = new UpdateUserNotificationsSettings(UserNotificationsSettingsScope.Organization, notificationsSettings);
          const result: NormalizedResponseDTO<UserNotificationsSettings> = await api.updateUserNotificationsSettingsOrganization(organizationId, updateUserNotificationsSettings);
          setUserNotificationsSettings(result.data);
          setAlertText('Organization configuration updated');
          setShow(true);
        } catch (e) {}
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
                          onClick={() => setSelectedTab(tab)}
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
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">{selectedTab === Tab.GlobalConfiguration ? 'Global configuration' : 'Configuratin per organization or channel'}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedTab === Tab.GlobalConfiguration
                        ? 'This configuration is applied generally for you user at Kyso. You can overwrite this configuration per organization and channel.'
                        : 'You can override the global configuration per organization and channel'}
                    </p>
                  </div>
                  {selectedTab === Tab.OrganizationAndChannel && (
                    <div className="grid grid-cols-4 gap-4 pt-4 pb-6">
                      <label className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">Organization:</label>
                      <select
                        className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        onChange={(e) => {
                          setOrganizationId(e.target.value);
                        }}
                      >
                        {commonData.permissions!.organizations!.map((orp: ResourcePermissions) => (
                          <option key={orp.id} value={orp.id}>
                            {orp.name}
                          </option>
                        ))}
                      </select>
                      <label className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">Channel:</label>
                      <select
                        className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        onChange={(e) => {
                          setTeamId(e.target.value);
                        }}
                      >
                        <option value="">All</option>
                        {teamsResourcePermissions.map((trp: ResourcePermissions) => (
                          <option key={trp.id} value={trp.id}>
                            {trp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-6 sm:space-y-5">
                    {options.map((option: { title: string; description: string; key: string }, index: number) => {
                      const checked: boolean = (notificationsSettings as any)[option.key];
                      return (
                        <div key={index} className="flex items-center sm:border-t sm:border-gray-200 pt-5">
                          <div className="sm:grid grow">
                            <h4 className="text-base font-semibold leading-6 text-gray-900">{option.title}</h4>
                            <p className=" text-sm text-gray-500">{option.description}</p>
                          </div>
                          <Switch
                            checked={checked}
                            onChange={() => {
                              const newNotificationsSettings: NotificationsSettings = new NotificationsSettings();
                              Object.assign(newNotificationsSettings, notificationsSettings);
                              (newNotificationsSettings as any)[option.key] = !checked;
                              setNotificationsSettings(newNotificationsSettings);
                              setShow(false);
                            }}
                            className={`${checked ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
                          >
                            <span className="sr-only">Enable notifications</span>
                            <span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 rounded-full bg-white transition`} />
                          </Switch>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-5 pt-5 sm:border-t sm:border-gray-200">
                    <div className="flex justify-end gap-x-3">
                      <button
                        type="button"
                        onClick={() => router.reload()}
                        className="rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!hasChanges}
                        onClick={onUpdateUserNotificationsSettings}
                        className={clsx(
                          !hasChanges && 'opacity-50 cursor-not-allowed',
                          'inline-flex justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                        )}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <RegisteredUsersAlert />
        )}
      </div>
      <ToasterNotification show={show} setShow={setShow} icon={<CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />} message={alertText} />
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;