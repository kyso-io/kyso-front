/* eslint-disable @typescript-eslint/no-explicit-any */
import { PureSpinner } from '@/components/PureSpinner';
import Head from 'next/head';
import classNames from '@/helpers/class-names';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import MainLayout from '@/layouts/MainLayout';
import type { CommonData } from '@/types/common-data';
import { ArrowRightIcon } from '@heroicons/react/solid';
// import type { NormalizedResponseDTO, Organization } from '@kyso-io/kyso-model';
// import { Api } from '@kyso-io/kyso-store';
// import { useRouter } from 'next/router';
import React, { useState } from 'react';

interface Props {
  commonData: CommonData;
}

const MetadataImport = ({ commonData }: Props) => {
  // const router = useRouter();
  useRedirectIfNoJWT();
  console.log('commonData', commonData);

  const [error, setError] = useState<string | null>(null);
  const [isBusy, setBusy] = useState(false);

  const [s3, sets3] = useState<string>('');

  const importBucket = async (ev: any) => {
    ev.preventDefault();
    setError('');
    if (!s3 || s3.length === 0) {
      setError('Error.');
      return;
    }
    setBusy(true);
    try {
      // const api: Api = new Api(commonData.token);
      // const result: NormalizedResponseDTO<Organization> = await api.importBucket({
      //   display_name: s3,
      //   bio,
      // });
      // router.push(`/${report.name}`);
    } catch (er: any) {
      setError(er.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full min-h-full flex items-center ">
      <Head>
        <title> Kyso | S3 import </title>
      </Head>
      <div className="grow w-full rounded">
        <div className="flex flex-row space-x-8 p-2 pt-12 pb-10">
          <div className="w-2/12">{/* <ChannelList basePath={router.basePath} commonData={commonData} /> */}</div>
          <div className="w-8/12 flex flex-col space-y-8">
            <form className="space-y-8 divide-y divide-gray-200" onSubmit={importBucket}>
              {/* S3 button */}
              <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
                <div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-blue-gray-900">Create a new S3 bucket import</h1>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Please insert all the information need it </p>
                  </div>

                  <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                      <div className="sm:col-span-3">
                        <h2 className="text-xl font-medium text-blue-gray-900">S3 Data</h2>
                        <p className="mt-1 text-sm text-blue-gray-500">This information will be displayed </p>
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        AWS KEY
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="s3"
                            id="s3"
                            value={s3}
                            autoComplete="s3"
                            onChange={(e) => {
                              setError('');
                              sets3(e.target.value);
                            }}
                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        AWS SECRET KEY
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                          <input
                            type="password"
                            name="s3"
                            id="s3"
                            value={s3}
                            autoComplete="s3"
                            onChange={(e) => {
                              setError('');
                              sets3(e.target.value);
                            }}
                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        S3 REGION
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="s3"
                            id="s3"
                            value={s3}
                            autoComplete="s3"
                            onChange={(e) => {
                              setError('');
                              sets3(e.target.value);
                            }}
                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        S3BUCKET
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="s3"
                            id="s3"
                            value={s3}
                            autoComplete="s3"
                            onChange={(e) => {
                              setError('');
                              sets3(e.target.value);
                            }}
                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Import data */}
                <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                    <div className="sm:col-span-3">
                      <h2 className="text-xl font-medium text-blue-gray-900">Import Data</h2>
                      <p className="mt-1 text-sm text-blue-gray-500">This information will be displayed </p>
                    </div>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                      S3PATH
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <div className="max-w-lg flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="s3"
                          id="s3"
                          value={s3}
                          autoComplete="s3"
                          onChange={(e) => {
                            setError('');
                            sets3(e.target.value);
                          }}
                          className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                      Default Author
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <div className="max-w-lg flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="s3"
                          id="s3"
                          value={s3}
                          autoComplete="s3"
                          onChange={(e) => {
                            setError('');
                            sets3(e.target.value);
                          }}
                          className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                      Default Organization
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <div className="max-w-lg flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="s3"
                          id="s3"
                          value={s3}
                          autoComplete="s3"
                          onChange={(e) => {
                            setError('');
                            sets3(e.target.value);
                          }}
                          className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                      Default Channel
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <div className="max-w-lg flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="s3"
                          id="s3"
                          value={s3}
                          autoComplete="s3"
                          onChange={(e) => {
                            setError('');
                            sets3(e.target.value);
                          }}
                          className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                      Use default data
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <div className="max-w-lg flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="s3"
                          id="s3"
                          value={s3}
                          autoComplete="s3"
                          onChange={(e) => {
                            setError('');
                            sets3(e.target.value);
                          }}
                          className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Import button */}
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <div className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"></div>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className="max-w-lg flex w-full justify-between items-center">
                    <div className="text-red-500 text-sm">{error}</div>
                    <button
                      type="submit"
                      className={classNames(
                        error ? 'opacity-75 cursor-not-allowed' : 'hover:bg-kyso-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900',
                        'ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-kyso-600 ',
                      )}
                    >
                      {!isBusy && (
                        <React.Fragment>
                          Import S3 bucket <ArrowRightIcon className=" ml-1 w-5 h-5" />
                        </React.Fragment>
                      )}
                      {isBusy && (
                        <React.Fragment>
                          <PureSpinner size={5} /> Importing
                        </React.Fragment>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

MetadataImport.layout = MainLayout;

export default MetadataImport;
