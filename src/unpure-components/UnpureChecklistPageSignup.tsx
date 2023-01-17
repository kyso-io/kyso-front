import { Transition, Menu } from '@headlessui/react';
import { ChevronDoubleLeftIcon } from '@heroicons/react/solid';
import { classNames } from 'primereact/utils';
import React, { Fragment } from 'react';

interface Props {
  setValue: (value: string) => void;
  setOpen: () => void;
  open: boolean;
}

const UnPureCheckListPageSignup = (props: Props) => {
  const { setValue, setOpen, open } = props;
  const content = {
    urlCta: 'https://docs.kyso.io/search-and-discovery/how-to-search',
  };

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
          <div className="sm:pr-12 px-6 flex mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-600 mr-3">
              <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" />
            </svg>

            <h2 className="text-xl font-medium text-gray-900 ">See how people sees you.</h2>
          </div>
          <div className="text-gray-500 pt-2 px-6 w-96">
            The following video will show you how you can edit your profile, how does your public profile looks like, and how invite collage to your channel{' '}
          </div>
          <div className="my-11 justify-center text-center mx-auto max-w-sm px-10" onClick={() => setValue('')}>
            <div className="relative aspect-[2/1] overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-900/10 hover:opacity-60 hover:cursor-pointer">
              <img src="/static/demo.png" alt="" className="absolute inset-0 h-full w-full opacity-90" />
            </div>
          </div>

          <div className="flex justify-center pt-10">
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
            <button
              className="w-fit whitespace-nowrap p-3 font-medium text-white rounded bg-kyso-600 hover:bg-kyso-700 text-sm flex flex-row items-center focus:ring-0 focus:outline-none"
              onClick={() => {
                window.open(content.urlCta);
                setValue('');
                setOpen();
              }}
            >
              Visit your Public Profile
            </button>
          </div>
        </div>
      </Menu.Items>
    </Transition>
  );
};

export default UnPureCheckListPageSignup;
