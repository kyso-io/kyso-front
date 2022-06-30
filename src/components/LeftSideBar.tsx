import type { ReactNode } from "react";
import { type LeftMenuItem } from "@/model/left-menu-item.model";

type ILeftSideBarProps = {
  meta: ReactNode;
  children: ReactNode;
  navigation: LeftMenuItem[];
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const LeftSideBar = (props: ILeftSideBarProps) => (
  <>
    {props.meta}
    <div>
      {/* Static sidebar for desktop */}
      <div className="h-full md:fixed md:flex md:w-64 md:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-kyso-tertiary">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 space-y-1 px-2" aria-label="Sidebar">
              {props.navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-gray-100 text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  )}
                >
                  <item.icon
                    className={classNames(
                      item.current
                        ? "text-gray-500"
                        : "text-gray-400 group-hover:text-gray-500",
                      "mr-3 flex-shrink-0 h-6 w-6"
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.count ? (
                    <span
                      className={classNames(
                        item.current
                          ? "bg-white"
                          : "bg-gray-100 group-hover:bg-gray-200",
                        "ml-3 inline-block py-0.5 px-3 text-xs font-medium rounded-full"
                      )}
                    >
                      {item.count}
                    </span>
                  ) : null}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col md:pl-64">
        <main>
          <div className="py-6">
            <div className="max-w-7xl px-2 sm:px-2 md:px-12">
              {/* Replace with your content */}
              {props.children}
              {/* /End replace */}
            </div>
          </div>
        </main>
      </div>
    </div>
  </>
);

export { LeftSideBar };
