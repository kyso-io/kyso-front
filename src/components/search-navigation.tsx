import { Popover } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import type { FullTextSearchAggregator, FullTextSearchDTO, FullTextSearchResultType, ResourcePermissions } from '@kyso-io/kyso-model';
import { ElasticSearchIndex } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import { Helper } from '../helpers/Helper';
import type { SearchNavItem } from '../interfaces/search-nav-item';
import type { CommonData } from '../types/common-data';

interface Props {
  commonData: CommonData;
  fullTextSearchDTO: FullTextSearchDTO | null;
  onFiltersChanged: (filterOrganizations: string[], filterChannels: string[], filterAuthors: string[], filterFileTypes: string[], filterTags: string[]) => void;
  navigation: SearchNavItem[];
  elasticSearchIndex: ElasticSearchIndex;
  onSelectedNavItem: (elasticSearchIndex: ElasticSearchIndex) => void;
}

interface CustomFullTextSearchAggregator extends FullTextSearchAggregator {
  displayName: string;
}

const SearchNavigation = ({ commonData, fullTextSearchDTO, onFiltersChanged, navigation, elasticSearchIndex, onSelectedNavItem }: Props) => {
  const [filterOrganizations, setFilterOrganizations] = useState<string[]>([]);
  const [filterChannels, setFilterChannels] = useState<string[]>([]);
  const [filterAuthors, setFilterAuthors] = useState<string[]>([]);
  const [filterFileTypes, setFilterFileTypes] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const fullTextSearchResultType: FullTextSearchResultType | null = useMemo(() => {
    if (!fullTextSearchDTO) {
      return null;
    }
    switch (elasticSearchIndex) {
      case ElasticSearchIndex.Comment:
        return fullTextSearchDTO.comments;
      case ElasticSearchIndex.Discussion:
        return fullTextSearchDTO.discussions;
      case ElasticSearchIndex.Report:
        return fullTextSearchDTO.reports;
      case ElasticSearchIndex.User:
        return fullTextSearchDTO.members;
      default:
        return null;
    }
  }, [elasticSearchIndex, fullTextSearchDTO]);
  const availableOrganizations: CustomFullTextSearchAggregator[] = useMemo(() => {
    if (!fullTextSearchResultType || !commonData || !commonData.permissions || !commonData.permissions.organizations) {
      return [];
    }
    return fullTextSearchResultType.metadata.aggregators.organizations
      .map((ftsa: FullTextSearchAggregator) => {
        const orgResourcePermission: ResourcePermissions | undefined = commonData.permissions!.organizations!.find((rpOrg: ResourcePermissions) => rpOrg.name === ftsa.key);
        return {
          displayName: orgResourcePermission ? orgResourcePermission.display_name : ftsa.key,
          ...ftsa,
        };
      })
      .filter((x: FullTextSearchAggregator) => x.doc_count > 0);
  }, [commonData, fullTextSearchResultType]);
  const availableChannels: CustomFullTextSearchAggregator[] = useMemo(() => {
    if (!fullTextSearchResultType || !commonData || !commonData.permissions || !commonData.permissions.organizations || !commonData.permissions.teams) {
      return [];
    }
    return fullTextSearchResultType.metadata.aggregators.teams
      .map((ftsa: FullTextSearchAggregator) => {
        const parts: string[] = ftsa.key.split('_');
        if (parts.length !== 2) {
          return {
            displayName: '',
            ...ftsa,
          };
        }
        const orgResourcePermission: ResourcePermissions | undefined = commonData.permissions!.organizations!.find((rpOrg: ResourcePermissions) => rpOrg.name === parts[0]);
        if (!orgResourcePermission) {
          return {
            displayName: '',
            ...ftsa,
          };
        }
        const teamResourcePermission: ResourcePermissions | undefined = commonData.permissions!.teams!.find(
          (rpTeam: ResourcePermissions) => rpTeam.name === parts[1] && rpTeam.organization_id === orgResourcePermission.id,
        );
        if (!teamResourcePermission) {
          return {
            displayName: '',
            ...ftsa,
          };
        }
        return {
          displayName: teamResourcePermission.display_name,
          ...ftsa,
        };
      })
      .filter((x: CustomFullTextSearchAggregator) => x.displayName && x.doc_count > 0);
  }, [commonData, fullTextSearchResultType]);
  const availableTags: FullTextSearchAggregator[] = useMemo(() => {
    if (!fullTextSearchResultType) {
      return [];
    }
    return fullTextSearchResultType.metadata.aggregators.tags.filter((x: FullTextSearchAggregator) => x.doc_count > 0);
  }, [fullTextSearchResultType]);
  const availableAuthors: FullTextSearchAggregator[] = useMemo(() => {
    if (!fullTextSearchResultType) {
      return [];
    }
    return fullTextSearchResultType.metadata.aggregators.people.filter((x: FullTextSearchAggregator) => x.doc_count > 0);
  }, [fullTextSearchResultType]);
  const availableFileTypes: CustomFullTextSearchAggregator[] = useMemo(() => {
    if (!fullTextSearchResultType) {
      return [];
    }
    return fullTextSearchResultType.metadata.aggregators.file_types
      .map((ftsa: FullTextSearchAggregator) => {
        return {
          displayName: Helper.getFileNameGivenExtension(ftsa.key),
          ...ftsa,
        };
      })
      .filter((x: CustomFullTextSearchAggregator) => x.displayName && x.doc_count > 0);
  }, [fullTextSearchResultType]);
  const disabledSearchButton: boolean = useMemo(() => {
    return filterOrganizations.length === 0 && filterChannels.length === 0 && filterAuthors.length === 0 && filterFileTypes.length === 0 && filterTags.length === 0;
  }, [filterOrganizations, filterChannels, filterAuthors, filterFileTypes, filterTags]);

  return (
    <nav className="bg-white p-4 space-y-1" aria-label="Sidebar" style={{ height: 150 }}>
      {navigation.map((navItem: SearchNavItem) => (
        <a
          onClick={() => onSelectedNavItem(navItem.elasticSearchIndex)}
          key={navItem.name}
          className={clsx(
            navItem.elasticSearchIndex === elasticSearchIndex ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
          )}
          aria-current={navItem.elasticSearchIndex === elasticSearchIndex ? 'page' : undefined}
          style={{ cursor: 'pointer' }}
        >
          <span className="truncate">{navItem.name}</span>
          {navItem.count > 0 ? (
            <span
              className={clsx(
                navItem.elasticSearchIndex === elasticSearchIndex ? 'bg-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200',
                'ml-auto inline-block py-0.5 px-3 text-xs rounded-full',
              )}
            >
              {navItem.count}
            </span>
          ) : null}
        </a>
      ))}
      {fullTextSearchDTO && (
        <React.Fragment>
          <div className="" style={{ marginTop: 20 }}>
            <h3 className="text-slate-500 text-xl font-semibold mt-2 pb-2">Advanced search</h3>
            <div className="mt-2 py-3 text-sm" style={{ borderBottom: '1px solid #e5e7eb', borderTop: '1px solid #e5e7eb' }}>
              {/* ORGANIZATIONS */}
              {availableOrganizations.length > 0 && (
                <Popover className="relative py-2">
                  {({ open }) => (
                    <React.Fragment>
                      <Popover.Button className="focus:ring-0 focus:outline-none">
                        <div className="flex flex-row bg-slate-100 p-1 rounded border px-2 cursor-pointer" style={{ width: 'fit-content' }}>
                          <span className="text-gray-500">Filter:</span>
                          <span className="text-gray-900 mx-2">Organizations</span>
                          {open ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                        </div>
                      </Popover.Button>
                      <Popover.Panel className="min-w-[300px] origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white border focus:outline-none p-4 z-10">
                        <h4 className="text-base text-gray-900 font-semibold">Organizations</h4>
                        <div className="mt-2 max-h-[280px] overflow-auto">
                          {availableOrganizations.map((rpOrg: CustomFullTextSearchAggregator) => (
                            <div key={rpOrg.key} className="flex flex-row items-center py-1 cursor-pointer text-gray-500 px-2 hover:bg-gray-50 hover:text-gray-900">
                              <input
                                name="organizations"
                                type="checkbox"
                                className="h-4 w-4 mr-2 rounded text-indigo-600 focus:border-current focus:ring-0"
                                onChange={() => {
                                  const copy: string[] = [...filterOrganizations];
                                  const index: number = copy.indexOf(rpOrg.key);
                                  if (index > -1) {
                                    copy.splice(index, 1);
                                  } else {
                                    copy.push(rpOrg.key);
                                  }
                                  setFilterOrganizations(copy);
                                }}
                              />
                              <span className="grow">{rpOrg.displayName}</span>
                              <span className="font-semibold">{rpOrg.doc_count}</span>
                            </div>
                          ))}
                        </div>
                      </Popover.Panel>
                    </React.Fragment>
                  )}
                </Popover>
              )}
              {/* TEAMS */}
              {availableChannels.length > 0 && (
                <Popover className="relative py-2">
                  {({ open }) => (
                    <React.Fragment>
                      <Popover.Button className="focus:ring-0 focus:outline-none">
                        <div className="flex flex-row bg-slate-100 p-1 rounded border px-2 cursor-pointer" style={{ width: 'fit-content' }}>
                          <span className="text-gray-500">Filter:</span>
                          <span className="text-gray-900 mx-2">Channels</span>
                          {open ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                        </div>
                      </Popover.Button>
                      <Popover.Panel className="min-w-[300px] origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white border focus:outline-none p-4 z-10">
                        <h4 className="text-base text-gray-900 font-semibold">Channels</h4>
                        <div className="mt-2 max-h-[280px] overflow-auto">
                          {availableChannels.map((rpChannel: CustomFullTextSearchAggregator) => (
                            <div key={rpChannel.key} className="flex flex-row items-center justify-between py-1 cursor-pointer text-gray-500 px-2 hover:bg-gray-50 hover:text-gray-900">
                              <input
                                name="channels"
                                type="checkbox"
                                className="h-4 w-4 mr-2 rounded text-indigo-600 focus:border-current focus:ring-0"
                                onChange={() => {
                                  const copy: string[] = [...filterChannels];
                                  const index: number = copy.indexOf(rpChannel.key);
                                  if (index > -1) {
                                    copy.splice(index, 1);
                                  } else {
                                    copy.push(rpChannel.key);
                                  }
                                  setFilterChannels(copy);
                                }}
                              />
                              <span className="grow">{rpChannel.displayName}</span>
                              <span className="font-semibold">{rpChannel.doc_count}</span>
                            </div>
                          ))}
                        </div>
                      </Popover.Panel>
                    </React.Fragment>
                  )}
                </Popover>
              )}
              {/* AUTHORS */}
              {availableAuthors.length > 0 && (
                <Popover className="relative py-2">
                  {({ open }) => (
                    <React.Fragment>
                      <Popover.Button className="focus:ring-0 focus:outline-none">
                        <div className="flex flex-row bg-slate-100 p-1 rounded border px-2 cursor-pointer" style={{ width: 'fit-content' }}>
                          <span className="text-gray-500">Filter:</span>
                          <span className="text-gray-900 mx-2">People</span>
                          {open ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                        </div>
                      </Popover.Button>
                      <Popover.Panel className="min-w-[300px] origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white border focus:outline-none p-4 z-10">
                        <h4 className="text-base text-gray-900 font-semibold">People</h4>
                        <div className="mt-2 max-h-[280px] overflow-auto">
                          {availableAuthors.map((rpAuthor: FullTextSearchAggregator) => (
                            <div key={rpAuthor.key} className="flex flex-row items-center py-1 cursor-pointer text-gray-500 px-2 hover:bg-gray-50 hover:text-gray-900">
                              <input
                                name="people"
                                type="checkbox"
                                className="h-4 w-4 mr-2 rounded text-indigo-600 focus:border-current focus:ring-0"
                                onChange={() => {
                                  const copy: string[] = [...filterAuthors];
                                  const index: number = copy.indexOf(rpAuthor.key);
                                  if (index > -1) {
                                    copy.splice(index, 1);
                                  } else {
                                    copy.push(rpAuthor.key);
                                  }
                                  setFilterAuthors(copy);
                                }}
                              />
                              <span className="grow">{rpAuthor.key}</span>
                              <span className="font-semibold">{rpAuthor.doc_count}</span>
                            </div>
                          ))}
                        </div>
                      </Popover.Panel>
                    </React.Fragment>
                  )}
                </Popover>
              )}
              {/* FILES */}
              {availableFileTypes.length > 0 && (
                <Popover className="relative py-2">
                  {({ open }) => (
                    <React.Fragment>
                      <Popover.Button className="focus:ring-0 focus:outline-none">
                        <div className="flex flex-row bg-slate-100 p-1 rounded border px-2 cursor-pointer" style={{ width: 'fit-content' }}>
                          <span className="text-gray-500">Filter:</span>
                          <span className="text-gray-900 mx-2">Files</span>
                          {open ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                        </div>
                      </Popover.Button>
                      <Popover.Panel className="min-w-[300px] origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white border focus:outline-none p-4 z-10">
                        <h4 className="text-base text-gray-900 font-semibold">Files</h4>
                        <div className="mt-2 max-h-[280px] overflow-auto">
                          {availableFileTypes.map((rpTeam: CustomFullTextSearchAggregator) => (
                            <div key={rpTeam.key} className="flex flex-row items-center py-1 cursor-pointer text-gray-500 px-2 hover:bg-gray-50 hover:text-gray-900">
                              <input
                                name="fileTypes"
                                type="checkbox"
                                className="h-4 w-4 mr-2 rounded text-indigo-600 focus:border-current focus:ring-0"
                                onChange={() => {
                                  const copy: string[] = [...filterFileTypes];
                                  const index: number = copy.indexOf(rpTeam.key);
                                  if (index > -1) {
                                    copy.splice(index, 1);
                                  } else {
                                    copy.push(rpTeam.key);
                                  }
                                  setFilterFileTypes(copy);
                                }}
                              />
                              <span className="grow">{rpTeam.displayName}</span>
                              <span className="font-semibold">{rpTeam.doc_count}</span>
                            </div>
                          ))}
                        </div>
                      </Popover.Panel>
                    </React.Fragment>
                  )}
                </Popover>
              )}
            </div>
          </div>
          {elasticSearchIndex === ElasticSearchIndex.Report && (
            <div className="mt-2 text-sm" style={{ marginTop: 20, borderBottom: '1px solid #e5e7eb' }}>
              <div className="font-semibold">Tags</div>
              <div className="flex flex-wrap py-3">
                {availableTags.map((tag: FullTextSearchAggregator) => (
                  <span
                    key={tag.key}
                    className={clsx(
                      'text-xs font-medium mr-2 my-1 px-2.5 py-0.5 rounded cursor-pointer',
                      filterTags.includes(tag.key) ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                    )}
                    onClick={() => {
                      const copy: string[] = [...filterTags];
                      const index: number = copy.indexOf(tag.key);
                      if (index > -1) {
                        copy.splice(index, 1);
                      } else {
                        copy.push(tag.key);
                      }
                      setFilterTags(copy);
                    }}
                  >
                    <span className="">{tag.key}</span>
                    <span className="ml-3">{tag.doc_count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end" style={{ marginTop: 30 }}>
            {!disabledSearchButton && (
              <button
                disabled={disabledSearchButton}
                type="button"
                className={clsx('mr-2 rounded bg-white py-1.5 px-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50')}
                onClick={() => {
                  setFilterOrganizations([]);
                  setFilterChannels([]);
                  setFilterAuthors([]);
                  setFilterFileTypes([]);
                  setFilterTags([]);
                  onFiltersChanged([], [], [], [], []);
                }}
              >
                Clear
              </button>
            )}
            <button
              disabled={disabledSearchButton}
              type="button"
              className={clsx(
                'rounded bg-white py-1.5 px-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset',
                disabledSearchButton ? 'cursor-not-allowed ring-gray-300 hover:bg-gray-50' : 'cursor-pointer bg-indigo-500 text-white ring-indigo-500',
              )}
              onClick={() => {
                onFiltersChanged(filterOrganizations, filterChannels, filterAuthors, filterFileTypes, filterTags);
                setFilterOrganizations([]);
                setFilterChannels([]);
                setFilterAuthors([]);
                setFilterFileTypes([]);
                setFilterTags([]);
              }}
            >
              Search
            </button>
          </div>
        </React.Fragment>
      )}
    </nav>
  );
};

export default SearchNavigation;
