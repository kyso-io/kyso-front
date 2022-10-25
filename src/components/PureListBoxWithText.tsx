import classNames from '@/helpers/class-names';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import clsx from 'clsx';
import { Fragment } from 'react';

interface Props {
  selectedLabel: string;
  roles: { value: string; label: string; description?: string }[];
  disabled: boolean;
  setSelectedRole: (value: string) => void;
  setSelectedLabel: (value: string) => void;
}

const ListboxWithText = ({ selectedLabel, roles, disabled, setSelectedRole, setSelectedLabel }: Props) => {
  return (
    <Menu as="div" className="my-2 ">
      <div>
        <Menu.Button
          disabled={disabled}
          className={clsx(
            'block w-full px-4 pl-3 pr-10 py-2 text-base font-medium sm:text-sm rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 focus:border-indigo-500',
            disabled ? 'cursor-not-allowed' : '',
          )}
        >
          <span className="flex flex-row">
            {selectedLabel}
            <span>
              <ChevronDownIcon className="flex-1 -mr-1 ml-2 h-5 w-5" aria-hidden="true" />
            </span>
          </span>
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-gray-300 ring-opacity/5 focus:outline-none">
          <div className="py-1">
            {roles.map((role: { value: string; label: string; description?: string }) => (
              <Menu.Item key={role.value}>
                {({ active }) => (
                  <div
                    className={classNames('relative cursor-default select-none')}
                    onClick={() => {
                      setSelectedRole(role.value);
                      setSelectedLabel(role.label);
                    }}
                  >
                    {role.label === 'Remove access' ? (
                      <a href="#" className={classNames(active ? 'bg-gray-100  text-red-900' : 'text-red-700', 'block px-4 mt-2 text-sm border-t pt-3')}>
                        {role.label}
                      </a>
                    ) : (
                      <a href="#" className={classNames(active ? 'bg-gray-100  text-gray-900' : 'text-gray-700', 'block px-4 pt-2 text-sm')}>
                        {role.label}
                      </a>
                    )}
                    <p className={classNames(active ? 'bg-gray-100 text-gray-500' : 'text-gray-400', 'block px-4 pb-2 text-sm')}>{role.description}</p>
                  </div>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default ListboxWithText;
