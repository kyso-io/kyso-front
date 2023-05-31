/* eslint-disable tailwindcss/no-contradicting-classname */
import classNames from '@/helpers/class-names';
import type { Version } from '@/hooks/use-versions';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Popover } from '@headlessui/react';
import { FlagIcon } from '@heroicons/react/outline';
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
          <FlagIcon className="w-5 h-5 mr-2" />
          Version: #{currentVersion}
        </Popover.Button>
        <Popover.Panel className="min-w-[400px] max-h-[320px] overflow-auto origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white border focus:outline-none z-50 py-2">
          <div className="flex flex-col  relative">
            {versions?.map((item: Version) => (
              <a key={item.version} className="px-4 py-2 hover:bg-gray-100" href={`${reportUrl}?version=${item.version}`}>
                <div aria-label="open" className={classNames('items-center text-sm', item.version === currentVersion ? 'bg-gray-100' : '')}>
                  <div className="flex flex-row">
                    <div className="text-gray-800 mr-1">Version #{item.version}</div>
                    <div className="text-gray-500">
                      <span>published on: </span>
                      {format(new Date(item.created_at), 'HH:MM MMM d, yyyy')}
                    </div>
                  </div>
                  {item.message && <div className="text-gray-400 pl-2 hover:bg-gray-100 items-center text-sm mt-1">{item.message}</div>}
                </div>
                {item.git_commit && (
                  <div className="text-xs bg-gray-100 text-gray-500 rounded bg-slate-50">
                    <div className="flex flex-row content-center items-center mt-2 py-1 px-2">
                      <FontAwesomeIcon
                        style={{
                          marginRight: 8,
                        }}
                        icon={faGithub}
                      />
                      <span className="grow">{item.git_commit.message}</span>
                    </div>
                    <div className="flex flex-row content-center justify-end items-center text-xxs py-1 px-2">
                      <code>{item.git_commit.hash.slice(0, 8)}</code>
                      <span className="ml-1">on {format(new Date(item.git_commit.date), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  </div>
                )}
              </a>
            ))}
          </div>
        </Popover.Panel>
      </Popover>
    </>
  );
};

export default PureVersionsDropdown;
