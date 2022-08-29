/* eslint-disable @typescript-eslint/no-explicit-any */
import ChannelList from '@/components/ChannelList';
import { PureSpinner } from '@/components/PureSpinner';
import checkPermissions from '@/helpers/check-permissions';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import { ArrowRightIcon } from '@heroicons/react/solid';
import type { NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { TeamPermissionsEnum, TeamVisibilityEnum, Team } from '@kyso-io/kyso-model';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Api } from '@kyso-io/kyso-store';
import classNames from '@/helpers/class-names';

interface Props {
  commonData: CommonData;
}

const Index = ({ commonData }: Props) => {
  const router = useRouter();
  useRedirectIfNoJWT();

  const [error, setError] = useState<string | null>(null);
  const [isBusy, setBusy] = useState(false);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isTeamAvailable, setTeamAvailable] = useState(true);
  const [formPermissions, setFormPermissions] = useState<TeamVisibilityEnum>(TeamVisibilityEnum.PRIVATE);

  const hasPermissionCreateChannel = useMemo(() => checkPermissions(commonData, TeamPermissionsEnum.CREATE), [commonData]);

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

    setBusy(true);
    try {
      const api: Api = new Api(commonData.token);
      api.setOrganizationSlug(commonData.organization!.sluglified_name);
      if (!isTeamAvailable) {
        setError('Name in use.');
        setBusy(false);
        return;
      }

      const result: NormalizedResponseDTO<Team> = await api.createTeam(new Team(formName, '', formDescription, '', '', [], commonData.organization!.id!, formPermissions, commonData.user!.id));
      const team: Team = result.data;

      if (!team) {
        setBusy(false);
        return;
      }
      router.push(`/${commonData.organization?.sluglified_name}/${team.sluglified_name}`);
    } catch (er: any) {
      setError(er.message);
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-2/12">
        <ChannelList basePath={router.basePath} commonData={commonData} />
      </div>
      <div className="w-8/12 flex flex-col space-y-8">
        {hasPermissionCreateChannel && (
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
                      Name
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
                      Description
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
                            Permissions
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
                                <label htmlFor="private" className="ml-3 block text-sm  text-gray-700">
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
                                <label htmlFor="organization-only" className="ml-3 block text-sm  text-gray-700">
                                  <strong>Organization only:</strong> all members of the <span className="font-medium">{commonData.organization?.display_name}</span> organization can access this
                                  channel.
                                </label>
                              </div>

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
                                <label htmlFor="public" className="ml-3 block text-sm  text-gray-700">
                                  <strong>Public:</strong> Everyone can see this channel. Reports in this channel can be viewed by anyone with the reports url..
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                      error ? 'opacity-75 cursor-not-allowed' : 'hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                      'ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 ',
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
        )}
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
