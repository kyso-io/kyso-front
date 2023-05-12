/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint no-nested-ternary: "off" */
import SearchItem from '@/components/search-item';
import SearchNavigation from '@/components/search-navigation';
import SearchPagination from '@/components/search-pagination';
import { Helper } from '@/helpers/Helper';
import type { FullTextSearchParams } from '@/interfaces/full-text-search-params';
import type { SearchNavItem } from '@/interfaces/search-nav-item';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { Popover } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import type { FullTextSearchDTO, FullTextSearchResult, FullTextSearchResultType, NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { ElasticSearchIndex } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import type { CommonData } from '@/types/common-data';

interface FilteredFullTextSearchResultType {
  result: FullTextSearchResult | null;
  subResults: number;
}

const debouncedFetchData = debounce(async (commonData: CommonData, params: FullTextSearchParams, cb: (result: any) => void) => {
  try {
    const api: Api = new Api(commonData.token);
    const resultFullTextSearchDto: NormalizedResponseDTO<FullTextSearchDTO> = await api.fullTextSearch({ ...params, terms: encodeURIComponent(params.terms) });
    cb(resultFullTextSearchDto.data);
  } catch (e: any) {
    Helper.logError(e?.response?.data, e);
    cb(null);
  }
}, 750);

const SearchIndex = ({ commonData }: IKysoApplicationLayoutProps) => {
  const router = useRouter();
  const { q } = router.query;
  const [requesting, setRequesting] = useState<boolean>(false);
  const [fullTextSearchDTO, setFullTextSearchDTO] = useState<FullTextSearchDTO | null>(null);
  const [fullTextSearchParams, setFullTextSearchParams] = useState<FullTextSearchParams>({
    type: ElasticSearchIndex.Report,
    terms: q ? q.toString() : '',
    page: 1,
    perPage: 10,
    filterOrgs: [],
    filterTeams: [],
    filterTags: [],
    filterPeople: [],
    filterFileTypes: [],
    orderBy: '_score',
    order: 'desc',
  });
  const [selectedOrderOption, setSelectedOrderOption] = useState<{ label: string; orderBy: string; order: string }>({
    label: 'Best match',
    orderBy: '_score',
    order: 'desc',
  });
  const [navigation, setNavigation] = useState<SearchNavItem[]>([]);
  const [fullTextSearchResultType, setFullTextSearchResultType] = useState<FilteredFullTextSearchResultType[] | null>(null);
  const [rawResults, setRawResults] = useState<FullTextSearchResultType | null>(null);
  const numResults: number = useMemo(() => {
    if (!fullTextSearchDTO) {
      return 0;
    }
    switch (fullTextSearchParams.type) {
      case ElasticSearchIndex.Report:
        return fullTextSearchDTO.reports.metadata.total;
      case ElasticSearchIndex.Discussion:
        return fullTextSearchDTO.discussions.metadata.total;
      case ElasticSearchIndex.Comment:
        return fullTextSearchDTO.comments.metadata.total;
      case ElasticSearchIndex.InlineComment:
        return fullTextSearchDTO.inlineComments.metadata.total;
      default:
        return 0;
    }
  }, [fullTextSearchParams, fullTextSearchDTO]);
  const sortOptions: { label: string; orderBy: string; order: string }[] = useMemo(() => {
    const data: { label: string; orderBy: string; order: string }[] = [
      {
        label: 'Best match',
        orderBy: 'score',
        order: 'desc',
      },
    ];
    switch (fullTextSearchParams.type) {
      case ElasticSearchIndex.Report:
        data.push(
          ...[
            {
              label: 'Most stars',
              orderBy: 'stars',
              order: 'desc',
            },
            {
              label: 'Fewest stars',
              orderBy: 'stars',
              order: 'asc',
            },
            {
              label: 'Most comments',
              orderBy: 'numComments',
              order: 'desc',
            },
            {
              label: 'Fewest comments',
              orderBy: 'numComments',
              order: 'asc',
            },
          ],
        );
        break;
      case ElasticSearchIndex.Discussion:
        break;
      case ElasticSearchIndex.Comment:
        break;
      case ElasticSearchIndex.InlineComment:
        break;
      case ElasticSearchIndex.User:
        break;
      default:
        break;
    }
    data.push(
      ...[
        {
          label: 'Recently updated',
          orderBy: 'updatedAt',
          order: 'desc',
        },
        {
          label: 'Least recently updated',
          orderBy: 'updatedAt',
          order: 'asc',
        },
      ],
    );
    return data;
  }, [fullTextSearchParams.type]);

  useEffect(() => {
    setSelectedOrderOption({
      label: 'Best match',
      orderBy: '_score',
      order: 'desc',
    });
  }, [fullTextSearchParams.type]);

  const keepOnlyLatestVersions = (results: FullTextSearchResultType): FilteredFullTextSearchResultType[] => {
    const map = new Map<string, FilteredFullTextSearchResultType>();
    const regex = /(?:^|[?&])version=([^&]*)/g;

    for (const x of results.results) {
      const key = x.link.replace(regex, '').toLowerCase();

      const filteredResult: FilteredFullTextSearchResultType = {
        result: x,
        subResults: 1,
      };

      if (map.has(key)) {
        const currentValue = map.get(key);

        currentValue!.subResults = currentValue!.subResults + 1;

        if (currentValue!.result!.version < x.version) {
          currentValue!.result = x;
        }

        map.set(key, currentValue!);
      } else {
        map.set(key, filteredResult);
      }
    }

    return Array.from(map.values()) as FilteredFullTextSearchResultType[];
  };

  useEffect(() => {
    if (!fullTextSearchDTO) {
      setFullTextSearchResultType(null);
      return;
    }

    if (fullTextSearchParams.type === ElasticSearchIndex.Report) {
      setRawResults(fullTextSearchDTO.reports);
      setFullTextSearchResultType(keepOnlyLatestVersions(fullTextSearchDTO.reports));
    }
    if (fullTextSearchParams.type === ElasticSearchIndex.Discussion) {
      setRawResults(fullTextSearchDTO.discussions);
      setFullTextSearchResultType(
        fullTextSearchDTO.discussions.results.map((x: FullTextSearchResult) => {
          return {
            result: x,
            subResults: 1,
          };
        }),
      );
    }
    if (fullTextSearchParams.type === ElasticSearchIndex.Comment) {
      setRawResults(fullTextSearchDTO.comments);
      setFullTextSearchResultType(
        fullTextSearchDTO.comments.results.map((x: FullTextSearchResult) => {
          return {
            result: x,
            subResults: 1,
          };
        }),
      );
    }
    if (fullTextSearchParams.type === ElasticSearchIndex.InlineComment) {
      setRawResults(fullTextSearchDTO.inlineComments);
      setFullTextSearchResultType(
        fullTextSearchDTO.inlineComments.results.map((x: FullTextSearchResult) => {
          return {
            result: x,
            subResults: 1,
          };
        }),
      );
    }
  }, [fullTextSearchDTO]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (!q) {
      return;
    }
    if (fullTextSearchParams.terms !== q) {
      setFullTextSearchParams({ ...fullTextSearchParams, terms: q as string });
    }
  }, [router.isReady, q]);

  useEffect(() => {
    if (commonData.token) {
      refreshData();
    }
  }, [commonData.token]);

  useEffect(() => {
    refreshData();
  }, [fullTextSearchParams]);

  const refreshData = () => {
    setRequesting(true);
    debouncedFetchData(commonData, fullTextSearchParams, (result: FullTextSearchDTO | null) => {
      setFullTextSearchDTO(result);
      if (result) {
        setNavigation([
          { name: 'Report files', elasticSearchIndex: ElasticSearchIndex.Report, count: result.reports.metadata.total },
          /* { name: 'Discussions', elasticSearchIndex: ElasticSearchIndex.Discussion, count: result.discussions.metadata.total }, */
          { name: 'Report comments', elasticSearchIndex: ElasticSearchIndex.Comment, count: result.comments.metadata.total },
          { name: 'Inline comments', elasticSearchIndex: ElasticSearchIndex.InlineComment, count: result.inlineComments.metadata.total },
        ]);
      } else {
        setNavigation([
          { name: 'Report files', elasticSearchIndex: ElasticSearchIndex.Report, count: 0 },
          /* { name: 'Discussions', elasticSearchIndex: ElasticSearchIndex.Discussion, count: 0 }, */
          { name: 'Report comments', elasticSearchIndex: ElasticSearchIndex.Comment, count: 0 },
          { name: 'Inline comments', elasticSearchIndex: ElasticSearchIndex.InlineComment, count: 0 },
        ]);
      }
      setRequesting(false);
    });
  };

  const onFiltersChanged = (filterOrgs: string[], filterTeams: string[], filterPeople: string[], filterFileTypes: string[], filterTags: string[]) => {
    setFullTextSearchParams({
      ...fullTextSearchParams,
      filterOrgs /* .map((x: string) => encodeURIComponent(x)) */,
      filterTeams /* .map((x: string) => encodeURIComponent(x)) */,
      filterPeople /* .map((x: string) => encodeURIComponent(x)) */,
      filterFileTypes /* .map((x: string) => encodeURIComponent(x)) */,
      filterTags /* .map((x: string) => encodeURIComponent(x)) */,
      page: 1,
    });
  };

  return (
    <div className="grid grid-cols-4 gap-4 m-4">
      <SearchNavigation
        commonData={commonData}
        fullTextSearchDTO={fullTextSearchDTO}
        onFiltersChanged={onFiltersChanged}
        navigation={navigation}
        elasticSearchIndex={fullTextSearchParams.type}
        fullTextSearchParams={fullTextSearchParams}
        onSelectedNavItem={(type: ElasticSearchIndex) => setFullTextSearchParams({ ...fullTextSearchParams, type, page: 1 })}
      />
      <div className="col-span-3">
        <div className="mt-1">
          {fullTextSearchDTO && (
            <div className="flex flex-row items-center my-4 ml-3 text-xs">
              <span>
                {Helper.formatNumber(numResults)} {numResults === 1 ? 'result' : 'results'}
              </span>
              <Popover className="relative">
                {({ open, close }) => (
                  <React.Fragment>
                    <Popover.Button className="focus:ring-0 focus:outline-none">
                      <div className="flex flex-row items-center cursor-pointer ml-10" style={{ width: 'fit-content' }}>
                        <span className="mr-2">Sort by:</span>
                        <span className="mr-2 font-semibold">{selectedOrderOption.label}</span>
                        {open ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                      </div>
                    </Popover.Button>
                    <Popover.Panel className="min-w-[300px] origin-top-right absolute right-50 mt-2 rounded-md shadow-lg bg-white border focus:outline-none z-10">
                      <ul role="list" className="divide-y divide-gray-200">
                        <li className="relative bg-white py-2 px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                          <div className="flex justify-between">
                            <span className="block focus:outline-none">
                              <span className="absolute inset-0" aria-hidden="true" />
                              <p className="truncate text-base font-medium text-gray-900">Sort options</p>
                            </span>
                          </div>
                        </li>
                        {sortOptions.map(({ label, orderBy, order }, index: number) => (
                          <li
                            key={index}
                            onClick={() => {
                              setSelectedOrderOption({ label, orderBy, order });
                              setFullTextSearchParams({
                                ...fullTextSearchParams,
                                orderBy,
                                order: order as any,
                                page: 1,
                              });
                              close();
                            }}
                            className={clsx(
                              'relative bg-white py-2.5 px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 cursor-pointer',
                              selectedOrderOption.orderBy === orderBy && selectedOrderOption.order === order ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-gray-50',
                            )}
                          >
                            <div className={clsx('flex', selectedOrderOption.orderBy === orderBy && selectedOrderOption.order === order ? 'flex-row items-center' : 'justify-between pl-5')}>
                              {selectedOrderOption.orderBy === orderBy && selectedOrderOption.order === order && <CheckIcon className="w-4 h-4 mr-2" />}
                              <span className="block focus:outline-none">
                                <span className="absolute inset-0" aria-hidden="true" />
                                <p className={clsx('truncate text-sm')}>{label}</p>
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Popover.Panel>
                  </React.Fragment>
                )}
              </Popover>
            </div>
          )}
        </div>
        {/* SEARCH RESULTS */}
        {requesting ? (
          <div className="grid h-80 place-items-center">
            <svg role="status" className="inline w-10 h-10 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </div>
        ) : !fullTextSearchDTO || !fullTextSearchResultType ? (
          <div className="bg-white py-4 text-center text-base text-gray-600 hover:text-gray-900">No results found</div>
        ) : (
          <div className="">
            {fullTextSearchResultType.length === 0 ? (
              <div className="bg-white py-4 text-center text-base text-gray-600 hover:text-gray-900">No results found</div>
            ) : (
              <React.Fragment>
                <ul role="list" className="divide-y divide-gray-200">
                  {fullTextSearchResultType.map((fullTextSearchResult: FilteredFullTextSearchResultType, index: number) => (
                    <SearchItem key={index} fullTextSearchResult={fullTextSearchResult.result!} otherVersionResultsNumber={fullTextSearchResult.subResults} terms={fullTextSearchParams.terms} />
                  ))}
                </ul>
                <SearchPagination goToPage={(page: number) => setFullTextSearchParams({ ...fullTextSearchParams, page })} fullTextSearchMetadata={rawResults!.metadata} />
              </React.Fragment>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

SearchIndex.layout = KysoApplicationLayout;

export default SearchIndex;
