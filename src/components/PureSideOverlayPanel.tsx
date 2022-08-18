import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, MenuIcon } from '@heroicons/react/solid';
import type { ReactElement } from 'react';
import { useState, useRef } from 'react';
import { useEventListener } from 'usehooks-ts';
import classNames from '@/helpers/class-names';
import { getLocalStorageItem, setLocalStorageItem } from '@/helpers/isomorphic-local-storage';

type IPureSideOverlayPanel = {
  key?: string;
  children: ReactElement;
};

const PureSideOverlayPanel = (props: IPureSideOverlayPanel) => {
  const { key = 'overlay-panel-state', children } = props;
  const [open, setOpen] = useState(JSON.parse(getLocalStorageItem(key) || 'true'));

  const hoverRef = useRef(null);
  const tooltipRef = useRef(null);

  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const [isHover, setIsHover] = useState<boolean>(false);
  useEventListener('mouseenter', () => setIsHover(true), hoverRef);
  useEventListener('mouseleave', () => setIsHover(false), hoverRef);

  useEventListener(
    'mouseenter',
    () => {
      setTimeout(() => setShowTooltip(true), 100);
    },
    tooltipRef,
  );
  useEventListener('mouseleave', () => setShowTooltip(false), tooltipRef);

  const setOpenAndCache = () => {
    setLocalStorageItem(key, !open);
    setOpen(!open);

    setIsHover(false);
    setShowTooltip(false);
  };

  return (
    <div ref={hoverRef} className={classNames(open ? 'border-r bg-gray-50' : '')}>
      <div className="relative items-center flex flex-row w-full justify-end">
        <button ref={tooltipRef} type="button" className="m-4 p-2 border h-fit rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-0" onClick={() => setOpenAndCache()}>
          <span className="sr-only">Close panel</span>
          {open && <ChevronDoubleLeftIcon className="h-6 w-6" aria-hidden="true" />}
          {!open && !isHover && <MenuIcon className="h-6 w-6" aria-hidden="true" />}
          {!open && isHover && <ChevronDoubleRightIcon className="h-6 w-6" aria-hidden="true" />}
        </button>
        {showTooltip && (
          <div className="text-xs w-32 absolute flex flex-row items-center -right-32 z-10 py-2 px-3 font-medium text-white bg-gray-500 rounded-lg shadow-sm tooltip">
            <svg className="absolute -left-3 text-gray-500" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                className="stroke-gray-500 fill-gray-500"
                d="M15 17.898C15 18.972 13.7351 19.546 12.9268 18.8388L6.61617 13.3169C5.81935 12.6197 5.81935 11.3801 6.61617 10.6829L12.9268 5.16108C13.7351 4.45388 15 5.02785 15 6.1018L15 17.898Z"
              />
            </svg>
            {open && 'Close sidebar'}
            {!open && 'Lock sidebar open'}
          </div>
        )}
      </div>

      {(open || isHover) && <div className={classNames('bg-white px-2 py-16', isHover && !open ? 'fixed z-50 shadow-lg border rounded-r' : '', open ? 'bg-gray-50' : '')}>{children}</div>}
    </div>
  );
};

export default PureSideOverlayPanel;
