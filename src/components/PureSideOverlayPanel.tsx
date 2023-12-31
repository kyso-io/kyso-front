import classNames from '@/helpers/class-names';
import { getLocalStorageItem, setLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, MenuIcon } from '@heroicons/react/solid';
import clsx from 'clsx';
import type { MouseEvent, ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';
import { useEvent } from '../hooks/use-event';

type IPureSideOverlayPanel = {
  cacheKey?: string;
  children: ReactElement;
  setSidebarOpen: (p: boolean) => void;
};

type UseResizeProps = {
  minWidth: number;
};

type UseResizeReturn = {
  width: number;
  enableResize: (e: MouseEvent) => void;
  isResizing: boolean;
};

const useResize = (props: UseResizeProps): UseResizeReturn => {
  const [isResizing, setIsResizing] = useState(false);

  const { minWidth } = props;

  const [width, setWidth] = useState<number>(minWidth);

  const enableResize = useCallback(
    (e: MouseEvent) => {
      if (e.stopPropagation) {
        e.stopPropagation();
      }
      if (e.preventDefault) {
        e.preventDefault();
      }
      setIsResizing(true);
    },
    [setIsResizing],
  );

  const disableResize = useCallback(() => {
    setIsResizing(false);
  }, [setIsResizing]);

  const resize = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      if (isResizing) {
        const newWidth = e.clientX; // You may want to add some offset here from props
        if (newWidth >= 200 && newWidth <= 1000) {
          setWidth(newWidth + 80);
        }
      }
    },
    [minWidth, isResizing, setWidth, width],
  );

  useEffect(() => {
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', disableResize);

    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', disableResize);
    };
  }, [disableResize, resize]);

  return { width, enableResize, isResizing };
};

const PureSideOverlayPanel = (props: IPureSideOverlayPanel) => {
  const { cacheKey = 'overlay-panel-state', children, setSidebarOpen } = props;
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [isHover, setIsHover] = useState<boolean>(false);
  const hoverRef = useRef(null);
  const tooltipRef = useRef(null);
  const { width, enableResize } = useResize({ minWidth: 300 });
  const { emitEvent } = useEvent();

  useEffect(() => {
    if (getLocalStorageItem(cacheKey)) {
      setOpenAndCache(JSON.parse(getLocalStorageItem(cacheKey)!));
      setOpen(JSON.parse(getLocalStorageItem(cacheKey)!));
    }
  }, []);

  useEventListener(
    'mouseenter',
    () => {
      setIsHover(true);
      emitEvent({ type: 'sidebar-hover', payload: true });
    },
    hoverRef,
  );
  useEventListener(
    'mouseleave',
    () => {
      setIsHover(false);
      emitEvent({ type: 'sidebar-hover', payload: false });
    },
    hoverRef,
  );
  useEventListener('mouseenter', () => setShowTooltip(true), tooltipRef);
  useEventListener('mouseleave', () => setShowTooltip(false), tooltipRef);

  const setOpenAndCache = (openValue: boolean) => {
    setLocalStorageItem(cacheKey, openValue);
    setOpen(openValue);
    setSidebarOpen(openValue);
    setIsHover(false);
    setShowTooltip(false);
  };

  return (
    <>
      <div
        ref={hoverRef}
        className="-mb-10"
        style={{
          width: open ? `${width}px` : '',
        }}
      >
        <div className={classNames('relative items-center flex flex-row w-full justify-end')}>
          <button ref={tooltipRef} type="button" className="m-4 p-2 border h-fit rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-0" onClick={() => setOpenAndCache(!open)}>
            <span className="sr-only">Close panel</span>
            {open && <ChevronDoubleLeftIcon className="h-6 w-6" aria-hidden="true" />}
            {!open && !isHover && <MenuIcon className="h-6 w-6" aria-hidden="true" />}
            {!open && isHover && <ChevronDoubleRightIcon className="h-6 w-6" aria-hidden="true" />}
          </button>
          {showTooltip && (
            <div className={clsx('text-xs absolute flex flex-row items-center z-10 py-2 px-3 font-medium text-white bg-gray-500 rounded-lg shadow-sm tooltip', open ? '-right-24' : 'w-28 -right-28')}>
              <svg className="absolute -left-3 text-gray-500" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  className="stroke-gray-500 fill-gray-500"
                  d="M15 17.898C15 18.972 13.7351 19.546 12.9268 18.8388L6.61617 13.3169C5.81935 12.6197 5.81935 11.3801 6.61617 10.6829L12.9268 5.16108C13.7351 4.45388 15 5.02785 15 6.1018L15 17.898Z"
                />
              </svg>
              {open ? 'Close sidebar' : 'Open sidebar'}
            </div>
          )}
        </div>

        {(open || isHover) && (
          <div
            className={classNames(
              'bg-white px-2 py-2 min-h-[400px]',
              isHover && !open ? 'absolute z-50 shadow-lg border rounded-r min-w-[300px]' : '',
              open ? 'bg-gray-50' : '',
              'text-ellipsis overflow-hidden',
            )}
          >
            {children}
          </div>
        )}

        {open && <div className="absolute inset-y-0 w-1 right-0cursor-ew-resize" onMouseDown={enableResize} />}
      </div>
    </>
  );
};

export default PureSideOverlayPanel;
