/* eslint-disable @typescript-eslint/no-explicit-any */
import ChannelList from '@/components/ChannelList';
import { PureSpinner } from '@/components/PureSpinner';
import classNames from '@/helpers/class-names';
import { Helper } from '@/helpers/Helper';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { ArrowRightIcon, ExclamationCircleIcon, LockClosedIcon, LockOpenIcon, ShieldCheckIcon } from '@heroicons/react/solid';
import type { KysoSetting, NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { AllowDownload, KysoSettingsEnum, Team, TeamPermissionsEnum, TeamVisibilityEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { RegisteredUsersAlert } from '@/components/RegisteredUsersAlert';
import { checkJwt } from '@/helpers/check-jwt';
import { HelperPermissions } from '@/helpers/check-permissions';
import { ToasterIcons } from '@/enums/toaster-icons';

const Index = ({ commonData, showToaster, hideToaster, isCurrentUserVerified, isCurrentUserSolvedCaptcha, isUserLogged }: IKysoApplicationLayoutProps) => {
  const router = useRouter();
  const [isBusy, setBusy] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isTeamAvailable, setTeamAvailable] = useState(true);
  const [formPermissions, setFormPermissions] = useState<TeamVisibilityEnum>(TeamVisibilityEnum.PRIVATE);
  const [allowDownload, setAllowDownload] = useState<AllowDownload>(AllowDownload.INHERITED);
  const hasPermissionCreateChannel: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, TeamPermissionsEnum.CREATE), [commonData]);
  const [waitForLogging, setWaitForLogging] = useState<boolean>(false);
  const [enabledPublicChannels, setEnabledPublicChannels] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWaitForLogging(true);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const api: Api = new Api();
        const resultKysoSetting: NormalizedResponseDTO<KysoSetting[]> = await api.getPublicSettings();
        const indexPublicChannels: number = resultKysoSetting.data.findIndex((item: KysoSetting) => item.key === KysoSettingsEnum.ALLOW_PUBLIC_CHANNELS);

        if (indexPublicChannels !== -1) {
          setEnabledPublicChannels(resultKysoSetting.data[indexPublicChannels]!.value === 'true');
        }
      } catch (errorHttp: any) {
        Helper.logError(errorHttp?.response?.data, errorHttp);
      }
    };
    getData();
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
    if (!formName) {
      return;
    }
    checkName(formName);
  }, [formName]);

  const checkName = async (name: string) => {
    try {
      const api: Api = new Api(commonData.token);
      api.setOrganizationSlug(commonData.organization!.sluglified_name);
      const teamAvailable: NormalizedResponseDTO<boolean> = await api.teamNameIsAvailable(commonData.organization?.id!, name);
      if (!teamAvailable.data) {
        showToaster('Name in use.', ToasterIcons.INFO);
        setBusy(false);
        setTeamAvailable(false);
        return;
      }

      setTeamAvailable(true);
    } catch (er: any) {
      showToaster(er.message, ToasterIcons.ERROR);
      setBusy(false);
    }
  };

  const createChannel = async (ev: any) => {
    if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
      return;
    }

    ev.preventDefault();

    if (!formName || formName.length === 0) {
      showToaster('Please specify a channel name.', ToasterIcons.INFO);
      return;
    }

    hideToaster();
    setBusy(true);

    try {
      const api: Api = new Api(commonData.token);
      api.setOrganizationSlug(commonData.organization!.sluglified_name);
      if (!isTeamAvailable) {
        showToaster('Name in use.', ToasterIcons.INFO);
        setBusy(false);
        return;
      }

      const result: NormalizedResponseDTO<Team> = await api.createTeam(
        new Team(formName, '', formDescription, '', '', [], commonData.organization!.id!, formPermissions, commonData.user!.id, AllowDownload.INHERITED),
      );
      const team: Team = result.data;

      if (!team) {
        setBusy(false);
        return;
      }
      window.location.href = `/${commonData.organization!.sluglified_name}/${team.sluglified_name}`;
    } catch (er: any) {
      showToaster(er.response.data.message, ToasterIcons.ERROR);
    } finally {
      setBusy(false);
    }
  };

  if (isUserLogged === null) {
    return null;
  }

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-2/12">
        <ChannelList basePath={router.basePath} commonData={commonData} />
      </div>
      <div className="w-8/12 flex flex-col space-y-8">
        {isUserLogged ? (
          hasPermissionCreateChannel ? (
            <React.Fragment>
              <form className="space-y-8 divide-y divide-gray-200">
                <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
                  <div>
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Create a new channel</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">{/* This will be your  */}</p>
                    </div>
                    <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                          Name:
                        </label>
                        <div className="mt-1 sm:mt-0 sm:col-span-2">
                          <div className="max-w-lg flex rounded-md shadow-sm">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              autoComplete="name"
                              onChange={(e) => setFormName(e.target.value)}
                              className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-gray-200 sm:pt-5">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                          Description:
                        </label>
                        <div className="mt-1 sm:mt-0 sm:col-span-2">
                          <div className="max-w-lg flex rounded-md shadow-sm">
                            <input
                              type="text"
                              name="description"
                              id="description"
                              autoComplete="description"
                              onChange={(e) => setFormDescription(e.target.value)}
                              className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6 sm:space-y-5 divide-y divide-gray-200">
                      <div className="pt-6 sm:pt-5">
                        <div role="group" aria-labelledby="label-notifications">
                          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-baseline">
                            <div>
                              <div className="text-base font-medium text-gray-900 sm:text-sm sm:text-gray-700" id="label-notifications">
                                Permissions:
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <div className="max-w-lg">
                                <div className="mt-4 space-y-6">
                                  <div className="flex items-start">
                                    <input
                                      id="private"
                                      name="permissions"
                                      type="radio"
                                      checked={formPermissions === TeamVisibilityEnum.PRIVATE}
                                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 mt-1"
                                      onChange={() => {
                                        setFormPermissions(TeamVisibilityEnum.PRIVATE);
                                      }}
                                    />
                                    <LockClosedIcon className="w-5 h-5 ml-3" />
                                    <label htmlFor="private" className="ml-1 block text-sm  text-gray-700">
                                      <strong>Private:</strong> Only invited members of this channel have access to this channels content.
                                      <p className="text-gray-500 text-xs">You can invite members on the next page.</p>
                                    </label>
                                  </div>

                                  <div className="flex items-start">
                                    <input
                                      id="organization-only"
                                      name="permissions"
                                      type="radio"
                                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 mt-1"
                                      onChange={() => {
                                        setFormPermissions(TeamVisibilityEnum.PROTECTED);
                                      }}
                                    />
                                    <ShieldCheckIcon className="w-6 h-5 ml-3" />
                                    <label htmlFor="organization-only" className="ml-1 block text-sm  text-gray-700">
                                      <strong>Protected:</strong> Organization only. All members of the <span className="font-medium">{commonData.organization?.display_name}</span> organization can
                                      access this channel.
                                    </label>
                                  </div>
                                  {enabledPublicChannels && (
                                    <div className="flex items-start">
                                      <input
                                        id="public"
                                        name="permissions"
                                        type="radio"
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 mt-1"
                                        onChange={() => {
                                          setFormPermissions(TeamVisibilityEnum.PUBLIC);
                                        }}
                                      />
                                      <LockOpenIcon className="w-6 h-5 ml-3" />
                                      <label htmlFor="public" className="ml-1 block text-sm  text-gray-700">
                                        <strong>Public: </strong>
                                        Everyone can see this channel. Reports in this channel can be viewed by anyone with the reports url.
                                      </label>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start  sm:border-gray-200 sm:pt-5">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        Download reports:
                      </label>
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
                          <option value={AllowDownload.INHERITED}>Inherited</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <div className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"></div>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex w-full justify-between items-center">
                      <div className="text-red-500 text-sm"></div>
                      <button
                        type="button"
                        onClick={createChannel}
                        className={classNames(
                          'k-bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900',
                          'ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white k-bg-primary ',
                        )}
                      >
                        {!isBusy && (
                          <React.Fragment>
                            Create channel <ArrowRightIcon className=" ml-1 w-5 h-5" />
                          </React.Fragment>
                        )}
                        {isBusy && (
                          <React.Fragment>
                            <PureSpinner size={5} /> Creating channel
                          </React.Fragment>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </React.Fragment>
          ) : (
            waitForLogging && (
              <div className="rounded-md bg-yellow-50 p-4 mt-8">
                <div className="flex">
                  <div className="shrink-0">
                    <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Forbidden resource</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        You don&apos;t have permissions to create channels. Come back to
                        <a href={`/${commonData.organization?.sluglified_name}`} className="font-bold">
                          {' '}
                          {commonData.organization?.display_name}{' '}
                        </a>
                        page or select a channel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          )
        ) : (
          waitForLogging && <RegisteredUsersAlert />
        )}
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
