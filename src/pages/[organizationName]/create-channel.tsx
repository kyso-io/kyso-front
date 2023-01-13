/* eslint-disable @typescript-eslint/no-explicit-any */
import ChannelList from '@/components/ChannelList';
import { PureSpinner } from '@/components/PureSpinner';
import classNames from '@/helpers/class-names';
import { Helper } from '@/helpers/Helper';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import { ArrowRightIcon, ExclamationCircleIcon, LockClosedIcon, LockOpenIcon, ShieldCheckIcon } from '@heroicons/react/solid';
import type { KysoSetting, NormalizedResponseDTO, UserDTO } from '@kyso-io/kyso-model';
import { AllowDownload, KysoSettingsEnum, Team, TeamPermissionsEnum, TeamVisibilityEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import CaptchaModal from '../../components/CaptchaModal';
import { RegisteredUsersAlert } from '../../components/RegisteredUsersAlert';
import { checkJwt } from '../../helpers/check-jwt';
import { HelperPermissions } from '../../helpers/check-permissions';

interface Props {
  commonData: CommonData;
  setUser: (user: UserDTO) => void;
}

const Index = ({ commonData, setUser }: Props) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setBusy] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isTeamAvailable, setTeamAvailable] = useState(true);
  const [formPermissions, setFormPermissions] = useState<TeamVisibilityEnum>(TeamVisibilityEnum.PRIVATE);
  const [allowDownload, setAllowDownload] = useState<AllowDownload>(AllowDownload.ALL);
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);
  const hasPermissionCreateChannel: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, TeamPermissionsEnum.CREATE), [commonData]);
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);
  const [waitForLogging, setWaitForLogging] = useState<boolean>(false);
  const [showCaptchaModal, setShowCaptchaModal] = useState<boolean>(false);
  const [enabledPublicChannels, setEnabledPublicChannels] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWaitForLogging(true);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const result: boolean = checkJwt();
    setUserIsLogged(result);
    const getData = async () => {
      try {
        const api: Api = new Api();
        const resultKysoSetting: NormalizedResponseDTO<KysoSetting[]> = await api.getPublicSettings();
        const indexCaptcha: number = resultKysoSetting.data.findIndex((item: KysoSetting) => item.key === KysoSettingsEnum.HCAPTCHA_ENABLED);
        if (indexCaptcha !== -1) {
          setCaptchaIsEnabled(resultKysoSetting.data[indexCaptcha]!.value === 'true');
        }
        const indexPublicChannels: number = resultKysoSetting.data.findIndex((item: KysoSetting) => item.key === KysoSettingsEnum.ALLOW_PUBLIC_CHANNELS);
        if (indexPublicChannels !== -1) {
          setEnabledPublicChannels(resultKysoSetting.data[indexPublicChannels]!.value === 'true');
        }
      } catch (errorHttp: any) {
        Helper.logError(errorHttp.response.data, errorHttp);
      }
    };
    getData();
  }, []);

  const checkName = async (name: string) => {
    setFormName(name);
    setError('');
    try {
      const api: Api = new Api(commonData.token);
      api.setOrganizationSlug(commonData.organization!.sluglified_name);
      const teamAvailable: NormalizedResponseDTO<boolean> = await api.teamNameIsAvailable(commonData.organization?.id!, name);

      if (!teamAvailable.data) {
        setError('Name in use.');
        setBusy(false);
        setTeamAvailable(false);
        return;
      }

      setTeamAvailable(true);
    } catch (er: any) {
      setError(er.message);
      setBusy(false);
    }
  };

  const createChannel = async (ev: any) => {
    ev.preventDefault();

    setError('');
    if (!formName || formName.length === 0) {
      setError('Please specify a channel name.');
      return;
    }

    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowCaptchaModal(true);
      return;
    }

    setBusy(true);
    try {
      const api: Api = new Api(commonData.token);
      api.setOrganizationSlug(commonData.organization!.sluglified_name);
      if (!isTeamAvailable) {
        setError('Name in use.');
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
      setError(er.response.data.message);
    } finally {
      setBusy(false);
    }
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
      <div className="w-2/12">
        <ChannelList basePath={router.basePath} commonData={commonData} />
      </div>
      <div className="w-8/12 flex flex-col space-y-8">
        {userIsLogged ? (
          hasPermissionCreateChannel ? (
            <form className="space-y-8 divide-y divide-gray-200" onSubmit={createChannel}>
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
                            onChange={(e) => checkName(e.target.value)}
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
                                    <strong>Organization only:</strong> All members of the <span className="font-medium">{commonData.organization?.display_name}</span> organization can access this
                                    channel.
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
                                      <strong>Public:</strong>
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
                    <div className="text-red-500 text-sm">{error}</div>
                    <button
                      type="submit"
                      className={classNames(
                        error ? 'opacity-75 cursor-not-allowed' : 'k-bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900',
                        'ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white k-bg-primary ',
                      )}
                    >
                      {!isBusy && (
                        <>
                          Create channel <ArrowRightIcon className=" ml-1 w-5 h-5" />
                        </>
                      )}
                      {isBusy && (
                        <>
                          <PureSpinner size={5} /> Creating channel
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
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
      {commonData.user && <CaptchaModal user={commonData.user!} open={showCaptchaModal} onClose={onCloseCaptchaModal} />}
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
