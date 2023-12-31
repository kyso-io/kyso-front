import { SkeletonTemplates } from '@/enums/skeleton-templates';
import KTasksIcon from '@/icons/KTasksIcon';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { CommonData } from '@/types/common-data';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { SearchIcon } from '@heroicons/react/outline';
import { MenuIcon, XIcon } from '@heroicons/react/solid';
import type { NormalizedResponseDTO, ReportDTO } from '@kyso-io/kyso-model';
import { KysoEventEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import Link from 'next/link';
import { useRouter } from 'next/router';
import 'primereact/resources/primereact.min.css'; // core css
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // theme
import type { ReactElement } from 'react';
import React, { Fragment, useEffect, useState } from 'react';
import eventBus from '../helpers/event-bus';
import BreadcrumbNavbar from './BreadcrumbNavbar';
import DelayedContent from './DelayedContent';
import { Footer } from './Footer';
import PureAvatar from './PureAvatar';
import PureOnboardingDropdown from './PureOnboardingDropdown';
import PureShareButton from './PureShareButton';

type IPureKysoApplicationLayoutProps = {
  children: ReactElement;
  report: ReportDTO | null | undefined;
  basePath: string;
  userNavigation: { name: string; href?: string; newTab: boolean; callback?: () => void }[];
  commonData: CommonData;
};

const PureKysoApplicationLayout = (props: IPureKysoApplicationLayoutProps): ReactElement => {
  const router = useRouter();
  const { children, report, commonData, basePath, userNavigation } = props;
  const [focusOnSearchInput, setFocusOnSearchInput] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
  const currentUrl = `${origin}${router.asPath}`;
  const [numOpenedInlineComments, setNumOpenedInlineComments] = useState<number>(-1);

  const { q } = router.query;

  useEffect(() => {
    if (!commonData.token) {
      return undefined;
    }
    eventBus.on(KysoEventEnum.INLINE_COMMENTS_CREATE, () => {
      getNumOpenedInlineComments();
    });
    eventBus.on(KysoEventEnum.INLINE_COMMENTS_UPDATE, () => {
      getNumOpenedInlineComments();
    });
    eventBus.on(KysoEventEnum.INLINE_COMMENTS_DELETE, () => {
      getNumOpenedInlineComments();
    });
    return () => {
      eventBus.remove(KysoEventEnum.INLINE_COMMENTS_CREATE, () => {});
      eventBus.remove(KysoEventEnum.INLINE_COMMENTS_UPDATE, () => {});
      eventBus.remove(KysoEventEnum.INLINE_COMMENTS_DELETE, () => {});
    };
  }, [commonData.token]);

  useEffect(() => {
    if (!commonData.token || !commonData.user) {
      return;
    }
    getNumOpenedInlineComments();
  }, [router]);

  useEffect(() => {
    if (!commonData.token || !commonData.user) {
      return;
    }
    getNumOpenedInlineComments();
  }, [commonData.user]);

  useEffect(() => {
    setQuery(q as string);
  }, [q]);

  const getNumOpenedInlineComments = async () => {
    try {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<number> = await api.countOpenedInlineComments();
      if (result && result.data) {
        setNumOpenedInlineComments(result.data);
      } else {
        setNumOpenedInlineComments(0);
      }
    } catch (e) {
      setNumOpenedInlineComments(0);
    }
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const navigation: any[] = [];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  let userProfile = false;
  if (router.query.username) {
    userProfile = true;
  }

  const settings: boolean = router.pathname.includes('/settings');

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col z-10 w-screen border-b">
        <Disclosure as="div" className="header k-bg-primary">
          {({ open }) => (
            <>
              <div className="mx-auto px-4 sm:px-6 lg:px-8 text-white">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      {/* This always must redirect to the homepage */}
                      <a href={commonData.user !== null ? '/' : 'https://about.kyso.io/'}>
                        <img className="h-8 w-8" src={`/assets/images/kyso-logo-white.svg`} alt="Kyso" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {/* Start Search input */}
                    <div className="hidden lg:block mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        className="text-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 px-4 rounded-full"
                        style={{ height: 35, width: focusOnSearchInput || query ? '400px' : 'auto' }}
                        placeholder="Search on Kyso"
                        value={query || ''}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setFocusOnSearchInput(true)}
                        onBlur={() => setFocusOnSearchInput(false)}
                        onKeyUp={(e) => {
                          if (e.key === 'Enter') {
                            router.push(query ? `/search?q=${query}` : '/search');
                            setQuery('');
                          }
                        }}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <SearchIcon className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                    {/* End Search input */}
                    <div className="md:block">
                      <div className="flex items-center ml-6">
                        {/* Profile dropdown */}
                        {!commonData.user && (
                          <DelayedContent skeletonTemplate={<></>} delay={1600}>
                            <div className="flex items-center px-5">
                              <button
                                className="text-black ml-3 inline-flex justify-center rounded-md border border-transparent bg-white py-2 px-4 text-sm font-medium shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                onClick={() => {
                                  router.push('/login');
                                }}
                              >
                                Login
                              </button>
                            </div>
                          </DelayedContent>
                        )}
                        {commonData.user && (
                          <React.Fragment>
                            {
                              <div className="flex items-center pr-5 cursor-pointer">
                                <Link href="/tasks" type="button" className="relative inline-flex items-center p-3 text-sm font-medium text-center text-white" title="Tasks">
                                  <KTasksIcon className="w-6 h-6 text-white" />

                                  <span className="sr-only">Notifications</span>
                                  <div
                                    className="absolute inline-flex items-center justify-center w-6 h-6 font-bold text-white bg-white border-white rounded-full -top-0.5 -right-0.5"
                                    style={{ color: '#244362', fontSize: '10px' }}
                                  >
                                    {numOpenedInlineComments > 99 ? '99+' : <></>}
                                    {numOpenedInlineComments <= 99 && numOpenedInlineComments >= 0 ? numOpenedInlineComments : <></>}
                                    {numOpenedInlineComments < 0 ? (
                                      <div className="inline-flex items-center rounded-md transition ease-in-out duration-150 cursor-not-allowed">
                                        <div className="animate-bounce">...</div>
                                      </div>
                                    ) : (
                                      <></>
                                    )}
                                  </div>
                                </Link>
                              </div>
                            }
                            <Menu as="div" className="relative">
                              <div>
                                <Menu.Button className="flex max-w-xs items-center rounded-full text-sm hover:text-gray-300">
                                  <span className="sr-only">Open user menu</span>
                                  <DelayedContent skeletonTemplate={SkeletonTemplates.PORTRAIT_PLACEHOLDER}>
                                    <PureAvatar src={commonData.user.avatar_url} title={commonData.user.display_name} size={TailwindHeightSizeEnum.H8} textSize={TailwindFontSizeEnum.XS} />
                                  </DelayedContent>
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
                                <Menu.Items className="z-50 absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                                  {userNavigation.map((item) => (
                                    <Menu.Item key={item.name}>
                                      {({ active }) => {
                                        if (item.callback) {
                                          return (
                                            <button className={classNames(active ? 'bg-gray-100' : '', 'w-full text-left px-4 py-2 text-sm text-gray-700')} onClick={item.callback}>
                                              {item.name}
                                            </button>
                                          );
                                        }
                                        return (
                                          <Link
                                            href={item.href!}
                                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                            target={classNames(item.newTab ? '_blank' : '')}
                                          >
                                            {item.name}
                                          </Link>
                                        );
                                      }}
                                    </Menu.Item>
                                  ))}
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </React.Fragment>
                        )}
                        <div className="flex items-center px-5 cursor-pointer">
                          <PureShareButton title="Share page" description="Send this url to someone to share this page" iconClasses={'text-white h-6 w-6'} buttonClasses="" url={currentUrl} />
                        </div>
                        {commonData.user && (
                          <div className="flex items-center mr-2 cursor-pointer">
                            <PureOnboardingDropdown user={commonData.user} />
                          </div>
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
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(item.current ? 'bg-indigo-700 text-white' : 'text-white hover:bg-indigo-500/75', 'block px-3 py-2 rounded-md text-base font-medium')}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="border-t border-indigo-700 pt-4 pb-3">
                  {commonData.user && (
                    <div className="flex items-center px-5">
                      <div className="shrink-0">
                        <PureAvatar src={commonData.user.avatar_url} title={commonData.user.display_name} size={TailwindHeightSizeEnum.H8} textSize={TailwindFontSizeEnum.XL} />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-white">{commonData.user.display_name}</div>
                        <div className="text-sm font-medium text-indigo-300">{commonData.user.email}</div>
                      </div>
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
        {!userProfile && !settings && router.query.organizationName && (
          <div className="p-2 z-40 bg-white">
            <BreadcrumbNavbar basePath={basePath} commonData={commonData} report={report} />
          </div>
        )}
      </div>

      <div className="grow w-full rounded">{children}</div>
      <div className="flex-none pt-10 z-10">
        <Footer />
      </div>
    </div>
  );
};
export default PureKysoApplicationLayout;
