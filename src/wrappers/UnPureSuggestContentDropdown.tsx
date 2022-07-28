import { Fragment } from 'react';
import { PlusIcon } from '@heroicons/react/solid';
import { Menu, Transition } from '@headlessui/react';
import UnPureSuggestUserCombobox from '@/wrappers/UnPureSuggestUserCombobox';

type IUnPureSuggestContentDropdown = {
  label: string;
};

const UnPureSuggestContentDropdown = (props: IUnPureSuggestContentDropdown) => {
  const { label } = props;

  return (
    <>
      <Menu as="div" className="z-50 relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-80 sm:rounded-lg shadow-lg bg-white border focus:outline-none ">
            <div className="py-1">
              <div className="px-4 py-5 sm:p-6">
                <form className="mt-1 sm:items-center">
                  <div className="w-full sm:max-w-s">
                    <UnPureSuggestUserCombobox label={label} />
                  </div>
                  <div className="w-full sm:max-w-xs mt-10 text-right">
                    <button
                      type="reset"
                      className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      {/* transition see Unpure dropdown */}
    </>
  );
};

export default UnPureSuggestContentDropdown;
