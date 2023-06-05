import classNames from '@/helpers/class-names';
import { getLocalStorageItem, setLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import type { CommonData } from '@/types/common-data';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, MenuIcon } from '@heroicons/react/solid';
import { Tooltip } from 'primereact/tooltip';
import type { ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';
import KTasksIcon from '../icons/KTasksIcon';

type IPureSideOverlayCommentsPanel = {
  cacheKey?: string;
  children: ReactElement;
  setSidebarOpen: (p: boolean) => void;
  commonData: CommonData;
  tooltipCloseText?: string;
  tooltipOpenText?: string;
  icon?: ReactElement;
};

const PureSideOverlayCommentsPanel = (props: IPureSideOverlayCommentsPanel) => {
  const { icon, cacheKey = 'overlay-panel-comment-state', children, setSidebarOpen, commonData } = props;
  let { tooltipCloseText, tooltipOpenText } = props;
  const [open, setOpen] = useState(true);
  const hoverRef = useRef(null);
  const tooltipRef = useRef(null);

  if (!tooltipOpenText) {
    tooltipOpenText = 'Lock open';
  }

  if (!tooltipCloseText) {
    tooltipCloseText = 'Lock closed';
  }

  useEffect(() => {
    if (!commonData.user) {
      // Collapse by default and hide the inline comments section
      setOpenAndCache(false);
      setOpen(false);

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
            data-pr-tooltip={open ? tooltipCloseText : tooltipOpenText}
            onClick={() => setOpenAndCache(!open)}
          >
            <span className="sr-only">Close panel</span>
            <span className="flex">
              {!icon && <KTasksIcon className="h-4 w-4 mt-1" aria-hidden="true" />}
              {icon && <>{icon}</>}
              {open && <ChevronDoubleRightIcon className="pl-2 h-6 w-6" aria-hidden="true" />}
              {!open && !isHover && <MenuIcon className="pl-2 h-6 w-6" aria-hidden="true" />}
              {!open && isHover && <ChevronDoubleLeftIcon className="pl-2 h-6 w-6" aria-hidden="true" />}
            </span>
          </button>
        </div>
        {open && (
          <div className={classNames('bg-white px-2 py-2 text-ellipsis overflow-hidden')} style={{ height: 'auto', overflow: 'visible' }}>
            {children}
          </div>
        )}
      </div>
    </>
  );
};

export default PureSideOverlayCommentsPanel;
