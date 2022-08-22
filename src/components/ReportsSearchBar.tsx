/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Menu, Transition } from '@headlessui/react';
import { CheckIcon, XIcon } from '@heroicons/react/solid';
import clsx from 'clsx';
import moment from 'moment';
import { Calendar } from 'primereact/calendar';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { SaveIcon } from '@heroicons/react/outline';
import type { SearchUser, UserDTO } from '@kyso-io/kyso-model';
import 'primeicons/primeicons.css'; // icons
import 'primereact/resources/primereact.min.css'; // core css
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // theme
import { useClickOutside } from '../hooks/use-click-outside';
import type { ReportsFilter } from '../interfaces/reports-filter';
import type { Member } from '../types/member';
import PureAvatar from './PureAvatar';

const SHOW_NEXT_FILTER_MS = 200;

const AUTHOR_OPERATORS_FILTERS: ReportsFilter[] = [
  { key: '=', label: '=', modificable: true, type: 'author_ids-operator', isLeaf: false },
  { key: '!=', label: '!=', modificable: true, type: 'author_ids-operator', isLeaf: false },
];

const DATE_OPERATORS: ReportsFilter[] = [
  { key: '<', label: '<', modificable: true, type: 'date-operator', isLeaf: false },
  { key: '>', label: '>', modificable: true, type: 'date-operator', isLeaf: false },
  { key: '=', label: '=', modificable: true, type: 'date-operator', isLeaf: false },
];

interface MenuItemsProps {
  filters: ReportsFilter[];
  onSelect: (filter: ReportsFilter) => void;
  onClickOutside?: () => void;
}

const MenuItems = ({ filters, onSelect, onClickOutside }: MenuItemsProps) => {
  const wrapperRef = useRef(null);
  useClickOutside(wrapperRef, onClickOutside);
  return (
    <Menu.Items ref={wrapperRef} className="origin-top-right mt-2 w-56 rounded-md shadow-lg bg-white ring-opacity/5 focus:outline-none">
      <div className="py-1">
        {filters.map((filter: ReportsFilter, index: number) => (
          <Menu.Item key={index}>
            {({ active }) => (
              <div className={clsx(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'flex flex-row px-4 py-2 text-sm cursor-default')} onClick={() => onSelect(filter)}>
                {filter?.image && (
                  <div className="mr-4">
                    <PureAvatar src={filter.image as string} title={filter.label as string} />
                  </div>
                )}
                <span>{filter.label}</span>
              </div>
            )}
          </Menu.Item>
        ))}
      </div>
    </Menu.Items>
  );
};

interface MenuMultipleItemsProps {
  filter: ReportsFilter;
  options: { image?: string; label: string; value: string }[];
  onClickOutside: (filter: ReportsFilter | null) => void;
}

const MenuMultipleItems = ({ filter, options, onClickOutside }: MenuMultipleItemsProps) => {
  const wrapperRef = useRef(null);
  const [selected, setSelected] = useState<{ image?: string; label: string; value: string }[]>([]);

  useEffect(() => {
    const s: { image?: string; label: string; value: string }[] = [];
    (filter.key as string[]).forEach((key: string, index: number) => {
      s.push({
        value: key,
        label: (filter.label as string[])[index]!,
        image: filter.image ? (filter.image as string[])[index]! : '',
      });
    });
    setSelected(s);
  }, []);

  const wrapperOnClickOutside = () => {
    const data: ReportsFilter = {
      key: selected.map((s) => s.value),
      label: selected.map((s) => s.label),
      image: selected.map((s) => s.image || ''),
      type: filter.type,
      isLeaf: filter.isLeaf,
      modificable: filter.modificable,
    };
    onClickOutside(data);
  };

  useClickOutside(wrapperRef, wrapperOnClickOutside);

  return (
    <Menu.Items ref={wrapperRef} className="origin-top-right mt-2 w-64 rounded-md shadow-lg bg-white ring-opacity/5 focus:outline-none" style={{ maxHeight: 200, overflowY: 'scroll' }}>
      <div className="py-1">
        {options.map((option: { image?: string; label: string; value: string }, index: number) => {
          const indexChecked: number = selected.findIndex((s: { image?: string; label: string; value: string }) => s.value === option.value);
          return (
            <Menu.Item key={index}>
              {({ active }) => (
                <div className={clsx(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'relative flex items-start p-4 py-2 text-sm')}>
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="flex flex-row">
                      <div className="mr-4">{option?.image && <PureAvatar src={option.image} title={option.label} />}</div>
                      <label className="font-medium text-gray-700 select-none">{option.label}</label>
                    </div>
                  </div>
                  <div className="ml-3 flex items-center h-5">
                    <input
                      onChange={() => {
                        if (indexChecked === -1) {
                          setSelected([...selected, option]);
                        } else {
                          setSelected([...selected.slice(0, indexChecked), ...selected.slice(indexChecked + 1)]);
                        }
                      }}
                      type="checkbox"
                      checked={indexChecked !== -1}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                </div>
              )}
            </Menu.Item>
          );
        })}
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
    <div ref={wrapperRef} className="w-80 origin-top-right mt-2 p-4 rounded-md shadow-lg bg-white ring-opacity/5 focus:outline-none">
      <label className="block text-sm font-medium text-gray-700">Tags (separated by comma):</label>
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
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
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
          <kbd className={clsx('inline-flex items-center border border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400', tag ? 'cursor-pointer' : 'cursor-default')}>
            <CheckIcon className={clsx('w-4 h-4 m-1')} />
          </kbd>
        </div>
      </div>
    </div>
  );
};

interface InputTextProps {
  value: string;
  onSave: (value: string) => void;
  onClickOutside?: () => void;
}

const InputText = ({ value, onSave, onClickOutside }: InputTextProps) => {
  const wrapperRef = useRef(null);
  const [text, setText] = useState<string>(value || '');
  useClickOutside(wrapperRef, onClickOutside);

  return (
    <div ref={wrapperRef} className="w-80 origin-top-right mt-2 p-4 rounded-md shadow-lg bg-white ring-opacity/5 focus:outline-none">
      <label className="block text-sm font-medium text-gray-700">Text:</label>
      <div className="mt-1 relative flex items-center">
        <input
          type="text"
          value={text}
          autoFocus
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave(text);
              setText('');
            }
          }}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
        />
        <div
          className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5"
          onClick={() => {
            if (text) {
              onSave(text);
            }
            setText('');
          }}
        >
          <kbd className={clsx('inline-flex items-center border border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400', text ? 'cursor-pointer' : 'cursor-default')}>
            <CheckIcon className={clsx('w-4 h-4 m-1')} />
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
  onSaveSearch: (query: string | null, payload: any | null) => void;
  members: Member[];
  onFiltersChange: (query: string) => void;
  searchUser: SearchUser | null | undefined;
  user: UserDTO | null | undefined;
}

const ReportsSearchBar = ({ members, onSaveSearch, onFiltersChange, searchUser, user }: ReportsSearchBarProps) => {
  const [selectedFilters, setSelectedFilters] = useState<ReportsFilter[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<any | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const buttonRef = useRef(null);

  const USERS_FILTERS: ReportsFilter[] = useMemo(
    () =>
      members.map((member: Member) => ({
        key: member.id,
        label: member.display_name,
        modificable: true,
        type: 'user',
        image: member.avatar_url,
        isLeaf: true,
      })),
    [members],
  );

  const INITIAL_FILTERS: ReportsFilter[] = useMemo(() => {
    const data: ReportsFilter[] = [
      {
        key: 'text',
        label: 'Text',
        modificable: false,
        isLeaf: false,
      },
      {
        key: 'tag',
        label: 'Tag',
        modificable: false,
        isLeaf: false,
      },
      {
        key: 'created_at',
        label: 'Creation date',
        modificable: false,
        isLeaf: false,
      },
      {
        key: 'updated_at',
        label: 'Last updated',
        modificable: false,
        isLeaf: false,
      },
    ];
    if (USERS_FILTERS) {
      data.unshift({
        key: 'author_ids',
        label: 'Author',
        modificable: false,
        isLeaf: false,
      });
    }
    if (user) {
      data.push({
        key: 'user-pinned',
        label: 'My pinned',
        modificable: true,
        isLeaf: true,
      });
    }
    return data;
  }, [USERS_FILTERS, user]);

  const query: string = useMemo(() => {
    const numSelectedFilters: number = selectedFilters.length;
    if (numSelectedFilters === 0) {
      return '';
    }
    // Get the last index of valid filter
    let index: number = selectedFilters.length - 1;
    while (index >= 0) {
      const filter: ReportsFilter = selectedFilters[index]!;
      if (filter.isLeaf) {
        break;
      }
      index -= 1;
    }
    let q = '';
    for (let i = 0; i <= index; i += 1) {
      const filter: ReportsFilter = selectedFilters[i]!;
      q += filter.key;
      if (filter.isLeaf) {
        q += `&`;
      }
    }
    return q;
  }, [selectedFilters]);

  useEffect(() => {
    if (searchUser) {
      setSelectedFilters(searchUser?.payload ? searchUser.payload : []);
    }
  }, [searchUser]);

  useEffect(() => {
    if (query != null) {
      onFiltersChange(query);
    }
  }, [query]);

  const onClickNewFilter = () => {
    let component = null;
    if (selectedFilters.length) {
      switch (selectedFilters[selectedFilters.length - 1]?.key) {
        case 'author_ids':
          component = (
            <MenuItems
              filters={AUTHOR_OPERATORS_FILTERS}
              onSelect={(filter: ReportsFilter) => {
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
        case 'text':
          component = (
            <MenuItems
              filters={[{ key: '=', label: '=', modificable: false, isLeaf: false }]}
              onSelect={(filter: ReportsFilter) => {
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
        case 'created_at':
          component = (
            <MenuItems
              filters={DATE_OPERATORS}
              onSelect={(filter: ReportsFilter) => {
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
        case 'updated_at':
          component = (
            <MenuItems
              filters={DATE_OPERATORS}
              onSelect={(filter: ReportsFilter) => {
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
            case 'author_ids':
              component = (
                <MenuMultipleItems
                  filter={{
                    key: [],
                    label: [],
                    modificable: true,
                    type: 'user',
                    image: [],
                    isLeaf: true,
                  }}
                  options={USERS_FILTERS.map((v: ReportsFilter) => ({
                    image: v.image as string,
                    label: v.label as string,
                    value: v.key as string,
                  }))}
                  onClickOutside={(filter: ReportsFilter | null) => {
                    if (filter && (filter.key as string[]).length > 0) {
                      setSelectedFilters([...selectedFilters, filter]);
                    }
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
                      setSelectedFilters([...selectedFilters, { key: value, label: value, modificable: true, type: 'tag', isLeaf: true }]);
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
            case 'text':
              component = (
                <InputText
                  value={''}
                  onSave={(value: string) => {
                    if (value) {
                      setSelectedFilters([...selectedFilters, { key: value, label: value, modificable: true, type: 'text', isLeaf: true }]);
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
            case 'created_at':
              component = (
                <MyCalendar
                  value={new Date()}
                  onChange={(date: Date) => {
                    setSelectedFilters([
                      ...selectedFilters,
                      {
                        key: moment(date).format('YYYY-MM-DD'),
                        label: moment(date).format('YYYY-MM-DD'),
                        modificable: true,
                        type: 'date',
                        isLeaf: true,
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
            case 'updated_at':
              component = (
                <MyCalendar
                  value={new Date()}
                  onChange={(date: Date) => {
                    setSelectedFilters([
                      ...selectedFilters,
                      {
                        key: moment(date).format('YYYY-MM-DD'),
                        label: moment(date).format('YYYY-MM-DD'),
                        modificable: true,
                        type: 'date',
                        isLeaf: true,
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
              filters={INITIAL_FILTERS.filter((filter: ReportsFilter) => {
                const index: number = selectedFilters.findIndex((sf: ReportsFilter) => filter.key === sf.key);
                return index === -1;
              })}
              onSelect={(filter: ReportsFilter) => {
                setSelectedFilters([...selectedFilters, filter]);
                setShowMenu(false);
                setSelectedComponent(null);
                if (filter.key !== 'user-pinned') {
                  setTimeout(() => {
                    (buttonRef.current as any).click();
                  }, SHOW_NEXT_FILTER_MS);
                }
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
          onSelect={(filter: ReportsFilter) => {
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
  };

  const onClickUpdateFilter = (selectedFilter: ReportsFilter, index: number) => {
    if (!selectedFilter.modificable) {
      return;
    }
    let component = null;
    switch (selectedFilter.type) {
      case 'user':
        component = (
          <MenuMultipleItems
            filter={selectedFilter}
            options={USERS_FILTERS.map((v: ReportsFilter) => ({
              image: v.image as string,
              label: v.label as string,
              value: v.key as string,
            }))}
            onClickOutside={(filter: ReportsFilter | null) => {
              if (filter) {
                const fs: ReportsFilter[] = [...selectedFilters];
                if ((filter.key as string[]).length > 0) {
                  fs[index] = filter;
                } else {
                  fs.splice(index, 1);
                }
                setSelectedFilters(fs);
              }
              setShowMenu(false);
              setSelectedComponent(null);
            }}
          />
        );
        break;
      case 'author_ids-operator':
        component = (
          <MenuItems
            filters={AUTHOR_OPERATORS_FILTERS}
            onSelect={(filter: ReportsFilter) => {
              const fs: ReportsFilter[] = [...selectedFilters];
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
            value={selectedFilters[index]!.key as string}
            onSave={(value: string) => {
              const fs: ReportsFilter[] = [...selectedFilters];
              if (value) {
                fs[index]!.key = value;
                fs[index]!.label = value;
              } else {
                fs.splice(index, 1);
              }
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
      case 'text':
        component = (
          <InputText
            value={selectedFilters[index]!.key as string}
            onSave={(value: string) => {
              const fs: ReportsFilter[] = [...selectedFilters];
              if (value) {
                fs[index]!.key = value;
                fs[index]!.label = value;
              } else {
                fs.splice(index, 1);
              }
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
      case 'date-operator':
        component = (
          <MenuItems
            filters={DATE_OPERATORS}
            onSelect={(filter: ReportsFilter) => {
              const fs: ReportsFilter[] = [...selectedFilters];
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
              const fs: ReportsFilter[] = [...selectedFilters];
              fs[index]!.key = moment(date).format('YYYY-MM-DD');
              fs[index]!.label = moment(date).format('YYYY-MM-DD');
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
      default:
        break;
    }
    setShowMenu(true);
    setSelectedComponent(component);
  };

  return (
    <div className="flex flex-row content-center items-center">
      <Menu as="div" className="relative inline-block text-left w-full">
        <React.Fragment>
          <Menu.Button ref={buttonRef} className="w-full" onClick={onClickNewFilter}>
            <div className="mt-1 relative flex items-center content-center w-full">
              <div className="shadow-sm  block w-full pr-12 sm:text-sm border-gray-300 rounded-md" style={{ height: 40 }}></div>
              <div className="absolute inset-y-0 flex py-1.5 pr-1.5">
                {selectedFilters.map((selectedFilter: ReportsFilter, index: number) => (
                  <kbd
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClickUpdateFilter(selectedFilter, index);
                    }}
                    className={clsx(
                      'mx-1 inline-flex items-center border border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400',
                      selectedFilter.modificable ? 'cursor-pointer' : 'cursor-default',
                    )}
                  >
                    {Array.isArray(selectedFilter.label) ? selectedFilter.label.join(', ') : selectedFilter.label}
                    {index === selectedFilters.length - 1 && (
                      <span
                        className="text-gray-400 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          const sfs: ReportsFilter[] = [...selectedFilters];
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
                    onFiltersChange('');
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
      {user && <SaveIcon onClick={() => onSaveSearch(query, selectedFilters)} className={clsx('cursor-pointer w-6 h-6 ml-2')} />}
    </div>
  );
};

export default ReportsSearchBar;
