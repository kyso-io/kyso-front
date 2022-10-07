/* eslint-disable @typescript-eslint/no-explicit-any */
import { PureSpinner } from '@/components/PureSpinner';
import classNames from '@/helpers/class-names';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import { ArrowRightIcon, ExclamationCircleIcon } from '@heroicons/react/solid';
import type { KysoSetting, NormalizedResponseDTO, Organization } from '@kyso-io/kyso-model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import PureAvatar from '../components/PureAvatar';
import ToasterNotification from '../components/ToasterNotification';
import { checkJwt } from '../helpers/check-jwt';
import { TailwindColor } from '../tailwind/enum/tailwind-color.enum';
import { TailwindFontSizeEnum } from '../tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '../tailwind/enum/tailwind-height.enum';

interface Props {
  commonData: CommonData;
}

const Index = ({ commonData }: Props) => {
  const router = useRouter();
  const ref = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setBusy] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [urlLocalFile, setUrlLocalFile] = useState<string | null>(null);
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);

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

  const createOrganization = async (ev: any) => {
    ev.preventDefault();

    if (commonData.user?.email_verified === false) {
      setShowToaster(true);
      setMessageToaster('Your account is not verified. Please check your email before creating an organization.');
      return;
    }

    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowToaster(true);
      setMessageToaster('Please verify the captcha');
      setTimeout(() => {
        setShowToaster(false);
        sessionStorage.setItem('redirectUrl', `/create-organization`);
        router.push('/captcha');
      }, 2000);
      return;
    }

    setShowToaster(false);
    setMessageToaster('');

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
        location,
        link,
      });
      const organization: Organization = result.data;
      if (file) {
        await api.updateOrganizationImage(organization!.id!, file);
      }
      router.push(`/${organization.sluglified_name}`);
    } catch (er: any) {
      setError(er.response.data.message);
    } finally {
      setBusy(false);
    }
  };

  const onChangeInputFile = (e: any) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUrlLocalFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  if (userIsLogged === null) {
    return null;
  }

  return (
    <div className="flex flex-row space-x-8 p-2 pt-10">
      <div className="w-2/12"></div>
      <div className="w-8/12 flex flex-col space-y-8">
        {userIsLogged ? (
          <form className="space-y-8 divide-y divide-gray-200" onSubmit={createOrganization}>
            <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
              <div>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Create a new organization</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">{/* This will be your  */}</p>
                </div>

                <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start  sm:pt-5">
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                      Photo
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <div className="max-w-lg flex flex-row items-center">
                        {file === null && (
                          <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                            <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                          </span>
                        )}
                        {urlLocalFile !== null && <PureAvatar src={urlLocalFile} title="Organiztion avatar" size={TailwindHeightSizeEnum.H12} textSize={TailwindFontSizeEnum.XS} />}
                        <button
                          disabled={isBusy}
                          onClick={() => ref.current.click()}
                          className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          {commonData.organization?.avatar_url !== null ? 'Change' : 'Select'}
                        </button>
                        {urlLocalFile !== null && (
                          <button
                            disabled={isBusy}
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
                          onChange={(e) => {
                            setError('');
                            setDisplayName(e.target.value);
                          }}
                          className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
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
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                    <label htmlFor="link" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                      Link
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <div className="max-w-lg flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="link"
                          id="link"
                          value={link}
                          autoComplete="link"
                          onChange={(e) => setLink(e.target.value)}
                          className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                      Location
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <div className="max-w-lg flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="location"
                          id="location"
                          value={location}
                          autoComplete="location"
                          onChange={(e) => setLocation(e.target.value)}
                          className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                        />
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
                      error ? 'opacity-75 cursor-not-allowed' : 'hover:bg-kyso-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900',
                      'ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-kyso-600 ',
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
        ) : (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Forbidden resource</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This page is only available to registered users.{' '}
                    <a href="/login" className="font-bold">
                      Sign in
                    </a>{' '}
                    now.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToasterNotification
        show={showToaster}
        setShow={setShowToaster}
        icon={<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />}
        message={messageToaster}
        backgroundColor={TailwindColor.SLATE_50}
      />
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
