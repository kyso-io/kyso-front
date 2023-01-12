import { Transition, Menu } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/solid';
import React, { Fragment } from 'react';

interface Props {
  setValue: (value: string) => void;
  setOpen: () => void;
  open: boolean;
}

const UnPureCheckListPageSignup = (props: Props) => {
  const { setValue, setOpen, open } = props;
  const content = {
    title: 'Well done, you got your first Search',
    text: 'Here is your Onboard checklist',
    subtitle: 'Comments div',
    subtext: 'Get notified when someones posts a comment on a posting.',
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
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" aria-hidden="true" />
            <h2 className="text-xl font-medium text-gray-900 ">{content.title}</h2>
          </div>
          <span className="text-gray-500 pt-2 px-6">{content.text}</span>

          <div className="text-sm w-96 px-6">
            <label className="font-medium text-gray-700">{content.subtitle}</label>
            <p className="text-gray-500">{content.subtext}</p>
          </div>
          <div className="flex justify-center pt-10">
            <button
              className="w-fit whitespace-nowrap p-3 font-medium text-white rounded bg-kyso-600 hover:bg-kyso-700 text-sm flex flex-row items-center focus:ring-0 focus:outline-none"
              onClick={() => {
                window.open(content.urlCta);
                setValue('');
                setOpen();
              }}
            >
              What to know more
            </button>
          </div>
        </div>
      </Menu.Items>
    </Transition>
  );
};

export default UnPureCheckListPageSignup;
