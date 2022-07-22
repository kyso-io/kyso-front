import { useAppSelector } from '@/hooks/redux-hooks';
import { Fragment, useEffect, useState } from 'react';

import classNames from '@/helpers/class-names';
import { ShareIcon } from '@heroicons/react/solid';
import { Transition, Dialog } from '@headlessui/react';
import { useCommonData } from '@/hooks/use-common-data';
import type { CommonData } from '@/hooks/use-common-data';
import { useRouter } from 'next/router';

type IUnpureShareButton = {
  id: string;
};

const UnpureShareButton = (props: IUnpureShareButton) => {
  const router = useRouter();
  const commonData: CommonData = useCommonData();

  const report = useAppSelector((state) => state.reports.entities[props.id]);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [url, setUrl] = useState('');
  useEffect(() => {
    setUrl(`${window.location.origin}${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`);
  });

  return (
    <>
      <button
        type="button"
        className="inline-flex space-x-2 text-gray-400 hover:text-gray-500"
        onClick={() => {
          setOpen(true);
        }}
      >
        <ShareIcon className={classNames('h-5 w-5', 'text-indigo-500')} aria-hidden="true" />
        <span className="text-gray-900">Share</span>
        <span className="sr-only">Share</span>
      </button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            setCopied(false);
            setOpen(false);
          }}
        >
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity/75 transition-opacity" />
          </Transition.Child>

          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transition-all sm:my-8 sm:max-w-sm sm:w-full sm:p-6">
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                      <ShareIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Share report
                      </Dialog.Title>
                      <div className="py-3 sm:mt-0 sm:col-span-2 text-sm font-light text-gray-700">Send this url to someone to share this report</div>
                      <div className="py-3 sm:mt-0 sm:col-span-2">
                        <input className="block max-w-lg w-full border shadow-sm outline-none sm:text-sm border-gray-300 rounded-md p-2" value={url}></input>
                      </div>
                    </div>
                  </div>
                  <div className="">
                    <button
                      type="button"
                      className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(url);
                        setCopied(true);
                      }}
                    >
                      {!copied && 'Copy link'}
                      {copied && 'Copied!'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default UnpureShareButton;
