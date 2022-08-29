/* eslint-disable @typescript-eslint/no-explicit-any */
import ChannelList from '@/components/ChannelList';
import { PureSpinner } from '@/components/PureSpinner';
import classNames from '@/helpers/class-names';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import { ArrowRightIcon } from '@heroicons/react/solid';
import type { NormalizedResponseDTO, Organization } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

interface Props {
  commonData: CommonData;
}

const Index = ({ commonData }: Props) => {
  const router = useRouter();
  useRedirectIfNoJWT();

  const [error, setError] = useState<string | null>(null);
  const [isBusy, setBusy] = useState(false);

  const [displayName, setDisplayName] = useState<string>('');
  const [bio, setBio] = useState<string>('');

  const createOrganization = async (ev: any) => {
    ev.preventDefault();
    setError('');
    if (!displayName || displayName.length === 0) {
      setError('Please specify a organization name.');
      return;
    }
    setBusy(true);
    try {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<Organization> = await api.createOrganization({
        display_name: displayName,
        bio,
      });
      const organization: Organization = result.data;
      router.push(`/${organization.sluglified_name}`);
    } catch (er: any) {
      setError(er.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-2/12">
        <ChannelList basePath={router.basePath} commonData={commonData} />
      </div>
      <div className="w-8/12 flex flex-col space-y-8">
        <form className="space-y-8 divide-y divide-gray-200" onSubmit={createOrganization}>
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            <div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Create a new organization</h3>
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
                        name="displayName"
                        id="displayName"
                        value={displayName}
                        autoComplete="displayName"
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-gray-200 sm:pt-5">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                    Bio
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex rounded-md shadow-sm">
                      <textarea
                        value={bio}
                        name="bio"
                        id="bio"
                        autoComplete="bio"
                        rows={5}
                        onChange={(e) => setBio(e.target.value)}
                        className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                      ></textarea>
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
                    <React.Fragment>
                      Create organization <ArrowRightIcon className=" ml-1 w-5 h-5" />
                    </React.Fragment>
                  )}
                  {isBusy && (
                    <React.Fragment>
                      <PureSpinner size={5} /> Creating organization
                    </React.Fragment>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;