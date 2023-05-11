/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helper } from '@/helpers/Helper';
import type { CommonData } from '@/types/common-data';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { DotsVerticalIcon, ExclamationCircleIcon, TrashIcon } from '@heroicons/react/solid';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import React, { Fragment, useState } from 'react';
import { ToasterIcons } from '@/enums/toaster-icons';

interface Props {
  commonData: CommonData;
  showToaster: (message: string, icon: JSX.Element) => void;
  isCurrentUserSolvedCaptcha: () => boolean;
  isCurrentUserVerified: () => boolean;
}

const UnpureDeleteOrganizationDropdown = ({ commonData, showToaster, isCurrentUserSolvedCaptcha, isCurrentUserVerified }: Props) => {
  const [requesting, setRequesting] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');

  const deleteOrganization = async () => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster);

    if (!isValid) {
      return;
    }

    setRequesting(true);
    try {
      const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
      await api.deleteOrganization(commonData.organization!.id!);
      showToaster(`Organization deleted successfully`, ToasterIcons.INFO);
    } catch (error: any) {
      showToaster(`Something happened trying to delete the organization. Please try again. <br /> <br /> ${error.response.data.message}`, ToasterIcons.ERROR);
      Helper.logError(error?.response?.data?.message, error);
      setOpen(false);
      setInput('');
      setRequesting(false);
    }
    window.location.href = '/';
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
            <div className="py-1 bg-white">
              <Menu.Item>
                <span
                  onClick={() => window.open(`../settings/${commonData.organization?.sluglified_name}`, '_self')}
                  className="cursor-pointer text-gray-700 px-4 py-2 text-sm hover:bg-gray-50 group flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configure Organization
                </span>
              </Menu.Item>
              <Menu.Item>
                <span onClick={() => setOpen(true)} className="cursor-pointer text-gray-700 px-4 py-2 text-sm hover:bg-gray-50 group flex items-center">
                  <TrashIcon className="mr-1 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  Delete Organization
                </span>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500/50 transition-opacity" />
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
                        Delete organization
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          The <strong>{commonData.organization?.display_name}</strong> organization and all its data will be deleted. This action cannot be undone.
                        </p>
                        <p className="text-sm text-gray-500 my-3">
                          Please type <strong>{commonData.organization?.sluglified_name}</strong> in the text box before confirming.
                        </p>
                        <input
                          value={input}
                          type="text"
                          className="h-8 focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && input === commonData.organization?.sluglified_name && !requesting) {
                              deleteOrganization();
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      disabled={input !== commonData.organization?.sluglified_name || requesting}
                      className={clsx(
                        'inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
                        input !== commonData.organization?.sluglified_name || requesting ? 'cursor-not-allowed k-bg-primary-disabled' : 'k-bg-primary k-bg-primary-hover',
                      )}
                      onClick={deleteOrganization}
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
    </React.Fragment>
  );
};

export default UnpureDeleteOrganizationDropdown;
