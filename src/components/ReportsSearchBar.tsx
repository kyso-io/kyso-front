/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Menu, Transition } from '@headlessui/react';
import { CheckIcon, XIcon } from '@heroicons/react/solid';
import clsx from 'clsx';
import moment from 'moment';
import { Calendar } from 'primereact/calendar';
import React, { useMemo, useRef, useState } from 'react';

import { SaveIcon } from '@heroicons/react/outline';
import 'primeicons/primeicons.css'; // icons
import 'primereact/resources/primereact.min.css'; // core css
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // theme
import { useClickOutside } from '../hooks/use-click-outside';
import type { Member } from '../types/member';

interface Filter {
  key: string;
  label: string;
  modificable: boolean;
  type?: 'user' | 'tag' | 'date' | 'author-operator' | 'date-operator';
  image?: string;
}

const SHOW_NEXT_FILTER_MS = 250;

const INITIAL_FILTERS: Filter[] = [
  {
    key: 'author',
    label: 'Author',
    modificable: false,
  },
  {
    key: 'tag',
    label: 'Tag',
    modificable: false,
  },
  {
    key: 'creationDate',
    label: 'Creation date',
    modificable: false,
  },
  {
    key: 'lastUpdated',
    label: 'Last updated',
    modificable: false,
  },
  {
    key: 'myPinned',
    label: 'My pinned',
    modificable: false,
  },
];

const AUTHOR_OPERATORS_FILTERS: Filter[] = [
  { key: '=', label: '=', modificable: true, type: 'author-operator' },
  { key: '!=', label: '!=', modificable: true, type: 'author-operator' },
];

const DATE_OPERATORS: Filter[] = [
  { key: '<', label: '<', modificable: true, type: 'date-operator' },
  { key: '>', label: '>', modificable: true, type: 'date-operator' },
  { key: '=', label: '=', modificable: true, type: 'date-operator' },
];

interface MenuItemsProps {
  filters: Filter[];
  onSelect: (filter: Filter) => void;
  onClickOutside?: () => void;
}

const MenuItems = ({ filters, onSelect, onClickOutside }: MenuItemsProps) => {
  const wrapperRef = useRef(null);
  useClickOutside(wrapperRef, onClickOutside);
  return (
    <Menu.Items ref={wrapperRef} className="origin-top-right mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity/5 focus:outline-none">
      <div className="py-1">
        {filters.map((filter: Filter, index: number) => (
          <Menu.Item key={index}>
            {({ active }) => (
              <a href="#" onClick={() => onSelect(filter)} className={clsx(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm')}>
                {filter.label}
              </a>
            )}
          </Menu.Item>
        ))}
      </div>
    </Menu.Items>
  );
};

interface InputTagProps {
  value: string;
  onSave: (value: string) => void;
  onClickOutside?: () => void;
}

const InputTag = ({ value, onSave, onClickOutside }: InputTagProps) => {
  const wrapperRef = useRef(null);
  const [tag, setTag] = useState<string>(value || '');
  useClickOutside(wrapperRef, onClickOutside);

  return (
    <div ref={wrapperRef} className="w-80 origin-top-right mt-2 p-4 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity/5 focus:outline-none">
      <label className="block text-sm font-medium text-gray-700">Tag:</label>
      <div className="mt-1 relative flex items-center">
        <input
          type="text"
          value={tag}
          autoFocus
          onChange={(e) => setTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave(tag);
              setTag('');
            }
          }}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-SHOW_NEXT_FILTER_MS rounded-md"
        />
        <div
          className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5"
          onClick={() => {
            if (tag) {
              onSave(tag);
            }
            setTag('');
          }}
        >
          <kbd className="inline-flex items-center border border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400">
            <CheckIcon className="w-4 h-4 m-1" />
          </kbd>
        </div>
      </div>
    </div>
  );
};

interface MyCalendarProps {
  value: Date;
  onChange: (date: Date) => void;
  onClickOutside?: () => void;
}

const MyCalendar = ({ value, onChange, onClickOutside }: MyCalendarProps) => {
  const wrapperRef = useRef(null);
  useClickOutside(wrapperRef, onClickOutside);

  return (
    <div ref={wrapperRef} className="origin-top-right mt-2 p-4 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity/5 focus:outline-none" style={{ width: 500 }}>
      <Calendar
        value={value}
        onChange={(e) => {
          if (e.value && moment(e.value as Date).isValid()) {
            onChange(e.value as Date);
          }
        }}
        inline
        showWeek
      />
    </div>
  );
};

interface ReportsSearchBarProps {
  onSaveSearch: () => void;
  members: Member[];
}

const ReportsSearchBar = ({ members, onSaveSearch }: ReportsSearchBarProps) => {
  const [selectedFilters, setSelectedFilters] = useState<Filter[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<any | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const buttonRef = useRef(null);

  const USERS_FILTERS: Filter[] = useMemo(
    () =>
      members.map((member: Member) => ({
        key: member.id,
        label: member.username,
        modificable: true,
        type: 'user',
        image: member.avatar_url,
      })),
    [members],
  );

  return (
    <div className="flex flex-row content-center items-center">
      <Menu as="div" className="relative inline-block text-left w-full">
        <React.Fragment>
          <Menu.Button
            ref={buttonRef}
            className="w-full"
            onClick={() => {
              let component = null;
              if (selectedFilters.length) {
                switch (selectedFilters[selectedFilters.length - 1]?.key) {
                  case 'author':
                    component = (
                      <MenuItems
                        filters={AUTHOR_OPERATORS_FILTERS}
                        onSelect={(filter: Filter) => {
                          setSelectedFilters([...selectedFilters, filter]);
                          setShowMenu(false);
                          setSelectedComponent(null);
                          setTimeout(() => {
                            (buttonRef.current as any).click();
                          }, SHOW_NEXT_FILTER_MS);
                        }}
                        onClickOutside={() => {
                          setShowMenu(false);
                          setSelectedComponent(null);
                        }}
                      />
                    );
                    break;
                  case 'tag':
                    component = (
                      <MenuItems
                        filters={[{ key: '=', label: '=', modificable: false }]}
                        onSelect={(filter: Filter) => {
                          setSelectedFilters([...selectedFilters, filter]);
                          setShowMenu(false);
                          setSelectedComponent(null);
                          setTimeout(() => {
                            (buttonRef.current as any).click();
                          }, SHOW_NEXT_FILTER_MS);
                        }}
                        onClickOutside={() => {
                          setShowMenu(false);
                          setSelectedComponent(null);
                        }}
                      />
                    );
                    break;
                  case 'creationDate':
                    component = (
                      <MenuItems
                        filters={DATE_OPERATORS}
                        onSelect={(filter: Filter) => {
                          setSelectedFilters([...selectedFilters, filter]);
                          setShowMenu(false);
                          setSelectedComponent(null);
                          setTimeout(() => {
                            (buttonRef.current as any).click();
                          }, SHOW_NEXT_FILTER_MS);
                        }}
                        onClickOutside={() => {
                          setShowMenu(false);
                          setSelectedComponent(null);
                        }}
                      />
                    );
                    break;
                  case 'lastUpdated':
                    component = (
                      <MenuItems
                        filters={DATE_OPERATORS}
                        onSelect={(filter: Filter) => {
                          setSelectedFilters([...selectedFilters, filter]);
                          setShowMenu(false);
                          setSelectedComponent(null);
                          setTimeout(() => {
                            (buttonRef.current as any).click();
                          }, SHOW_NEXT_FILTER_MS);
                        }}
                        onClickOutside={() => {
                          setShowMenu(false);
                          setSelectedComponent(null);
                        }}
                      />
                    );
                    break;
                  case '=':
                  case '!=':
                  case '<':
                  case '>':
                    switch (selectedFilters[selectedFilters.length - 2]?.key) {
                      case 'author':
                        component = (
                          <MenuItems
                            filters={USERS_FILTERS}
                            onSelect={(filter: Filter) => {
                              setSelectedFilters([...selectedFilters, filter]);
                              setShowMenu(false);
                              setSelectedComponent(null);
                            }}
                            onClickOutside={() => {
                              setShowMenu(false);
                              setSelectedComponent(null);
                            }}
                          />
                        );
                        break;
                      case 'tag':
                        component = (
                          <InputTag
                            value={''}
                            onSave={(value: string) => {
                              if (value) {
                                setSelectedFilters([...selectedFilters, { key: value, label: value, modificable: true, type: 'tag' }]);
                                setShowMenu(false);
                                setSelectedComponent(null);
                              }
                            }}
                            onClickOutside={() => {
                              setShowMenu(false);
                              setSelectedComponent(null);
                            }}
                          />
                        );
                        break;
                      case 'creationDate':
                        component = (
                          <MyCalendar
                            value={new Date()}
                            onChange={(date: Date) => {
                              setSelectedFilters([
                                ...selectedFilters,
                                {
                                  key: '',
                                  label: moment(date).format('YYYY-MM-DD'),
                                  modificable: true,
                                  type: 'date',
                                },
                              ]);
                              setShowMenu(false);
                              setSelectedComponent(null);
                            }}
                            onClickOutside={() => {
                              setShowMenu(false);
                              setSelectedComponent(null);
                            }}
                          />
                        );
                        setShowMenu(true);
                        break;
                      case 'lastUpdated':
                        component = (
                          <MyCalendar
                            value={new Date()}
                            onChange={(date: Date) => {
                              setSelectedFilters([
                                ...selectedFilters,
                                {
                                  key: '',
                                  label: moment(date).format('YYYY-MM-DD'),
                                  modificable: true,
                                  type: 'date',
                                },
                              ]);
                              setShowMenu(false);
                              setSelectedComponent(null);
                            }}
                            onClickOutside={() => {
                              setShowMenu(false);
                              setSelectedComponent(null);
                            }}
                          />
                        );
                        setShowMenu(true);
                        break;
                      default:
                        break;
                    }
                    break;
                  default:
                    component = (
                      <MenuItems
                        filters={INITIAL_FILTERS.filter((filter: Filter) => {
                          const index: number = selectedFilters.findIndex((sf: Filter) => filter.key === sf.key);
                          return index === -1;
                        })}
                        onSelect={(filter: Filter) => {
                          setSelectedFilters([...selectedFilters, filter]);
                          setShowMenu(false);
                          setSelectedComponent(null);
                          setTimeout(() => {
                            (buttonRef.current as any).click();
                          }, SHOW_NEXT_FILTER_MS);
                        }}
                        onClickOutside={() => {
                          setShowMenu(false);
                          setSelectedComponent(null);
                        }}
                      />
                    );
                    break;
                }
              } else {
                component = (
                  <MenuItems
                    filters={INITIAL_FILTERS}
                    onSelect={(filter: Filter) => {
                      setSelectedFilters([...selectedFilters, filter]);
                      setShowMenu(false);
                      setSelectedComponent(null);
                      setTimeout(() => {
                        (buttonRef.current as any).click();
                      }, SHOW_NEXT_FILTER_MS);
                    }}
                    onClickOutside={() => {
                      setShowMenu(false);
                      setSelectedComponent(null);
                    }}
                  />
                );
              }
              setSelectedComponent(component);
              setShowMenu(true);
            }}
          >
            <div className="mt-1 relative flex items-center content-center w-full">
              <div className="shadow-sm  block w-full pr-12 sm:text-sm border-gray-300 rounded-md" style={{ height: 40 }}></div>
              <div className="absolute inset-y-0 flex py-1.5 pr-1.5">
                {selectedFilters.map((selectedFilter: Filter, index: number) => (
                  <kbd
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!selectedFilter.modificable) {
                        return;
                      }
                      let component = null;
                      switch (selectedFilter.type) {
                        case 'user':
                          component = (
                            <MenuItems
                              filters={USERS_FILTERS}
                              onSelect={(filter: Filter) => {
                                const fs: Filter[] = [...selectedFilters];
                                fs[index] = filter;
                                setSelectedFilters(fs);
                                setShowMenu(false);
                                setSelectedComponent(null);
                              }}
                              onClickOutside={() => {
                                setShowMenu(false);
                                setSelectedComponent(null);
                              }}
                            />
                          );
                          break;
                        case 'author-operator':
                          component = (
                            <MenuItems
                              filters={AUTHOR_OPERATORS_FILTERS}
                              onSelect={(filter: Filter) => {
                                const fs: Filter[] = [...selectedFilters];
                                fs[index] = filter;
                                setSelectedFilters(fs);
                                setShowMenu(false);
                                setSelectedComponent(null);
                              }}
                              onClickOutside={() => {
                                setShowMenu(false);
                                setSelectedComponent(null);
                              }}
                            />
                          );
                          break;
                        case 'tag':
                          component = (
                            <InputTag
                              value={selectedFilters[index]!.key}
                              onSave={(value: string) => {
                                if (value) {
                                  const fs: Filter[] = [...selectedFilters];
                                  fs[index]!.key = value;
                                  fs[index]!.label = value;
                                  setSelectedFilters(fs);
                                  setShowMenu(false);
                                  setSelectedComponent(null);
                                }
                              }}
                              onClickOutside={() => {
                                setShowMenu(false);
                                setSelectedComponent(null);
                              }}
                            />
                          );
                          break;
                        case 'date-operator':
                          component = (
                            <MenuItems
                              filters={DATE_OPERATORS}
                              onSelect={(filter: Filter) => {
                                const fs: Filter[] = [...selectedFilters];
                                fs[index] = filter;
                                setSelectedFilters(fs);
                                setShowMenu(false);
                                setSelectedComponent(null);
                              }}
                              onClickOutside={() => {
                                setShowMenu(false);
                                setSelectedComponent(null);
                              }}
                            />
                          );
                          break;
                        case 'date':
                          component = (
                            <MyCalendar
                              value={moment(selectedFilters[index]!.label).toDate()}
                              onChange={(date: Date) => {
                                const fs: Filter[] = [...selectedFilters];
                                fs[index]!.label = moment(date).format('YYYY-MM-DD');
                                setShowMenu(false);
                                setSelectedComponent(null);
                              }}
                              onClickOutside={() => {
                                setShowMenu(false);
                                setSelectedComponent(null);
                              }}
                            />
                          );
                          break;
                        default:
                          break;
                      }
                      setShowMenu(true);
                      setSelectedComponent(component);
                    }}
                    className={clsx(
                      'mx-1 inline-flex items-center border border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400',
                      selectedFilter.modificable ? 'cursor-pointer' : 'cursor-default',
                    )}
                  >
                    {selectedFilter.label}
                    {index === selectedFilters.length - 1 && (
                      <span
                        className="text-gray-400 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          const sfs: Filter[] = [...selectedFilters];
                          sfs.splice(index, 1);
                          setSelectedFilters(sfs);
                          setShowMenu(false);
                          setSelectedComponent(null);
                        }}
                      >
                        <XIcon className="w-4 h-4 ml-1" />
                      </span>
                    )}
                  </kbd>
                ))}
              </div>
              {selectedFilters.length > 0 && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFilters([]);
                  }}
                  className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5 cursor-pointer"
                >
                  <XIcon className="text-slate-500 w-6 h-6" />
                </div>
              )}
            </div>
          </Menu.Button>
          {selectedComponent !== null && (
            <Transition
              // show={open || showMenu}
              show={showMenu}
              as={React.Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              {(ref) => <div ref={ref}>{selectedComponent}</div>}
            </Transition>
          )}
        </React.Fragment>
      </Menu>
      <SaveIcon onClick={onSaveSearch} className="cursor-pointer w-6 h-6 ml-2" />
    </div>
  );
};

export default ReportsSearchBar;
