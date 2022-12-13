/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint no-nested-ternary: "off" */
import SearchItem from '@/components/search-item';
import SearchNavigation from '@/components/search-navigation';
import SearchPagination from '@/components/search-pagination';
import { Helper } from '@/helpers/Helper';
import type { FullTextSearchParams } from '@/interfaces/full-text-search-params';
import type { SearchNavItem } from '@/interfaces/search-nav-item';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { FullTextSearchDTO, FullTextSearchResult, FullTextSearchResultType, NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { ElasticSearchIndex } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import type { CommonData } from '../../types/common-data';

const fetchData = async (commonData: CommonData, params: FullTextSearchParams, cb: (fullTextSearchDTO: FullTextSearchDTO | null) => void) => {
  try {
    const api: Api = new Api(commonData.token);
    const resultFullTextSearchDto: NormalizedResponseDTO<FullTextSearchDTO> = await api.fullTextSearch({ ...params, terms: encodeURIComponent(params.terms) });
    cb(resultFullTextSearchDto.data);
  } catch (e: any) {
    Helper.logError(e.response.data, e);
    cb(null);
  }
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const debouncedFetchData = debounce((commonData: CommonData, params: FullTextSearchParams, cb: (result: any) => void) => {
  fetchData(commonData, params, cb);
}, 750);

interface Props {
  commonData: CommonData;
}

const SearchIndex = ({ commonData }: Props) => {
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
  });
  const [navigation, setNavigation] = useState<SearchNavItem[]>([]);
  const [fullTextSearchResultType, setFullTextSearchResultType] = useState<FilteredFullTextSearchResultType[] | null>(null);
  const [rawResults, setRawResults] = useState<FullTextSearchResultType | null>(null);

  interface FilteredFullTextSearchResultType {
    result: FullTextSearchResult | null;
    subResults: number;
  }

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
      setFullTextSearchResultType(keepOnlyLatestVersions(fullTextSearchDTO.discussions));
    }
    if (fullTextSearchParams.type === ElasticSearchIndex.Comment) {
      setRawResults(fullTextSearchDTO.comments);
      setFullTextSearchResultType(keepOnlyLatestVersions(fullTextSearchDTO.comments));
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
        ]);
      } else {
        setNavigation([
          { name: 'Report files', elasticSearchIndex: ElasticSearchIndex.Report, count: 0 },
          /* { name: 'Discussions', elasticSearchIndex: ElasticSearchIndex.Discussion, count: 0 }, */
          { name: 'Report comments', elasticSearchIndex: ElasticSearchIndex.Comment, count: 0 },
        ]);
      }
      setRequesting(false);
    });
  };

  return (
    <div className="grid grid-cols-4 gap-4 m-4">
      <SearchNavigation
        navigation={navigation}
        elasticSearchIndex={fullTextSearchParams.type}
        onSelectedNavItem={(type: ElasticSearchIndex) => setFullTextSearchParams({ ...fullTextSearchParams, type, page: 1 })}
      />
      <div className="col-span-3">
        {/* SEARCH BAR */}
        <div className="mt-1">
          <input
            name="search"
            type="text"
            autoComplete="off"
            placeholder="Search Kyso"
            value={fullTextSearchParams.terms}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            onChange={(e: any) => setFullTextSearchParams({ ...fullTextSearchParams, terms: e.target.value, page: 1 })}
          />
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
          <div className="py-6">
            {fullTextSearchResultType.length === 0 ? (
              <div className="bg-white py-4 text-center text-base text-gray-600 hover:text-gray-900">No results found</div>
            ) : (
              <React.Fragment>
                <ul role="list" className="divide-y divide-gray-200">
                  {fullTextSearchResultType.map((fullTextSearchResult: FilteredFullTextSearchResultType, index: number) => (
                    <>
                      <SearchItem key={index} fullTextSearchResult={fullTextSearchResult.result!} otherVersionResultsNumber={fullTextSearchResult.subResults} />
                    </>
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
