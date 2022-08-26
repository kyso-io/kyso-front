import { Popover } from '@headlessui/react';
import { format } from 'date-fns';
import { ViewBoardsIcon } from '@heroicons/react/outline';
import type { Version } from '@/hooks/use-versions';
import classNames from '@/helpers/class-names';

interface Props {
  versions: Version[];
  version?: string;
  reportUrl: string;
}

const PureVersionsDropdown = (props: Props) => {
  const { reportUrl, versions, version } = props;

  return (
    <>
      <Popover as="div" className="relative inline-block">
        <Popover.Button className="p-1.5 px-2 font-medium hover:bg-gray-100 text-sm text-gray-700 flex flex-row items-center focus:ring-0 focus:outline-none">
          <ViewBoardsIcon className="w-5 h-5 mr-2" />
          {version ? `Version: #${version}` : 'Versions'}
        </Popover.Button>

        <Popover.Panel className="min-w-[400px] origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white border focus:outline-none z-50">
          <div className="flex flex-col">
            {versions?.map((item) => (
              <a
                aria-label="open"
                key={item.version}
                className={classNames('flex flex-row p-4 hover:bg-gray-200 items-center text-sm', item.version.toString() === version ? 'bg-gray-100' : '')}
                href={`${reportUrl}?version=${item.version}`}
              >
                <div className="text-gray-800 mr-1">Version #{item.version}</div>
                <div className="text-gray-500">
                  <span>published on: </span>
                  {format(new Date(item.created_at), 'HH:MM MMM d, yyyy')}
                </div>
              </a>
            ))}
          </div>
        </Popover.Panel>
      </Popover>
    </>
  );
};

export default PureVersionsDropdown;
