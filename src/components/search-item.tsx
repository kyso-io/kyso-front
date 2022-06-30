import type { FullTextSearchResult } from "@kyso-io/kyso-model";
import { ElasticSearchIndex } from "@kyso-io/kyso-model";
import { useMemo } from "react";

interface Props {
  fullTextSearchResult: FullTextSearchResult;
}

const SearchItem = ({ fullTextSearchResult }: Props) => {
  const people: string[] = useMemo(() => {
    if (fullTextSearchResult.people) {
      return fullTextSearchResult.people.split(" ");
    }
    return [];
  }, [fullTextSearchResult]);

  const tags: string[] = useMemo(() => {
    if (fullTextSearchResult.tags) {
      return fullTextSearchResult.tags.split(" ");
    }
    return [];
  }, [fullTextSearchResult]);

  return (
    <li className="mb-4 relative bg-white py-5 px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
      <div className="flex justify-between space-x-3">
        <div className="min-w-0 flex-1">
          <a href={fullTextSearchResult.link} className="block focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true"></span>
            {fullTextSearchResult.type !== ElasticSearchIndex.Comment && <p className="text-sm font-medium text-gray-900 truncate">{fullTextSearchResult.title}</p>}
            {fullTextSearchResult.organizationSlug && (
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">{fullTextSearchResult.organizationSlug}</span>
            )}
            {fullTextSearchResult.teamSlug && (
              <span className="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">{fullTextSearchResult.teamSlug}</span>
            )}
            {people.map((person: string, index: number) => (
              <span key={index} className="bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-purple-200 dark:text-purple-900">
                {person}
              </span>
            ))}
            {tags.map((tag: string, index: number) => (
              <span key={index} className="bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-200 dark:text-yellow-900">
                {tag}
              </span>
            ))}
            {/* <p className="text-sm text-gray-500 truncate">Velit placeat sit ducimus non sed</p> */}
          </a>
        </div>
      </div>
      <div className="mt-2">
        <p className="line-clamp-2 text-sm text-gray-600">{fullTextSearchResult.content}</p>
      </div>
    </li>
  );
};

export default SearchItem;
