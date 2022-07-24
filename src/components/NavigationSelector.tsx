import type { BreadcrumbItem } from '@/model/breadcrum-item.model';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, SelectorIcon } from '@heroicons/react/solid';

type INavigationSelectorProps = {
  selectorItems: BreadcrumbItem[];
  selectorLabel?: string;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const NavigationSelector = (props: INavigationSelectorProps) => {
  let currentOrg: BreadcrumbItem | null | undefined = null;
  if (props.selectorItems) {
    currentOrg = props.selectorItems.find((item) => item.current);
  }

  const { selectorLabel = 'organization' } = props;

  return (
    <div className="rounded-md flex items-center">
      {currentOrg && (
        <>
          <a href={`${currentOrg!.href}`} className={classNames('text-gray-700', 'block px-0 py-2 text-sm', 'font-medium hover:underline mr-1')}>
            {currentOrg!.name}
          </a>
        </>
      )}
      <Menu as="div" className="relative w-fit inline-block text-left">
        <Menu.Button className="hover:bg-gray-100 p-2 flex items-center w-fit rounded text-sm text-left font-medium text-gray-700 hover:outline-none">
          {/* {currentOrg ? currentOrg.name : '' } */}
          {!currentOrg ? `Select ${selectorLabel}` : ''}
          <div className={classNames(!currentOrg ? 'pl-2' : '')}>
            {currentOrg && <ChevronDownIcon className="shrink-0 h-5 w-5 text-gray-700 group-hover:text-gray-500" aria-hidden="true" />}
            {!currentOrg && <SelectorIcon className="shrink-0 h-5 w-5 text-gray-700 group-hover:text-gray-500" aria-hidden="true" />}
          </div>
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
          <Menu.Items className=" z-50 origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-slate-200 ring-opacity/5 divide-y divide-gray-100 focus:outline-none">
            {/* {currentOrg && (
              <>
                <Menu.Item>
                  {({ active }) => (
                    <a href={`${currentOrg!.href}`} className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm', 'font-medium')}>
                      Go to {currentOrg!.name}
                    </a>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <a href={`${currentOrg!.href}/settings`} className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm')}>
                      Go to settings
                    </a>
                  )}
                </Menu.Item>
              </>
            )} */}

            <div className="py-1">
              {currentOrg && (
                <div className="px-4 py-2">
                  <p className="text-sm text-gray-500 truncate">Choose {selectorLabel}:</p>
                </div>
              )}

              {props.selectorItems &&
                props.selectorItems
                  // .filter((o) => !o.current)
                  .map((item: BreadcrumbItem) => (
                    <Menu.Item key={item.href}>
                      {({ active }) => (
                        <a href={item.href} className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm', item.current ? 'font-bold' : 'font-normal')}>
                          {item.name}
                        </a>
                      )}
                    </Menu.Item>
                  ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export { NavigationSelector };