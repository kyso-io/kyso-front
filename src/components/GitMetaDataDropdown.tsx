/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Popover } from '@headlessui/react';
import { ClipboardCopyIcon, TerminalIcon } from '@heroicons/react/outline';
import { useState } from 'react';
import type { FileToRender } from '../types/file-to-render';

interface Props {
  fileToRender: FileToRender;
}

const GitMetaDataDropdown = ({ fileToRender }: Props) => {
  const [copied, setCopied] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (
    <Popover as="div" className="relative inline-block">
      <Popover.Button className="p-1.5 px-2 font-medium hover:bg-gray-100 text-sm text-gray-700 flex flex-row items-center focus:ring-0 focus:outline-none">
        <img src="/assets/images/git.png" width={35} />
      </Popover.Button>
      <Popover.Panel className="min-w-[400px] p-4 origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white border focus:outline-none" style={{ zIndex: 1 }}>
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-row items-center space-x-2">
              <TerminalIcon className="w-5 h-5" />
              <div className="text-md font-medium">Report&apos;s Git URL</div>
            </div>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <div className="max-w-lg flex rounded-md shadow-sm">
                <input
                  defaultValue={fileToRender.git_metadata!.repository}
                  type="text"
                  className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
                />
                <button
                  type="button"
                  className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 sm:text-sm"
                  onClick={async () => {
                    navigator.clipboard.writeText(fileToRender.git_metadata!.repository);
                    setCopied(true);
                    if (timeoutId != null) {
                      clearTimeout(timeoutId);
                    }
                    const t: NodeJS.Timeout = setTimeout(() => {
                      setCopied(false);
                    }, 3000);
                    setTimeoutId(t);
                  }}
                >
                  {!copied && <ClipboardCopyIcon className="w-5 h-5" />}
                  {copied && 'Copied!'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Popover.Panel>
    </Popover>
  );
};

export default GitMetaDataDropdown;
