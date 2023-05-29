import type { BreadcrumbItem } from '@/model/breadcrum-item.model';
import { Menu, Transition } from '@headlessui/react';
import { HomeIcon, PlusCircleIcon, SearchIcon, SelectorIcon, ViewListIcon } from '@heroicons/react/outline';
import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import type { CommonData } from '../types/common-data';

type INavigationSelectorProps = {
  commonData: CommonData;
  selectorItems: BreadcrumbItem[];
  selectorLabel?: string;
  extraItem?: React.ReactElement;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const NavigationSelector = (props: INavigationSelectorProps) => {
  let currentOrg: BreadcrumbItem | null | undefined = null;
  if (props.selectorItems) {
    currentOrg = props.selectorItems.find((item) => item.current);
  }

  const [originalSortedSelectorITems, setOriginalSortedSelectorItems] = useState<BreadcrumbItem[]>([]);
  const [sortedSelectorItems, setSortedSelectorItems] = useState<BreadcrumbItem[]>([]);

  const { selectorLabel = 'organization', extraItem } = props;
  useEffect(() => {
    if (props.selectorItems) {
      const sorted: BreadcrumbItem[] = props.selectorItems.sort((a: BreadcrumbItem, b: BreadcrumbItem) => {
        const nameA: string = a.name.toLowerCase();
        const nameB: string = b.name.toLowerCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

      setSortedSelectorItems(sorted);
      setOriginalSortedSelectorItems(sorted);
    }
  }, [props.selectorItems]);

  return (
    <div className="rounded-md flex items-center">
      {currentOrg && (
        <Link href={`${currentOrg!.href}`} className="hover:bg-gray-100 border-y border-l rounded-l p-2 p-x-4 flex items-center w-fit text-xs lg:text-sm text-left font-medium text-gray-700">
          {selectorLabel === 'organization' ? (
            <HomeIcon className="shrink-0 h-5 w-5 text-gray-700 mr-2 group-hover:text-gray-500" aria-hidden="true" />
          ) : (
            <ViewListIcon className="shrink-0 h-5 w-5 text-gray-700 mr-2 group-hover:text-gray-500" aria-hidden="true" />
          )}
          {currentOrg?.name}
        </Link>
      )}
      <Menu as="div" className="relative w-fit inline-block text-left">
        <Menu.Button
          className={classNames('hover:bg-gray-100 border p-2 flex items-center w-fit text-xs lg:text-sm text-left font-medium text-gray-700 hover:outline-none', currentOrg ? 'rounded-r' : 'rounded')}
        >
          {!currentOrg ? `Select ${selectorLabel}` : ''}
          <div className={classNames(!currentOrg ? 'pl-2' : '')}>
            <SelectorIcon className="shrink-0 h-5 w-5 text-gray-700 group-hover:text-gray-500" aria-hidden="true" />
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
            <div className="py-1">
              {currentOrg && (
                <h3 className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" id="projects-headline">
                  Organizations
                  {props.commonData.user !== null && (
                    <Link href="/create-organization" className={classNames('float-right text-gray-500 hover:bg-gray-100 hover:text-gray-900', 'text-sm rounded-md')}>
                      <PlusCircleIcon className="w-5 h-5 mr-1" />
                    </Link>
                  )}
                </h3>
              )}
              <div className="px-4 pb-2">
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="text"
                    name="account-number"
                    id="account-number"
                    className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Search"
                    onChange={(e) => {
                      const filtered: BreadcrumbItem[] = originalSortedSelectorITems.filter((x) => x.name.toLowerCase().includes(e.target.value.toLowerCase()));
                      setSortedSelectorItems(filtered);
                    }}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-start" style={{ maxHeight: '380PX', overflow: 'overlay' }}>
                {sortedSelectorItems &&
                  sortedSelectorItems.map((item: BreadcrumbItem) => (
                    <Menu.Item key={item.href}>
                      {({ active }) => (
                        <Link href={item.href} className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm', item.current ? 'font-bold' : 'font-normal')}>
                          {item.name}
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                {extraItem}
              </div>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export { NavigationSelector };
