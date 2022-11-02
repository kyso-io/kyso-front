import type { CommonData } from '@/types/common-data';
import type { ReactElement } from 'react';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, MenuIcon } from '@heroicons/react/solid';
import { useRef, useState, useEffect } from 'react';
import { useEventListener } from 'usehooks-ts';
import classNames from '@/helpers/class-names';
import { setLocalStorageItem, getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import { Tooltip } from 'primereact/tooltip';
import { ChatAltIcon } from '@heroicons/react/outline';

type IPureSideOverlayCommentsPanel = {
  cacheKey?: string;
  children: ReactElement;
  setSidebarOpen: (p: boolean) => void;
  commonData: CommonData;
};

const PureSideOverlayCommentsPanel = (props: IPureSideOverlayCommentsPanel) => {
  const { cacheKey = 'overlay-panel-comment-state', children, setSidebarOpen, commonData } = props;
  const [open, setOpen] = useState(true);
  const hoverRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!commonData.user) {
      return;
    }
    if (getLocalStorageItem(cacheKey)) {
      setOpenAndCache(JSON.parse(getLocalStorageItem(cacheKey)!));
      setOpen(JSON.parse(getLocalStorageItem(cacheKey)!));
    }
  }, [commonData.user]);

  const [isHover, setIsHover] = useState<boolean>(false);
  useEventListener('mouseenter', () => setIsHover(true), hoverRef);
  useEventListener('mouseleave', () => setIsHover(false), hoverRef);

  const setOpenAndCache = (openValue: boolean) => {
    setLocalStorageItem(cacheKey, openValue);
    setOpen(openValue);
    setSidebarOpen(openValue);
    setIsHover(false);
  };

  return (
    <>
      <div ref={hoverRef}>
        <div className={classNames('relative items-center flex flex-row w-full justify-end')}>
          <Tooltip target=".overlay-comments-info" />
          <button
            ref={tooltipRef}
            data-pr-position="top"
            type="button"
            className="overlay-comments-info m-4 p-2 border h-fit rounded-md text-gray-900 hover:text-gray-700 focus:outline-none focus:ring-0 hover:bg-gray-50"
            data-pr-tooltip={open ? 'Lock closed' : 'Lock open'}
            onClick={() => setOpenAndCache(!open)}
          >
            <span className="sr-only">Close panel</span>
            <span className="flex">
              <ChatAltIcon className="h-4 w-4 mt-1" aria-hidden="true" />
              {open && <ChevronDoubleRightIcon className="pl-2 h-6 w-6" aria-hidden="true" />}
              {!open && !isHover && <MenuIcon className="pl-2 h-6 w-6" aria-hidden="true" />}
              {!open && isHover && <ChevronDoubleLeftIcon className="pl-2 h-6 w-6" aria-hidden="true" />}
            </span>
          </button>
        </div>

        {open && <div className={classNames('bg-white px-2 py-2 min-h-[400px] text-ellipsis overflow-hidden')}>{children}</div>}
      </div>
    </>
  );
};

export default PureSideOverlayCommentsPanel;
