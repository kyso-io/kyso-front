import type { FullTextSearchMetadata } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import { useMemo } from 'react';

const MIN_NUM_PAGES: number = 7;

interface Props {
  goToPage: (page: number) => void;
  fullTextSearchMetadata: FullTextSearchMetadata;
}

const SearchPagination = ({ goToPage, fullTextSearchMetadata }: Props) => {
  const onPreviousPage = () => {
    if (fullTextSearchMetadata.page - 1 > 0) {
      goToPage(fullTextSearchMetadata.page - 1);
    }
  };

  const onNextPage = () => {
    if (fullTextSearchMetadata.page + 1 <= fullTextSearchMetadata.pages) {
      goToPage(fullTextSearchMetadata.page + 1);
    }
  };

  const pages: number[] = useMemo(() => {
    const newPages: number[] = [];
    if (!fullTextSearchMetadata) {
      return newPages;
    }
    if (fullTextSearchMetadata.pages <= MIN_NUM_PAGES) {
      for (let i = 1; i <= fullTextSearchMetadata.pages; i += 1) {
        newPages.push(i);
      }
    } else {
      for (let i = Math.max(1, fullTextSearchMetadata.page - 3); i <= Math.min(fullTextSearchMetadata.page + 3, fullTextSearchMetadata.pages); i += 1) {
        newPages.push(i);
      }
      if (newPages.length < MIN_NUM_PAGES) {
        if (fullTextSearchMetadata.page - 3 > 0) {
          do {
            newPages.unshift(newPages[0]! - 1);
          } while (newPages.length < MIN_NUM_PAGES);
        }
        if (fullTextSearchMetadata.page + 3 < fullTextSearchMetadata.pages) {
          do {
            newPages.push(newPages[newPages.length - 1]! + 1);
          } while (newPages.length < MIN_NUM_PAGES);
        }
      }
    }
    return newPages;
  }, [fullTextSearchMetadata]);

  if (pages.length < 2) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <nav className="border-t border-gray-200 px-4 flex items-center justify-between sm:px-0">
          <div className="-mt-px w-0 flex-1 flex">
            <a
              onClick={onPreviousPage}
              className="border-t-2 border-transparent pt-4 pr-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              style={{ cursor: 'pointer' }}
            >
              <svg
                className="mr-3 h-5 w-5 text-gray-400"
                x-description="Heroicon name: solid/arrow-narrow-left"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Previous
            </a>
          </div>
          <div className="hidden md:-mt-px md:flex">
            {pages.map((page: number) => (
              <a
                key={page}
                onClick={() => {
                  if (page !== fullTextSearchMetadata.page) {
                    goToPage(page);
                  }
                }}
                className={clsx(
                  page === fullTextSearchMetadata.page
                    ? 'border-indigo-500 text-indigo-600 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium',
                )}
                style={{ cursor: 'pointer' }}
              >
                {page}
              </a>
            ))}
          </div>
          <div className="-mt-px w-0 flex-1 flex justify-end">
            <a
              onClick={onNextPage}
              className="border-t-2 border-transparent pt-4 pl-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              style={{ cursor: 'pointer' }}
            >
              Next
              <svg
                className="ml-3 h-5 w-5 text-gray-400"
                x-description="Heroicon name: solid/arrow-narrow-right"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SearchPagination;
