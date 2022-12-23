import { BellIcon } from '@heroicons/react/solid';
import { Menu, Transition } from '@headlessui/react';
import React, { useState, Fragment } from 'react';
import UnPureCheckListTour from '@/unpure-components/UnPureChecklistTour';
import UnPureCheckListPage from '@/unpure-components/UnPureChecklistPage';

const PureCheckListTour = () => {
  const [value, setValue] = useState('comments');
  const [open, setOpen] = useState<boolean>(true);

  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button
          className="flex max-w-xs items-center rounded-full text-sml-auto bg-white p-1 text-green-500 ver:text-indigo-500/75 focus:outline-none ring-2 ring-green-500 focus:ring-offset-2 focus:ring-offset-kyso-600"
          onClick={() => {
            setOpen(!open);
            setValue('');
          }}
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
        </Menu.Button>
      </div>
      <div>
        {value === '' && (
          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="z-50 absolute right-0 mt-2 h-auto w-max origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
              <UnPureCheckListTour setValue={setValue} />
            </Menu.Items>
          </Transition>
        )}
        {value === 'comments' && (
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
              <UnPureCheckListPage setValue={setValue} setOpen={() => setOpen(!open)} />
            </Menu.Items>
          </Transition>
        )}
      </div>
    </Menu>
  );
};

export default PureCheckListTour;
