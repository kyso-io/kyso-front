/* eslint-disable @typescript-eslint/no-explicit-any */
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import { Dialog, Transition } from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/outline';
import { CheckIcon, ClipboardIcon, ExclamationCircleIcon } from '@heroicons/react/solid';
import type { CreateKysoAccessTokenDto, KysoSetting, KysoUserAccessToken, NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useState } from 'react';
import SettingsAside from '../../../components/SettingsAside';
import ToasterNotification from '../../../components/ToasterNotification';
import { Helper } from '../../../helpers/Helper';
import { useRedirectIfNoJWT } from '../../../hooks/use-redirect-if-no-jwt';
import { TailwindColor } from '../../../tailwind/enum/tailwind-color.enum';

interface Props {
  commonData: CommonData;
}

const Index = ({ commonData }: Props) => {
  const router = useRouter();
  useRedirectIfNoJWT();
  const [requesting, setRequesting] = useState<boolean>(false);
  const [kysoUserAccessTokens, setKysoUserAccessTokens] = useState<KysoUserAccessToken[]>([]);
  const [kysoAccessTokenName, setKysoAccessTokenName] = useState<string>('');
  const [selectedKysoAccessToken, setSelectedKysoAccessToken] = useState<KysoUserAccessToken | null>(null);
  const [openCreateKysoAccessToken, setOpenCreateKysoAccessToken] = useState<boolean>(false);
  const [openDeleteKysoAccessToken, setOpenDeleteKysoAccessToken] = useState<boolean>(false);
  const [openRevokeAllKysoAccessTokens, setOpenRevokeAllKysoAccessTokens] = useState<boolean>(false);
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);
  const [newKysoUserAccessToken, setNewKysoUserAccessToken] = useState<KysoUserAccessToken | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
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

  useEffect(() => {
    if (!commonData.token) {
      return;
    }
    const getKysoUserAccessTokens = async () => {
      setRequesting(true);
      try {
        const api: Api = new Api(commonData.token);
        const resultKysoUserAccessTokens: NormalizedResponseDTO<KysoUserAccessToken[]> = await api.getAccessTokens();
        setKysoUserAccessTokens(resultKysoUserAccessTokens.data);
      } catch (e: any) {
        console.log(e.response.data);
      } finally {
        setRequesting(false);
      }
    };
    getKysoUserAccessTokens();
  }, [commonData.token]);

  const createKysoAccessToken = async () => {
    setRequesting(true);
    setMessageToaster('');
    setShowToaster(false);
    const index: number = kysoUserAccessTokens.findIndex((item: KysoUserAccessToken) => item.name === kysoAccessTokenName);
    if (index !== -1) {
      setMessageToaster('You already have a token with this name');
      setShowToaster(true);
      setRequesting(false);
      return;
    }
    if (commonData.user?.email_verified === false) {
      setShowToaster(true);
      setMessageToaster('Please verify your email');
      setRequesting(false);
      return;
    }
    try {
      const api: Api = new Api(commonData.token);
      const createKysoAccessTokenDto: CreateKysoAccessTokenDto = {
        name: kysoAccessTokenName,
      };
      const resultKysoUserAccessToken: NormalizedResponseDTO<KysoUserAccessToken> = await api.createAccessToken(createKysoAccessTokenDto);
      setNewKysoUserAccessToken(resultKysoUserAccessToken.data);
      setKysoUserAccessTokens([...kysoUserAccessTokens, resultKysoUserAccessToken.data]);
    } catch (e: any) {
      console.log(e.response.data);
    } finally {
      setRequesting(false);
    }
  };

  const deleteKysoAccessToken = async () => {
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token);
      await api.deleteAccessToken(selectedKysoAccessToken!.id!);
      setKysoUserAccessTokens(kysoUserAccessTokens.filter((item: KysoUserAccessToken) => item.id !== selectedKysoAccessToken!.id));
      setSelectedKysoAccessToken(null);
    } catch (e: any) {
      console.log(e.response);
    } finally {
      setRequesting(false);
    }
    setOpenDeleteKysoAccessToken(false);
  };

  const revokeAllKysoAccessTokens = async () => {
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token);
      const resultKysoUserAccessToken: NormalizedResponseDTO<KysoUserAccessToken[]> = await api.revokeAllAccessTokens();
      setKysoUserAccessTokens(resultKysoUserAccessToken.data);
      setSelectedKysoAccessToken(null);
    } catch (e: any) {
      console.log(e.response.data);
    } finally {
      setRequesting(false);
    }
    setOpenRevokeAllKysoAccessTokens(false);
  };

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-1/6">
        <SettingsAside commonData={commonData} />
      </div>
      <div className="w-4/6">
        <div className="py-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Access Token</h1>
              <p className="mt-2 text-sm text-gray-700">
                Personal access tokens functions like ordinary OAuth access tokens. They can be used instead of a password for Kyso over HTTPS, or can be used to authenticate to the api over Basic
                Authentication.
              </p>
            </div>
          </div>
          <div className="sm:flex sm:items-center my-5">
            <div className="sm:flex-auto">
              <h3 className="text-xl font-semibold text-gray-900">Personal Access tokens</h3>
              <p className="mt-2 text-sm text-gray-700">Tokens you have generated that can be used to access the Kyso api.</p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                disabled={requesting}
                onClick={() => {
                  if (captchaIsEnabled && commonData.user?.show_captcha === true) {
                    setShowToaster(true);
                    setMessageToaster('Please verify the captcha');
                    setTimeout(() => {
                      setShowToaster(false);
                      sessionStorage.setItem('redirectUrl', `/user/${commonData.user?.username}/settings/tokens`);
                      router.push('/captcha');
                    }, 2000);
                    return;
                  }
                  if (!commonData.user?.email_verified) {
                    setShowToaster(true);
                    setMessageToaster('Please check your email');
                    return;
                  }
                  setOpenCreateKysoAccessToken(true);
                }}
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Generate new token
              </button>
              {kysoUserAccessTokens.length > 0 && (
                <button
                  disabled={requesting}
                  onClick={() => {
                    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
                      setShowToaster(true);
                      setMessageToaster('Please verify the captcha');
                      setTimeout(() => {
                        setShowToaster(false);
                        sessionStorage.setItem('redirectUrl', `/user/${commonData.user?.username}/settings/tokens`);
                        router.push('/captcha');
                      }, 2000);
                      return;
                    }
                    setOpenRevokeAllKysoAccessTokens(true);
                  }}
                  type="button"
                  className="ml-4 inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-offset-2 sm:w-auto"
                >
                  Revoke all
                </button>
              )}
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Created
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {kysoUserAccessTokens.length === 0 ? (
                        <tr className="">
                          <td colSpan={4} className="text-center whitespace-nowrap py-4 ">
                            No access tokens
                          </td>
                        </tr>
                      ) : (
                        kysoUserAccessTokens.map((kysoUserAccessToken: KysoUserAccessToken) => (
                          <tr key={kysoUserAccessToken.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{kysoUserAccessToken.name}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span
                                className={clsx(
                                  'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                                  kysoUserAccessToken.status === 'active' ? 'bg-green-100 text-green-800' : '',
                                  kysoUserAccessToken.status === 'revoked' ? 'bg-orange-100 text-orange-800' : '',
                                  kysoUserAccessToken.status === 'expired' ? 'bg-red-100 text-red-800' : '',
                                )}
                              >
                                {Helper.ucFirst(kysoUserAccessToken.status)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{moment(kysoUserAccessToken.created_at).format('MMM D, YYYY')}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                              <div className="flex flex-row-reverse" title="Remove access token">
                                <TrashIcon
                                  onClick={() => {
                                    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
                                      setShowToaster(true);
                                      setMessageToaster('Please verify the captcha');
                                      setTimeout(() => {
                                        setShowToaster(false);
                                        sessionStorage.setItem('redirectUrl', `/settings/${commonData.organization?.sluglified_name}`);
                                        router.push('/captcha');
                                      }, 2000);
                                      return;
                                    }
                                    if (requesting) {
                                      return;
                                    }
                                    setSelectedKysoAccessToken(kysoUserAccessToken);
                                    setOpenDeleteKysoAccessToken(true);
                                  }}
                                  className="mr-1 h-5 w-5 text-red-400 group-hover:text-gray-500 cursor-pointer"
                                  aria-hidden="true"
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* CREATE KYSO ACCESS TOKEN */}
      <Transition.Root show={openCreateKysoAccessToken} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            setOpenCreateKysoAccessToken(false);
            setShowToaster(false);
            setMessageToaster('');
            setTimeout(() => {
              setCopied(false);
              setKysoAccessTokenName('');
              setNewKysoUserAccessToken(null);
            }, 1000);
          }}
        >
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mt-3 sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Create access token
                      </Dialog.Title>
                      <div className="mt-2">
                        {newKysoUserAccessToken !== null ? (
                          <React.Fragment>
                            <p>
                              Access token <strong>{newKysoUserAccessToken.name}</strong> has been created. Now you can use it to authenticate. Copy and paste it in a safe place because you will never
                              see this value again.
                            </p>
                            <div className="flex flex-row content-center my-2">
                              <code className="bg-green-100 rounded py-1 px-2">{newKysoUserAccessToken.access_token}</code>
                              {!copied && (
                                <button
                                  title="Copy to clipboard"
                                  type="button"
                                  className="ml-2 inline-flex items-center rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                  onClick={() => {
                                    navigator.clipboard.writeText(newKysoUserAccessToken.access_token);
                                    setCopied(true);
                                    setMessageToaster('Access token copied to clipboard');
                                    setShowToaster(true);
                                  }}
                                >
                                  <ClipboardIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </button>
                              )}
                            </div>
                          </React.Fragment>
                        ) : (
                          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:pt-5">
                            <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Name</label>
                            <div className="mt-1 sm:col-span-2 sm:mt-0">
                              <input
                                value={kysoAccessTokenName}
                                onChange={(e: any) => setKysoAccessTokenName(e.target.value)}
                                type="text"
                                name="name"
                                className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    {newKysoUserAccessToken === null && (
                      <button
                        type="button"
                        disabled={!kysoAccessTokenName}
                        className={clsx(
                          'inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm ml-2',
                          !kysoAccessTokenName && 'opacity-50 cursor-not-allowed',
                        )}
                        onClick={createKysoAccessToken}
                      >
                        Save
                      </button>
                    )}
                    <button
                      type="button"
                      className="mt-3 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                      onClick={() => {
                        setOpenCreateKysoAccessToken(false);
                        setShowToaster(false);
                        setTimeout(() => {
                          setCopied(false);
                          setKysoAccessTokenName('');
                          setNewKysoUserAccessToken(null);
                        }, 1000);
                      }}
                    >
                      {newKysoUserAccessToken !== null ? 'Close' : 'Cancel'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      {/* DELETE KYSO ACCESS TOKEN */}
      <Transition.Root show={openDeleteKysoAccessToken} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            setSelectedKysoAccessToken(null);
            setOpenDeleteKysoAccessToken(false);
          }}
        >
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Delete access token
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Are you sure you want to delete the access token? This action cannot be undone.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => deleteKysoAccessToken()}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => {
                        setSelectedKysoAccessToken(null);
                        setOpenDeleteKysoAccessToken(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      {/* REVOKE ALL KYSO ACCESS TOKENS */}
      <Transition.Root show={openRevokeAllKysoAccessTokens} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setOpenRevokeAllKysoAccessTokens(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Delete access token
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Are you sure you want to delete the access token? This action cannot be undone.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => revokeAllKysoAccessTokens()}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setOpenRevokeAllKysoAccessTokens(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <ToasterNotification
        show={showToaster}
        setShow={setShowToaster}
        icon={copied ? <CheckIcon className="h-6 w-6 text-blue-400" aria-hidden="true" /> : <ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />}
        message={messageToaster}
        backgroundColor={TailwindColor.SLATE_50}
      />
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;