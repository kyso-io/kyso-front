/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable consistent-return */
import { Helper } from '@/helpers/Helper';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { InformationCircleIcon } from '@heroicons/react/outline';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
import type { KysoSetting, NormalizedResponseDTO, UserDTO } from '@kyso-io/kyso-model';
import { KysoSettingsEnum, UpdateUserRequestDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import CaptchaModal from '../../../components/CaptchaModal';
import PureAvatar from '../../../components/PureAvatar';
import SettingsAside from '../../../components/SettingsAside';
import ToasterNotification from '../../../components/ToasterNotification';
import { checkJwt } from '../../../helpers/check-jwt';
import { TailwindColor } from '../../../tailwind/enum/tailwind-color.enum';
import { TailwindFontSizeEnum } from '../../../tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '../../../tailwind/enum/tailwind-height.enum';
import type { CommonData } from '../../../types/common-data';

interface Props {
  commonData: CommonData;
  setUser: (user: UserDTO) => void;
}

const Index = ({ commonData, setUser }: Props) => {
  const router = useRouter();
  const username: string = router.query.username as string;
  const ref = useRef<any>(null);
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState<boolean | null>(null);
  const [bio, setBio] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [urlLocalFile, setUrlLocalFile] = useState<string | null>(null);
  const [requesting, setRequesting] = useState<boolean>(false);
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [showToasterEmailVerification, setShowToasterEmailVerification] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
  const [toasterIcon, setIcon] = useState<ReactElement>(<InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />);
  const [showCaptchaModal, setShowCaptchaModal] = useState<boolean>(false);
  const [sentVerificationEmail, setSentVerificationEmail] = useState<boolean>(false);
  // const [showErrorBio, setShowErrorBio] = useState<boolean>(false);
  // const [showErrorLink, setShowErrorLink] = useState<boolean>(false);
  // const [showErrorLocation, setShowErrorLocation] = useState<boolean>(false);

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
        Helper.logError(errorHttp.response.data, errorHttp);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (!commonData.user) {
      return;
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
    if (!commonData.user) {
      return;
    }
    setBio(commonData.user.bio);
    setLink(commonData.user.link);
    setLocation(commonData.user.location);
  }, [commonData.user]);

  useEffect(() => {
    if (userIsLogged === null) {
      return;
    }
    if (userIsLogged) {
      setIsCurrentUser(commonData.user?.username === username);
    }
  }, [commonData.user, userIsLogged]);

  const onChangeInputFile = (e: any) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUrlLocalFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  const submit = async () => {
    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowCaptchaModal(true);
      return;
    }
    if (commonData.user?.email_verified === false) {
      setShowToaster(true);
      setIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
      setMessageToaster('Please verify your email');
      return;
    }
    try {
      setIcon(<InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />);
      setMessageToaster('Updating profile...');
      const api: Api = new Api(commonData.token);
      if (file !== null) {
        setShowToaster(true);
        setRequesting(true);
        await api.updateUserProfileImage(commonData.user!.id, file);
      }
      const updateUserRequestDto: UpdateUserRequestDTO = new UpdateUserRequestDTO(commonData.user!.name, commonData.user!.display_name, location, link, bio);
      await api.updateUser(commonData.user!.id!, updateUserRequestDto);
      router.reload();
    } catch (e: any) {
      Helper.logError(e.response.data, e);
    } finally {
      setRequesting(false);
      setShowToaster(false);
      setMessageToaster('');
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

  const sendVerificationEmail = async () => {
    try {
      const api: Api = new Api(commonData.token);
      await api.sendVerificationEmail();
      setSentVerificationEmail(true);
      setShowToasterEmailVerification(true);
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
  };

  if (userIsLogged === null) {
    return null;
  }

  let userpage = '/';
  if (commonData.user?.username) {
    userpage = commonData.user?.username;
  }

  return (
    <div className="flex flex-row space-x-8 p-2 pt-10">
      <div className="w-2/12">
        <SettingsAside commonData={commonData} />
      </div>
      <div className="w-8/12 flex flex-col space-y-8">
        {isCurrentUser ? (
          <div className="space-y-6 pt-8 sm:space-y-5 sm:pt-10">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <a href={`/user/${userpage}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  /user/{userpage}
                </a>
              </div>
            </div>
            <div className="space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <label className="block text-sm font-medium text-gray-700">Photo</label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <div className="flex items-center">
                    {commonData.user?.avatar_url === null && file === null && (
                      <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                      </span>
                    )}
                    {commonData.user?.avatar_url && file === null && (
                      <PureAvatar src={commonData.user.avatar_url} title={`${commonData.user.display_name} avatar`} size={TailwindHeightSizeEnum.H12} textSize={TailwindFontSizeEnum.XS} />
                    )}
                    {urlLocalFile !== null && <PureAvatar src={urlLocalFile} title={`${commonData.user?.display_name} avatar`} size={TailwindHeightSizeEnum.H12} textSize={TailwindFontSizeEnum.XS} />}
                    <button
                      disabled={requesting}
                      onClick={() => ref.current.click()}
                      className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {commonData.user?.avatar_url !== null ? 'Change' : 'Select'}
                    </button>
                    {urlLocalFile !== null && (
                      <button
                        disabled={requesting}
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
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Bio:</label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <textarea
                    value={bio || ''}
                    onChange={(e: any) => setBio(e.target.value)}
                    name="bio"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  ></textarea>
                  {/* {showErrorBio && <p className="mt-2 text-sm text-red-500">This field is mandatory.</p>} */}
                </div>
              </div>
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Link:</label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <input
                    value={link || ''}
                    onChange={(e: any) => setLink(e.target.value)}
                    type="text"
                    name="link"
                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                  />
                  {/* {showErrorLink && <p className="mt-2 text-sm text-red-500">This field is mandatory.</p>} */}
                </div>
              </div>
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Location:</label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <input
                    value={location || ''}
                    onChange={(e: any) => setLocation(e.target.value)}
                    type="text"
                    name="link"
                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                  />
                  {/* {showErrorLocation && <p className="mt-2 text-sm text-red-500">This field is mandatory.</p>} */}
                </div>
              </div>
            </div>

            <div className="pt-5 sm:border-t sm:border-gray-200">
              {!commonData?.user?.email_verified && !sentVerificationEmail && (
                <div className="rounded-md bg-yellow-50 p-4 mb-4">
                  <div className="flex">
                    <div className="shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Attention needed</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Your account is not verified. Click{' '}
                          <span onClick={sendVerificationEmail} className="font-bold cursor-pointer underline">
                            here
                          </span>{' '}
                          to receive a verification e-mail.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  disabled={requesting}
                  onClick={() => router.push(`/user/${username}`)}
                  type="button"
                  className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  disabled={requesting}
                  onClick={submit}
                  type="submit"
                  className={clsx(
                    'ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                    requesting && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
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
                    This page is not available. Go to your{' '}
                    <a href={`/user/${commonData.user?.username}/settings`} className="font-bold">
                      profile
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToasterNotification show={showToaster} setShow={setShowToaster} icon={toasterIcon} message={messageToaster} backgroundColor={TailwindColor.SLATE_50} />
      <ToasterNotification
        show={showToasterEmailVerification}
        setShow={setShowToasterEmailVerification}
        icon={toasterIcon}
        message="Verification e-mail sent."
        backgroundColor={TailwindColor.SLATE_50}
      />
      {commonData.user && <CaptchaModal user={commonData.user!} open={showCaptchaModal} onClose={onCloseCaptchaModal} />}
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
