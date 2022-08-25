import { Dialog, Transition } from '@headlessui/react';
import { CalendarIcon, ChartBarIcon, FolderIcon, HomeIcon, InboxIcon, MenuIcon, UsersIcon, XIcon } from '@heroicons/react/outline';
import { Fragment, useState } from 'react';

import type { LayoutProps } from '@/types/pageWithLayout';
import { useRouter } from 'next/router';

import { Footer } from '../components/Footer';
import { Meta } from './Meta';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const MainLayout: LayoutProps = ({ children }: any) => {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigation = [
    { name: 'Dashboard', href: router.basePath, icon: HomeIcon, current: true },
    {
      name: 'Profile',
      href: `${router.basePath}/profile/fjbarrena`,
      icon: UsersIcon,
      current: false,
    },
    {
      name: '404',
      href: `${router.basePath}/404`,
      icon: FolderIcon,
      current: false,
    },
    {
      name: '500',
      href: `${router.basePath}/500`,
      icon: CalendarIcon,
      current: false,
    },
    {
      name: 'About',
      href: `${router.basePath}/about`,
      icon: InboxIcon,
      current: false,
    },
    {
      name: 'Query Params',
      href: `${router.basePath}/lightside`,
      icon: ChartBarIcon,
      current: false,
    },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <>
      {/*
        This example requires updating your template:
        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
      <Meta title="Next.js Boilerplate Presentation" description="Next js Boilerplate is the perfect starter code for your project. Build your React application with the Next.js framework." />
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-40 flex md:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-600/75" />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative flex w-full max-w-xs flex-1 flex-col bg-indigo-700">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                  <div className="flex shrink-0 items-center px-4">
                    <img className="h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-logo-indigo-300-mark-white-text.svg" alt="Workflow" />
                  </div>
                  <nav className="mt-5 space-y-1 px-2">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current ? 'bg-indigo-800 text-white' : 'text-white hover:bg-indigo-600 hover:bg-opacity-75',
                          'group flex items-center px-2 py-2 text-base font-medium rounded-md',
                        )}
                      >
                        <item.icon className="mr-4 h-6 w-6 shrink-0 text-indigo-300" aria-hidden="true" />
                        {item.name}
                      </a>
                    ))}
                  </nav>
                </div>
                <div className="flex shrink-0 border-t border-indigo-800 p-4">
                  <a href="#" className="group block shrink-0">
                    <div className="flex items-center">
                      <div>
                        <img
                          className="inline-block h-10 w-10 rounded-full"
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                          alt=""
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-base font-medium text-white">Tom Cook</p>
                        <p className="text-sm font-medium text-indigo-200 group-hover:text-white">View profile</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </Transition.Child>
            <div className="w-14 shrink-0" aria-hidden="true">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex min-h-0 flex-1 flex-col bg-indigo-700">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex shrink-0 items-center px-4">
                <img className="h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-logo-indigo-300-mark-white-text.svg" alt="Workflow" />
              </div>
              <nav className="mt-5 flex-1 space-y-1 px-2">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current ? 'bg-indigo-800 text-white' : 'text-white hover:bg-indigo-600 hover:bg-opacity-75',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    )}
                  >
                    <item.icon className="mr-3 h-6 w-6 shrink-0 text-indigo-300" aria-hidden="true" />
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex shrink-0 border-t border-indigo-800 p-4">
              <a href="#" className="group block w-full shrink-0">
                <div className="flex items-center">
                  <div>
                    <img
                      className="inline-block h-9 w-9 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">Tom Cook</p>
                    <p className="text-xs font-medium text-indigo-200 group-hover:text-white">View profile</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col md:pl-64">
          <div className="sticky top-0 z-10 bg-gray-100 pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              </div>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                {/* Replace with your content */}
                {children}
                {/* /End replace */}
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="mt-10">
        <Footer />
      </div>
    </>
  );
};
export default MainLayout;
