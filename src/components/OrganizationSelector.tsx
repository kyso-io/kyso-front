import type { OrganizationSelectorItem } from "@/model/organization-selector-item.model";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { SelectorIcon } from "@heroicons/react/solid";

type IOrganizationSelectorProps = {
  organizationSelectorItems: OrganizationSelectorItem[];
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const OrganizationSelector = (props: IOrganizationSelectorProps) => {
  let currentOrg = null;
  if (props.organizationSelectorItems) {
    currentOrg = props.organizationSelectorItems.find((item) => item.current);
  }

  // if (!currentOrg) return <div />

  return (
    <Menu as="div" className="relative w-full inline-block text-left">
      <div>
        <Menu.Button className="group w-full bg-gray-100 rounded-md px-3.5 py-2 text-sm text-left font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-purple-500">
          <span className="flex w-full justify-between items-center">
            <span className="flex min-w-0 items-center justify-between space-x-3">
              {/* <img
                className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"
                src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=256&h=256&q=80"
                alt=""
              /> */}

              <span className="flex-1 flex flex-col min-w-0">
                <span className="text-gray-900 text-sm font-medium truncate">{currentOrg ? currentOrg.name : "Select organization"}</span>
                <span className="text-gray-500 text-sm truncate">{currentOrg?.href}</span>
              </span>
            </span>
            <SelectorIcon className="shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
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
        <Menu.Items className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-slate-200 ring-opacity/5 divide-y divide-gray-100 focus:outline-none">
          {currentOrg && (
            <div className="px-4 py-3">
              <p className="text-sm">Current organisation</p>
              <p className="text-sm font-medium text-gray-900 truncate">{currentOrg && currentOrg.name}</p>
              <p className="text-sm truncate text-indigo-500 mt-4">
                <a href={`${currentOrg && currentOrg.href}`}>Go to dashboard</a>
              </p>
              <p className="text-sm truncate text-indigo-500 mt-4">
                <a href={`${currentOrg && currentOrg.href}/settings`}>Go to organization settings</a>
              </p>
            </div>
          )}
          <div className="py-1">
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900 truncate">Select organization</p>
            </div>

            {props.organizationSelectorItems &&
              props.organizationSelectorItems.map((organizationSelectorItem) => (
                <Menu.Item key={organizationSelectorItem.href}>
                  {({ active }) => (
                    <a
                      href={organizationSelectorItem.href}
                      className={classNames(active ? "bg-gray-100 text-gray-900" : "text-gray-700", "block px-4 py-2 text-sm", organizationSelectorItem.current ? "font-bold" : "font-normal")}
                    >
                      {organizationSelectorItem.name}
                    </a>
                  )}
                </Menu.Item>
              ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export { OrganizationSelector };