/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CommonData } from '@/types/common-data';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { DotsVerticalIcon, ExclamationCircleIcon, TrashIcon } from '@heroicons/react/solid';
import type { UserDTO, NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import React, { Fragment, useState } from 'react';
import CaptchaModal from '../components/CaptchaModal';

interface Props {
  commonData: CommonData;
  captchaIsEnabled: boolean;
  setUser: (user: UserDTO) => void;
}

const UnpureDeleteChannelDropdown = ({ commonData, captchaIsEnabled, setUser }: Props) => {
  const [requesting, setRequesting] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [showCaptchaModal, setShowCaptchaModal] = useState<boolean>(false);

  const deleteTeam = async () => {
    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowCaptchaModal(true);
      return;
    }
    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, commonData.team!.sluglified_name);
      await api.deleteTeam(commonData.team!.id!);
    } catch (error: any) {
      console.error(error.response.data.message);
      setOpen(false);
      setInput('');
      setRequesting(false);
    }
    window.location.href = `/${commonData.organization?.sluglified_name}`;
  };

  const onCloseCaptchaModal = async (refreshUser: boolean) => {
    setShowCaptchaModal(false);
    if (refreshUser) {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
      setUser(result.data);
    }
  };

  return (
    <React.Fragment>
      <Menu as="div" className="p-1.5 px-2 font-medium text-sm relative inline-block">
        <Menu.Button className="rounded flex p-2 items-center hover:bg-gray-200 focus:outline-none">
          <span className="sr-only">Open options</span>
          <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white border focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                <span onClick={() => setOpen(true)} className="cursor-pointer text-gray-700 px-4 py-2 text-sm hover:bg-gray-50 group flex items-center">
                  <TrashIcon className="mr-1 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  Delete Channel
                </span>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
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
                        Delete channel
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          The <strong>{commonData.organization?.display_name}</strong> channel and all its data will be deleted. This action cannot be undone.
                        </p>
                        <p className="text-sm text-gray-500 my-3">
                          Please type <strong>{commonData.team?.sluglified_name}</strong> in the text box before confirming.
                        </p>
                        <input
                          value={input}
                          type="text"
                          className="h-8 focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && input === commonData.team?.sluglified_name && !requesting) {
                              deleteTeam();
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      disabled={input !== commonData.team?.sluglified_name || requesting}
                      className={clsx(
                        'inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
                        input !== commonData.team?.sluglified_name || requesting ? 'cursor-not-allowed bg-red-300' : 'bg-red-600 hover:bg-red-700',
                      )}
                      onClick={deleteTeam}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => {
                        setInput('');
                        setOpen(false);
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
      {commonData.user && <CaptchaModal user={commonData.user!} open={showCaptchaModal} onClose={onCloseCaptchaModal} />}
    </React.Fragment>
  );
};

export default UnpureDeleteChannelDropdown;
