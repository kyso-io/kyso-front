import { Transition, Menu } from '@headlessui/react';
import { ChevronDoubleLeftIcon } from '@heroicons/react/solid';
import UnPureVideoModal from '@/unpure-components/UnPureVideoModal';
import { classNames } from 'primereact/utils';
import React, { Fragment, useState } from 'react';

interface Props {
  setValue: (value: string) => void;
  setOpen: () => void;
  open: boolean;
  content: {
    title: string;
    text: string;
    demoUrl: string;
    cta: string;
    ctaUrl: string;
    demoPreview: string;
    docUrl?: string | undefined;
    docCta?: string | undefined;
  };
}

const PureCheckListPage = (props: Props) => {
  const { setValue, setOpen, open, content } = props;
  const [isModalOpen, openModal] = useState(false);
  return (
    <Transition
      as={Fragment}
      show={open}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="z-50 absolute right-0 mt-2 h-auto w-max origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
        <div className="space-y-5 py-8">
          <div className="sm:pr-12 px-6 flex mb-3 items-center w-96">
            <button
              className={classNames(
                'inline-flex space-x-2 text-sm font-small rounded-md text-gray-500 items-center focus:outline-none focus:ring-0 border border-transparent px-2.5 py-1.5 hover:bg-gray-100  mr-4',
              )}
              onClick={() => {
                setValue('');
              }}
            >
              <ChevronDoubleLeftIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
            </button>
            <h2 className="text-xl font-medium text-gray-900 ">{content.title}</h2>
          </div>
          <div className="text-gray-500 pt-2 px-6 w-96">{content.text}</div>
          <UnPureVideoModal setOpen={openModal} isOpen={isModalOpen} demoUrl={content.demoUrl} />
          <div className="my-11 justify-center text-center mx-auto max-w-sm px-10" onClick={() => openModal(!isModalOpen)}>
            <div className="relative aspect-[2/1] overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-900/10 hover:opacity-60 hover:cursor-pointer" onClick={() => openModal(!isModalOpen)}>
              <img src={content.demoPreview} alt="" className="absolute inset-0 h-full w-full opacity-90" />
            </div>
          </div>
          <div className="flex justify-center pt-10">
            <button
              className="w-fit whitespace-nowrap p-3 font-medium text-white rounded bg-kyso-600 hover:bg-kyso-700 text-sm flex flex-row items-center focus:ring-0 focus:outline-none"
              onClick={() => {
                window.open(content.ctaUrl);
                setValue('');
                setOpen();
              }}
            >
              {content.cta}
            </button>
          </div>
          <div className="flex justify-center">
            {content.docCta && content.docUrl && (
              <button
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                onClick={() => {
                  window.open(content.docUrl);
                  setValue('');
                  setOpen();
                }}
              >
                {content.docCta}
              </button>
            )}
          </div>
        </div>
      </Menu.Items>
    </Transition>
  );
};

export default PureCheckListPage;
