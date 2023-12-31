import type { CommonData } from '@/types/common-data';
import { Menu, Transition } from '@headlessui/react';
import { SelectorIcon } from '@heroicons/react/outline';
import { Fragment } from 'react';
import Link from 'next/link';
import { TailwindWidthSizeEnum } from '../tailwind/enum/tailwind-width.enum';
import ChannelList from './ChannelList';
import ChannelVisibility from './ChannelVisibility';

type IChannelSelectorProps = {
  commonData: CommonData;
  basePath: string;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const ChannelSelector = (props: IChannelSelectorProps) => {
  const { commonData, basePath } = props;

  return (
    <div className="rounded-md flex items-center">
      {commonData.team && (
        <Link
          href={`/${commonData.organization?.sluglified_name}/${commonData.team.sluglified_name}`}
          className="hover:bg-gray-100 border-y border-l rounded-l p-2 p-x-4 flex items-center w-fit text-xs lg:text-sm text-left font-medium text-gray-700"
        >
          {commonData.team?.display_name}
          <ChannelVisibility
            containerClasses="ml-3"
            teamVisibility={commonData.team?.visibility}
            imageWidth={TailwindWidthSizeEnum.W3}
            imageMarginX={TailwindWidthSizeEnum.W3}
            imageMarginY={TailwindWidthSizeEnum.W1}
          />
        </Link>
      )}
      <Menu as="div" className="relative w-fit inline-block text-left">
        <Menu.Button
          className={classNames(
            'hover:bg-gray-100 border p-2 flex items-center w-fit text-xs lg:text-sm text-left font-medium text-gray-700 hover:outline-none',
            commonData.team ? 'rounded-r' : 'rounded',
          )}
        >
          {!commonData.team ? `Select channel` : ''}
          <div className={classNames(!commonData.team ? 'pl-2' : '')}>
            <SelectorIcon className="shrink-0 h-5 w-5 text-gray-700 group-hover:text-gray-500" aria-hidden="true" />
          </div>
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className=" z-50 origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-slate-200 ring-opacity/5 divide-y divide-gray-100 focus:outline-none">
            <div className="p-2">
              <ChannelList basePath={basePath} commonData={commonData} showScroll={true} />
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export { ChannelSelector };
