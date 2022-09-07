/* eslint-disable @typescript-eslint/no-explicit-any */
import { PureSpinner } from '@/components/PureSpinner';
import Head from 'next/head';
import classNames from '@/helpers/class-names';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import MainLayout from '@/layouts/MainLayout';
import type { CommonData } from '@/types/common-data';
import { ArrowRightIcon } from '@heroicons/react/solid';
import { Switch } from '@headlessui/react';
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

  const [awsKey, setAWSKey] = useState<string>('');
  const [awsSecretKey, setAwsSecretKey] = useState<string>('');
  const [s3Region, setS3Region] = useState<string>('');
  const [s3Bucket, setS3Bucket] = useState<string>('');
  const [s3Path, setS3Path] = useState<string>('');

  const [author, setAuthor] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [channel, setChannel] = useState<string>('');
  const [defaulValue, setDefaulValue] = useState<boolean>(false);

  const importBucket = async (ev: any) => {
    ev.preventDefault();
    setError('');
    if (!awsKey || awsKey.length === 0) {
      setError('Please specify a AWS Key.');
      return;
    }
    if (!awsSecretKey || awsSecretKey.length === 0) {
      setError('Please specify a AWS Secret Key.');
      return;
    }
    if (!s3Region || s3Region.length === 0) {
      setError('Please specify a S3 region.');
      return;
    }
    if (!s3Bucket || s3Bucket.length === 0) {
      setError('Please specify a S3 Bucket.');
      return;
    }
    if (!s3Path || s3Path.length === 0) {
      setError('Please specify a S3 Path.');
      return;
    }

    // DEFAULT VALUE
    if ((!author || author.length === 0) && !defaulValue) {
      setError('Please specify an author.');
      return;
    }
    if ((!organization || organization.length === 0) && !defaulValue) {
      setError('Please specify an Organization.');
      return;
    }
    if ((!channel || channel.length === 0) && !defaulValue) {
      setError('Please specify an Channel.');
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
                            name="awsKey"
                            id="awsKey"
                            value={awsKey}
                            autoComplete="awsKey"
                            onChange={(e) => {
                              setError('');
                              setAWSKey(e.target.value);
                            }}
                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        AWS Secret Key
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                          <input
                            type="password"
                            name="awsSecretKey"
                            id="awsSecretKey"
                            value={awsSecretKey}
                            autoComplete="awsSecretKey"
                            onChange={(e) => {
                              setError('');
                              setAwsSecretKey(e.target.value);
                            }}
                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        S3 Region
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="s3Bucket"
                            id="s3Bucket"
                            value={s3Bucket}
                            autoComplete="s3Bucket"
                            onChange={(e) => {
                              setError('');
                              setS3Region(e.target.value);
                            }}
                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        S3 Bucket
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="s3Bucket"
                            id="s3Bucket"
                            value={s3Bucket}
                            autoComplete="s3Bucket"
                            onChange={(e) => {
                              setError('');
                              setS3Bucket(e.target.value);
                            }}
                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        S3 Path
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="s3Path"
                            id="s3Path"
                            value={s3Path}
                            autoComplete="s3Path"
                            onChange={(e) => {
                              setError('');
                              setS3Path(e.target.value);
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
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                    <div className="sm:col-span-3">
                      <h2 className="text-xl font-medium text-blue-gray-900">Import Data</h2>
                      <p className="mt-1 text-sm text-blue-gray-500">This information will be displayed </p>
                    </div>
                  </div>

                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                    <label htmlFor="name" className={classNames(defaulValue ? 'text-gray-400' : 'text-gray-700', 'block text-sm font-medium sm:mt-px sm:pt-2')}>
                      Organization
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <div className="max-w-lg flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="organization"
                          id="organization"
                          value={organization}
                          autoComplete="organization"
                          onChange={(e) => {
                            if (defaulValue) {
                              return;
                            }
                            setError('');
                            setOrganization(e.target.value);
                          }}
                          className={classNames(
                            defaulValue ? ' bg-gray-50 border-gray-500 text-gray-400 focus:ring-0 focus:border-gray-600 caret-gray-50' : ' focus:ring-indigo-500 focus:border-indigo-500',
                            'flex-1 block w-full min-w-0 rounded-md sm:text-sm border-gray-300',
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                    <label htmlFor="name" className={classNames(defaulValue ? 'text-gray-400' : 'text-gray-700', 'block text-sm font-medium sm:mt-px sm:pt-2')}>
                      Channel
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <div className="max-w-lg flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="channel"
                          id="channel"
                          value={channel}
                          autoComplete="channel"
                          onChange={(e) => {
                            if (defaulValue) {
                              return;
                            }
                            setError('');
                            setChannel(e.target.value);
                          }}
                          className={classNames(
                            defaulValue ? ' bg-gray-50 border-gray-500 text-gray-400 focus:ring-0 focus:border-gray-600 caret-gray-50' : ' focus:ring-indigo-500 focus:border-indigo-500',
                            'flex-1 block w-full min-w-0 rounded-md sm:text-sm border-gray-300',
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                    <label htmlFor="name" className={classNames(defaulValue ? 'text-gray-400' : 'text-gray-700', 'block text-sm font-medium sm:mt-px sm:pt-2')}>
                      Author
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <div className="max-w-lg flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="author"
                          id="author"
                          value={author}
                          autoComplete="author"
                          onChange={(e) => {
                            if (defaulValue) {
                              return;
                            }
                            setError('');
                            setAuthor(e.target.value);
                          }}
                          className={classNames(
                            defaulValue ? ' bg-gray-50 border-gray-500 text-gray-400 focus:ring-0 focus:border-gray-600 caret-gray-50' : ' focus:ring-indigo-500 focus:border-indigo-500',
                            'flex-1 block w-full min-w-0 rounded-md sm:text-sm border-gray-300',
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <Switch.Group as="div" className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5">
                    <Switch.Label as="dt" className={classNames(defaulValue ? 'text-gray-700' : 'text-gray-500', 'block text-sm font-medium sm:mt-px sm:pt-2')} passive>
                      Automatic timezone
                    </Switch.Label>
                    <dd className="mt-1 text-gray-900 sm:col-span-2 sm:mt-0">
                      <Switch
                        checked={defaulValue}
                        onChange={setDefaulValue}
                        className={classNames(
                          defaulValue ? 'bg-indigo-600' : 'bg-gray-200',
                          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:ml-auto',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={classNames(
                            defaulValue ? 'translate-x-5' : 'translate-x-0',
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                          )}
                        />
                      </Switch>
                    </dd>
                  </Switch.Group>
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
