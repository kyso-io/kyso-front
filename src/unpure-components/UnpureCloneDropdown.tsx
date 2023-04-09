/* eslint-disable  @typescript-eslint/no-explicit-any */
import PureKysoButton from '@/components/PureKysoButton';
import type { CommonData } from '@/types/common-data';
import { KysoButton } from '@/types/kyso-button.enum';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon, ClipboardCopyIcon, FolderDownloadIcon, TerminalIcon } from '@heroicons/react/outline';
import type { ReportDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import saveAs from 'file-saver';
import { useState } from 'react';
import slugify from 'slugify';
import { ToasterIcons } from '@/enums/toaster-icons';

interface Props {
  reportUrl: string;
  report: ReportDTO;
  commonData: CommonData;
  // hasPermissionDeleteReport: boolean; // refactor: This is not being used... and makes no sense, here we dont delete any report
  // hasPermissionEditReport: boolean;   // refactor: This is not being used... and makes no sense, here we dont edit any report
  isCurrentUserSolvedCaptcha: () => boolean;
  isCurrentUserVerified: () => boolean;
  showToaster: (message: string, icon: JSX.Element) => void;
}

const UnpureCloneDropdown = ({ reportUrl, commonData, report, isCurrentUserSolvedCaptcha, isCurrentUserVerified, showToaster }: Props) => {
  const [copied, setCopied] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const downloadReport = async () => {
    if (!isCurrentUserVerified() || !isCurrentUserSolvedCaptcha()) {
      return;
    }

    showToaster('Creating zip file, this may take a moment...', ToasterIcons.INFO);

    try {
      const api: Api = new Api(commonData.token);
      const result: Buffer = await api.downloadReport(report.id!);
      const blob = new Blob([result], { type: 'application/zip' });
      saveAs(blob, `${slugify(report.name)}.zip`);
      showToaster('Download finished!', ToasterIcons.INFO);
    } catch (e: any) {
      const errorData: any = JSON.parse(Buffer.from(e.response.data).toString());
      showToaster(`Something happened: ${errorData.message}`, ToasterIcons.ERROR);
    }
  };

  const cloneCommand = `kyso clone ${reportUrl}`;

  return (
    <>
      <Popover as="div" className="relative inline-block">
        <Popover.Button className="p-1.5 px-2 font-medium hover:bg-gray-100 text-sm text-gray-700 flex flex-row items-center focus:ring-0 focus:outline-none">
          Clone
          <ChevronDownIcon className="w-5 h-5" />
        </Popover.Button>

        <Popover.Panel className="min-w-[400px] p-4 origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white border focus:outline-none" style={{ zIndex: 1 }}>
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-row items-center space-x-2">
                <TerminalIcon className="w-5 h-5" />
                <div className="text-md font-medium">Clone with Kyso CLI</div>
              </div>

              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <div className="max-w-lg flex rounded-md shadow-sm">
                  <input
                    defaultValue={cloneCommand}
                    type="text"
                    className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
                  />
                  <button
                    type="button"
                    className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 sm:text-sm"
                    onClick={async () => {
                      navigator.clipboard.writeText(cloneCommand);
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
            <PureKysoButton type={KysoButton.TERCIARY} onClick={() => downloadReport()} className={'flex flex-row text-base font-medium text-gray-900'}>
              <div className="flex flex-row items-center space-x-2">
                <FolderDownloadIcon className="w-6 h-6 text-gray-900" />
                <div className="text-base font-medium text-gray-900">Download zip</div>
              </div>
            </PureKysoButton>
          </div>
        </Popover.Panel>
      </Popover>
    </>
  );
};

export default UnpureCloneDropdown;
