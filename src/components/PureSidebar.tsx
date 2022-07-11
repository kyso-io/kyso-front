import type { ReactNode } from "react";
import { type LeftMenuItem } from "@/model/left-menu-item.model";
import type { OrganizationSelectorItem } from "@/model/organization-selector-item.model";
import { OrganizationSelector } from "./OrganizationSelector";

type IPureSidebarProps = {
  meta: ReactNode;
  children: ReactNode;
  navigation: LeftMenuItem[];
  organizationSelectorItems: OrganizationSelectorItem[];
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const PureSidebar = (props: IPureSidebarProps) => {
  return (
    <>
      {props.meta}
      <div>
        <div className="md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 mt-16 bg-neutral-100">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-20">
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
              <div className="flex items-center shrink-0 mb-4">
                <OrganizationSelector
                  organizationSelectorItems={props.organizationSelectorItems}
                />
              </div>

              <div className="pt-4">
                <p
                  className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  id="communities-headline"
                >
                  Channels
                </p>
                <div
                  className="mt-3 space-y-2"
                  aria-labelledby="communities-headline"
                >
                  {props.navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        "group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md",
                        "hover:text-gray-900 hover:bg-white",
                        item.current ? "font-bold" : "font-normal"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.current
                            ? "text-gray-500"
                            : "text-gray-400 group-hover:text-gray-500",
                          "flex-shrink-0 -ml-1 mr-2 h-5 w-5"
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:pl-64 flex flex-col flex-1 bg-neutral-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { PureSidebar };
