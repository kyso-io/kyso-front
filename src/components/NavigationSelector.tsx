import type { NavigationSelectorItem } from '@/model/navigation-selector-item.model';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { SelectorIcon } from '@heroicons/react/solid';

type INavigationSelectorProps = {
  selectorItems: NavigationSelectorItem[];
  selectorLabel?: string;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const NavigationSelector = (props: INavigationSelectorProps) => {
  let currentOrg = null;
  if (props.selectorItems) {
    currentOrg = props.selectorItems.find((item) => item.current);
  }

  const { selectorLabel = 'organization' } = props;

  return (
    <div className="rounded-md flex items-center">
      <a href={`${currentOrg && currentOrg.href}`} className="p-2 rounded-l hover:underline text-gray-900 text-sm font-medium">
        {currentOrg ? currentOrg.name : `Select ${selectorLabel}`}
      </a>
      <Menu as="div" className="relative w-fit inline-block text-left">
        <Menu.Button className="hover:bg-gray-100 w-fit rounded p-2 text-sm text-left font-medium text-gray-700 hover:outline-none">
          <SelectorIcon className="shrink-0 h-5 w-5 text-gray-700 group-hover:text-gray-500" aria-hidden="true" />
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
            {currentOrg && (
              <div>
                <div className="px-4 pt-3">
                  <p className="text-sm">Current {selectorLabel}</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{currentOrg && currentOrg.name}</p>
                </div>

                <div className="px-4 py-2 text-sm font-light truncate text-indigo-500">
                  <a href={`${currentOrg && currentOrg.href}/settings`}>Go to {selectorLabel} settings</a>
                </div>
              </div>
            )}

            <div className="py-1">
              <div className="px-4 py-2">
                <p className="text-sm text-gray-500 truncate">{currentOrg ? `Your other ${selectorLabel}s:` : `Select ${selectorLabel}:`}</p>
              </div>

              {props.selectorItems &&
                props.selectorItems
                  .filter((o) => !o.current)
                  .map((NavigationSelectorItem) => (
                    <Menu.Item key={NavigationSelectorItem.href}>
                      {({ active }) => (
                        <a
                          href={NavigationSelectorItem.href}
                          className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm', NavigationSelectorItem.current ? 'font-bold' : 'font-normal')}
                        >
                          {NavigationSelectorItem.name}
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
