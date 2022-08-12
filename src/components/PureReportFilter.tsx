import classNames from '@/helpers/class-names';
import { Listbox, Menu, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon, FilterIcon, SearchIcon, SelectorIcon } from '@heroicons/react/solid';
import { Fragment, useState } from 'react';

type IPureReportFilterProps = {
  sortOptions: { name: string; value: string }[];
  tags: string[];
  defaultSearch: string | null;
  activeFilters: string[];
  currentSort: string;
  onSetSort: (sort: string) => void;
  onSetTags: (_tags: string[]) => void;
  onSetSearch: (search: string) => void;
  onClear: () => void;
};

const PureReportFilter = (props: IPureReportFilterProps) => {
  const {
    sortOptions = [],
    tags = [],
    defaultSearch = null,
    activeFilters = [],
    currentSort = '-created_at',
    onSetSort = () => {},
    onSetTags = () => {},
    onSetSearch = () => {},
    onClear = () => {},
  } = props;

  const d: string[] = [];
  const [selectedTags, setSelectedTags] = useState(d);
  const [currentSearch, setCurrentSearch] = useState(defaultSearch);
  const [currentSortCopy, setCurrentSortCopy] = useState(currentSort);

  const clearAllFilters = () => {
    onClear();
    setSelectedTags([]);
    setCurrentSearch('');
    setCurrentSortCopy('-created_at');
  };

  return (
    <>
      <section aria-labelledby="filter-heading" className="border rounded">
        <div className={classNames('z-50 bg-white py-2 px-4', activeFilters.length > 0 ? 'rounded-t border-b' : 'rounded')}>
          <div className="max-w-7xl mx-auto items-right items-center flex">
            <form className="w-full flex" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Search
              </label>
              <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" aria-hidden="true">
                  <SearchIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <input
                  id="search"
                  autoComplete="off"
                  name="search"
                  className="block w-full h-full pl-8 py-2 border-transparent text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-transparent sm:text-sm"
                  placeholder="Filter reports"
                  value={currentSearch || ''}
                  type="search"
                  onChange={(ev) => {
                    setCurrentSearch(ev.target.value);
                    onSetSearch(ev.target.value);
                  }}
                />
              </div>
            </form>

            <div className="relative inline-block justify-end text-right ml-4 pl-4">
              <div className="flow-root">
                <Listbox
                  value={selectedTags}
                  onChange={(newlySelectedTags: string[]) => {
                    setSelectedTags(newlySelectedTags);
                    onSetTags(newlySelectedTags);
                  }}
                  multiple
                >
                  {({ open }) => (
                    <>
                      <div className={classNames('mt-1 relative', selectedTags.length > 0 || open ? 'w-52' : '')}>
                        <Listbox.Button className="bg-white relative w-full rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:ring-0 sm:text-sm">
                          <span className="block truncate">{selectedTags.length > 0 ? selectedTags.join(', ') : 'Tags'}</span>
                          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </Listbox.Button>

                        <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                          <Listbox.Options className="text-left absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-0 border overflow-auto focus:outline-none sm:text-sm">
                            {tags.map((tag) => (
                              <Listbox.Option
                                key={tag}
                                className={({ active }) => classNames(active ? 'text-white bg-indigo-600' : 'text-gray-900', 'cursor-default select-none relative py-2 pl-3 pr-9')}
                                value={tag}
                              >
                                {({ selected, active }) => (
                                  <>
                                    {selected ? (
                                      <span className={classNames(active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4')}>
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                    <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>{tag}</span>
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </>
                  )}
                </Listbox>
              </div>
            </div>

            <Menu as="div" className="relative inline-block text-left ml-4 border-l pl-4">
              <div>
                <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                  Sort
                  <ChevronDownIcon className="shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
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
                <Menu.Items className="z-50 origin-top-right absolute -right-4 mt-2 w-44 rounded-md shadow-2xl bg-white border focus:outline-none">
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <Menu.Item key={option.name}>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              onSetSort(option.value);
                              setCurrentSortCopy(option.value);
                            }}
                            className={classNames(
                              option.value === currentSortCopy ? 'font-medium bg-gray-200 text-gray-900' : 'text-gray-500',
                              active ? 'bg-gray-100' : '',
                              'block px-2 py-2 text-sm w-full text-left',
                            )}
                          >
                            {option.name}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="bg-gray-100 rounded-b flex justify-between">
            <div className="max-w-7xl py-3 sm:flex sm:items-center px-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                <div className="group text-gray-700 font-medium flex items-center">
                  <FilterIcon className="flex-none w-5 h-5 mr-2 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  {activeFilters.length} Filters
                </div>
              </div>

              <div className="mt-2 sm:mt-0 sm:ml-4">
                <div className="-m-1 flex flex-wrap items-center">
                  {activeFilters.map((activeFilter) => (
                    <span key={activeFilter} className="m-1 inline-flex rounded-full border border-gray-200 items-center py-1.5 pl-3 pr-2 text-sm font-medium bg-white text-gray-900">
                      <span>{activeFilter}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="max-w-7xl py-3 sm:flex sm:items-center px-4 border-l">
              <button type="button" className="text-gray-500 font-light text-sm" onClick={clearAllFilters}>
                Clear all
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default PureReportFilter;
