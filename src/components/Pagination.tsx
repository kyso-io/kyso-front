import { ArrowNarrowLeftIcon, ArrowNarrowRightIcon } from '@heroicons/react/solid';
import clsx from 'clsx';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

// https://gist.github.com/kottenator/9d936eb3e4e3c3e02598

const getRange = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

const clamp = (number: number, lower: number, upper: number): number => {
  return Math.min(Math.max(number, lower), upper);
};

const pagination = (currentPageArg: number, pageCount: number, pagesShownArg: number, MINIMUM_PAGE_SIZE: number = 5) => {
  let delta: number;
  const currentPage: number = clamp(currentPageArg, 1, pageCount);
  const pagesShown: number = clamp(pagesShownArg, MINIMUM_PAGE_SIZE, pageCount);
  const centerPagesShown: number = pagesShown - 5;
  const boundaryPagesShown: number = pagesShown - 3;

  if (pageCount <= pagesShown) {
    delta = pagesShown;
  } else {
    delta = currentPage < boundaryPagesShown || currentPage > pageCount - boundaryPagesShown ? boundaryPagesShown : centerPagesShown;
  }

  const range = {
    start: Math.round(currentPage - delta / 2),
    end: Math.round(currentPage + delta / 2),
  };

  if (range.start - 1 === 1 || range.end + 1 === pageCount) {
    range.start += 1;
    range.end += 1;
  }
  let pages: (string | number)[] = currentPage > delta ? getRange(Math.min(range.start, pageCount - delta), Math.min(range.end, pageCount)) : getRange(1, Math.min(pageCount, delta + 1));

  if (currentPage > pageCount - boundaryPagesShown && pageCount > pagesShown) {
    pages = getRange(pageCount - delta, pageCount);
  }

  const withDots = (value: number, pair: (string | number)[]) => (pages.length + 1 !== pageCount ? pair : [value]);
  const lastPage = pages[pages.length - 1];

  if (pages[0] !== 1) {
    pages = withDots(1, [1, '...']).concat(pages);
  }

  if (lastPage && lastPage < pageCount) {
    pages = pages.concat(withDots(pageCount, ['...', pageCount]));
  }

  return pages;
};

interface Props {
  page: number;
  numPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ page, numPages, onPageChange }: Props) => {
  const pagesJsx: ReactElement[] = useMemo(() => {
    const pages: (string | number)[] = pagination(page, numPages, 7);
    const result: ReactElement[] = [];
    pages.forEach((element: number | string, index: number) => {
      if (element === '...') {
        result.push(
          <span key={index} className="border-transparent text-gray-500 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium">
            ...
          </span>,
        );
      } else if (element === page) {
        result.push(
          <button key={index} className="border-indigo-500 text-indigo-600 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium" aria-current="page">
            {element}
          </button>,
        );
      } else {
        result.push(
          <button
            key={index}
            onClick={() => onPageChange(element as number)}
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
          >
            {element}
          </button>,
        );
      }
    });
    return result;
  }, [page, numPages]);

  return (
    <nav className="border-t border-gray-200 px-4 flex items-center justify-between sm:px-0">
      <div className="-mt-px w-0 flex-1 flex">
        <button
          onClick={() => {
            if (page - 1 <= 0) {
              return;
            }
            onPageChange(page - 1);
          }}
          className={clsx(
            'border-t-2 border-transparent pt-4 pr-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300',
            page === 1 && 'cursor-not-allowed',
          )}
        >
          <ArrowNarrowLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
          Previous
        </button>
      </div>
      <div className="hidden md:-mt-px md:flex">{pagesJsx}</div>
      <div className="-mt-px w-0 flex-1 flex justify-end">
        <button
          onClick={() => {
            if (page + 1 > numPages) {
              return;
            }
            onPageChange(page + 1);
          }}
          className={clsx(
            'border-t-2 border-transparent pt-4 pl-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300',
            page === numPages && 'cursor-not-allowed',
          )}
        >
          Next
          <ArrowNarrowRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
