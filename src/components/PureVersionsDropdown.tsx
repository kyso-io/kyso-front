import classNames from '@/helpers/class-names';
import type { Version } from '@/hooks/use-versions';
import { Popover } from '@headlessui/react';
import { ViewBoardsIcon } from '@heroicons/react/outline';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface Props {
  versions: Version[];
  version?: string;
  reportUrl: string;
}

const PureVersionsDropdown = (props: Props) => {
  const { reportUrl, versions, version } = props;

  const currentVersion: number = useMemo(() => {
    if (version) {
      return parseInt(version, 10);
    }
    if (!versions || versions.length === 0) {
      return 1;
    }
    return versions[0]!.version;
  }, [version, versions]);

  return (
    <>
      <Popover as="div" className="relative inline-block">
        <Popover.Button className="p-1.5 px-2 font-medium hover:bg-gray-100 text-sm text-gray-700 flex flex-row items-center focus:ring-0 focus:outline-none">
          <ViewBoardsIcon className="w-5 h-5 mr-2" />
          Version: #{currentVersion}
        </Popover.Button>

        <Popover.Panel className="min-w-[400px] origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white border focus:outline-none z-50 py-2">
          <div className="flex flex-col">
            {versions?.map((item) => (
              <a
                aria-label="open"
                key={item.version}
                className={classNames('px-4 py-2 hover:bg-gray-100 items-center text-sm', item.version === currentVersion ? 'bg-gray-100' : '')}
                href={`${reportUrl}?version=${item.version}`}
              >
                <div className="flex flex-row">
                  <div className="text-gray-800 mr-1">Version #{item.version}</div>
                  <div className="text-gray-500">
                    <span>published on: </span>
                    {format(new Date(item.created_at), 'HH:MM MMM d, yyyy')}
                  </div>
                </div>
                {item.message && <div className="text-gray-400 pl-2 hover:bg-gray-100 items-center text-sm mt-1">{item.message}</div>}
              </a>
            ))}
          </div>
        </Popover.Panel>
      </Popover>
    </>
  );
};

export default PureVersionsDropdown;
