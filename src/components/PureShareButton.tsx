import classNames from '@/helpers/class-names';
import { KysoButton } from '@/types/kyso-button.enum';
import { Dialog, Transition } from '@headlessui/react';
import { ShareIcon } from '@heroicons/react/solid';
import { Api } from '@kyso-io/kyso-store';
import React, { Fragment, useState } from 'react';
import type { ReportDTO } from '@kyso-io/kyso-model';
import type { CommonData } from '@/types/common-data';
import PureKysoButton from './PureKysoButton';

type Props = {
  iconClasses: string;
  buttonClasses: string;
  withText?: boolean;
  url: string;
  title: string;
  description: string;
  report?: ReportDTO;
  commonData?: CommonData;
};

const PureShareButton = ({ iconClasses, buttonClasses, withText, url, title, description, report, commonData }: Props) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <React.Fragment>
      <button
        type="button"
        className={classNames('inline-flex space-x-2 text-sm font-small rounded-md text-gray-500 items-center focus:outline-none focus:ring-0 border border-transparent px-2.5 py-1.5', buttonClasses)}
        onClick={() => setOpen(true)}
      >
        <ShareIcon className={iconClasses} aria-hidden="true" />
        {withText && (
          <React.Fragment>
            <span className="text-gray-900">Share</span>
            <span className="sr-only">Share</span>
          </React.Fragment>
        )}
      </button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            setOpen(false);
            setTimeout(() => {
              setCopied(false);
            }, 1000);
          }}
        >
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500/50 transition-opacity" />
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
                <Dialog.Panel className="relative min-w-fit bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transition-all sm:my-8 xl:max-w-xl sm:w-full sm:p-6">
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                      <ShareIcon className="h-6 w-6 text-kyso-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        {title}
                      </Dialog.Title>
                      <div className="py-3 sm:col-span-2 text-sm font-light text-gray-700">{description}</div>
                      <div className="py-3 sm:col-span-2">
                        <input readOnly className="p-4 block w-full text-center border shadow-sm outline-none sm:text-sm border-gray-300 rounded-md" defaultValue={url}></input>
                      </div>
                    </div>
                  </div>
                  <div className="">
                    <PureKysoButton
                      type={KysoButton.TERCIARY}
                      className={'justify-center w-full px-4 py-2'}
                      onClick={() => {
                        navigator.clipboard.writeText(url);
                        setCopied(true);

                        if (report && commonData) {
                          const api: Api = new Api(commonData.token, report.organization_sluglified_name, report.team_sluglified_name);
                          api.onSharedReport(report.id!);
                        }
                      }}
                    >
                      {!copied && 'Copy link'}
                      {copied && 'Copied!'}
                    </PureKysoButton>
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

export default PureShareButton;
