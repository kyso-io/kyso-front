import { Disclosure, Menu, Transition } from "@headlessui/react";
import { BellIcon, MenuIcon, XIcon } from "@heroicons/react/outline";
import { Fragment } from "react";
import type { LayoutProps } from "@/types/pageWithLayout";
import { useSelector } from "react-redux";
import { selectUser } from "@kyso-io/kyso-store";
import type { User } from "@kyso-io/kyso-model";
import { Sanitizer } from "@/helpers/Sanitizer";
import { useRouter } from "next/router";
import { Helper } from "@/helpers/Helper";
import { Footer } from "../components/Footer";

const KysoTopBar: LayoutProps = ({ children }: any) => {
  const router = useRouter();

  const user: User = Sanitizer.ifNullReturnDefault(useSelector<User>(selectUser), undefined) as User;

  const navigation: any[] = [];

  let slugifiedName = "";
  if (user) {
    slugifiedName = Helper.slugify(user?.display_name);
  }

  const userNavigation = [
    { name: "Your Profile", href: `${router.basePath}/user/${slugifiedName}` },
    {
      name: "Your settings",
      href: `${router.basePath}/user/${slugifiedName}/settings`,
    },
    { name: "Sign out", href: `${router.basePath}/logout` },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <>
      <div className="h-[64px] min-h-full">
        <Disclosure as="div" className="fixed z-10 w-screen bg-neutral-400">
          {({ open }) => (
            <>
              <div className="mx-auto px-4 sm:px-6 lg:px-8 text-white">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <a href={router.basePath}>
                        <img className="h-8 w-8" src={`/in/assets/images/kyso-logo-white.svg`} alt="Kyso" />
                      </a>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      {/* Profile dropdown */}
                      {user && (
                        <Menu as="div" className="relative ml-3">
                          <div>
                            <Menu.Button className="flex max-w-xs items-center rounded-full bg-indigo-600 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                              <span className="sr-only">Open user menu</span>
                              <img className="object-cover h-8 w-8 rounded-full" src={user.avatar_url} alt="" />
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
                            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                              {userNavigation.map((item) => (
                                <Menu.Item key={item.name}>
                                  {({ active }) => (
                                    <a href={item.href} className={classNames(active ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}>
                                      {item.name}
                                    </a>
                                  )}
                                </Menu.Item>
                              ))}
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      )}
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500/75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                      <span className="sr-only">Open main menu</span>
                      {open ? <XIcon className="block h-6 w-6" aria-hidden="true" /> : <MenuIcon className="block h-6 w-6" aria-hidden="true" />}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(item.current ? "bg-indigo-700 text-white" : "text-white hover:bg-indigo-500/75", "block px-3 py-2 rounded-md text-base font-medium")}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="border-t border-indigo-700 pt-4 pb-3">
                  {user && (
                    <div className="flex items-center px-5">
                      <div className="shrink-0">
                        <img className="object-cover h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-white">{user.display_name}</div>
                        <div className="text-sm font-medium text-indigo-300">{user.email}</div>
                      </div>
                      <button
                        type="button"
                        className="ml-auto shrink-0 rounded-full bg-indigo-600 p-1 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                  <div className="mt-3 space-y-1 px-2">
                    {userNavigation.map((item) => (
                      <Disclosure.Button key={item.name} as="a" href={item.href} className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500/75">
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
      {children}
      <Footer />
    </>
  );
};
export default KysoTopBar;
