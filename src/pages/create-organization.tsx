/* eslint-disable @typescript-eslint/no-explicit-any */
import { PureAlert, PureAlertTypeEnum } from '@/components/PureAlert';
import PureAvatar from '@/components/PureAvatar';
import { PureSpinner } from '@/components/PureSpinner';
import { RegisteredUsersAlert } from '@/components/RegisteredUsersAlert';
import { ToasterIcons } from '@/enums/toaster-icons';
import { Helper } from '@/helpers/Helper';
import { checkJwt } from '@/helpers/check-jwt';
import type { HttpExceptionDto } from '@/interfaces/http-exception.dto';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import { ArrowRightIcon } from '@heroicons/react/solid';
import type { NormalizedResponseDTO, Organization } from '@kyso-io/kyso-model';
import { AllowDownload, CreateOrganizationDto, KysoSettingsEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { usePublicSettings } from '../hooks/use-public-settings';
import { isGlobalAdmin } from '../helpers/check-permissions';

const Index = ({ commonData, showToaster, hideToaster, isCurrentUserVerified, isCurrentUserSolvedCaptcha, isUserLogged }: IKysoApplicationLayoutProps) => {
  const router = useRouter();
  const ref = useRef<any>(null);
  const kysoSettingValues: (any | null)[] = usePublicSettings([KysoSettingsEnum.ONLY_GLOBAL_ADMINS_CAN_CREATE_ORGANIZATIONS]);
  const [isBusy, setBusy] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [allowDownload, setAllowDownload] = useState<AllowDownload>(AllowDownload.ALL);
  const [file, setFile] = useState<File | null>(null);
  const [urlLocalFile, setUrlLocalFile] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [waitForLogging, setWaitForLogging] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWaitForLogging(true);
    }, 1000);

    setIsEmailVerified(isCurrentUserVerified());

    return () => clearTimeout(timeout);
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
    if (!commonData.user || !commonData.permissions || kysoSettingValues.length !== 1 || kysoSettingValues[0] === null) {
      return;
    }
    if (kysoSettingValues[0] === 'true' || kysoSettingValues[0] === true) {
      if (!isGlobalAdmin(commonData.permissions)) {
        router.replace('/');
      }
    }
  }, [commonData.user, commonData.permissions, kysoSettingValues]);

  const createOrganization = async (): Promise<void> => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    if (!displayName || displayName.length === 0) {
      showToaster('Please specify a organization name.', ToasterIcons.INFO);
      return;
    }

    hideToaster();
    setBusy(true);

    try {
      const api: Api = new Api(commonData.token);
      const createOrganizationDto: CreateOrganizationDto = new CreateOrganizationDto(displayName, bio, location, link, allowDownload);
      const result: NormalizedResponseDTO<Organization> = await api.createOrganization(createOrganizationDto);

      showToaster('Organization created successfully', ToasterIcons.SUCCESS);

      const organization: Organization = result.data;
      api.setOrganizationSlug(organization.sluglified_name);
      if (file) {
        await api.updateOrganizationImage(organization!.id!, file);
      }

      // To force reloading of commonData
      window.location.href = `/${organization.sluglified_name}`;
      setBusy(false);
    } catch (er: any) {
      const httpExceptionDto: HttpExceptionDto = er.response.data;
      showToaster(httpExceptionDto.message, ToasterIcons.ERROR);
      setBusy(false);
    }
  };

  const onChangeInputFile = (e: any) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUrlLocalFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  if (!isUserLogged) {
    return null;
  }

  return (
    <div className="flex flex-row space-x-8 p-2 pt-5">
      <div className="w-2/12"></div>
      <div className="w-8/12 flex flex-col space-y-8">
        {isUserLogged ? (
          <React.Fragment>
            {/* Alert section */}
            {!isEmailVerified && (
              <PureAlert
                title="Account not verified"
                description="Your account has not been verified yet. Please check your inbox, verify your account and refresh this page."
                type={PureAlertTypeEnum.WARNING}
              />
            )}
            <form className="space-y-8 divide-y divide-gray-200">
              <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
                <div>
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Create a new organization</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">{/* This will be your  */}</p>
                  </div>

                  <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start  sm:pt-5">
                      <label htmlFor="photo" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        Photo:
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
                            type="button"
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
                        Name:
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="displayName"
                            id="displayName"
                            value={displayName || ''}
                            autoComplete="displayName"
                            onChange={(e) => {
                              hideToaster();
                              setDisplayName(e.target.value);
                            }}
                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        Bio:
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                          <textarea
                            value={bio || ''}
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
                        Link:
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="link"
                            id="link"
                            value={link || ''}
                            autoComplete="link"
                            onChange={(e) => setLink(e.target.value)}
                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        Location:
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="location"
                            id="location"
                            value={location || ''}
                            autoComplete="location"
                            onChange={(e) => setLocation(e.target.value)}
                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
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
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <div className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"></div>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className="max-w-lg flex w-full justify-end items-center">
                    <div className="text-red-500 text-sm"></div>
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={createOrganization}
                      className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900 ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white k-bg-primary"
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
          </React.Fragment>
        ) : (
          waitForLogging && <RegisteredUsersAlert />
        )}
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
