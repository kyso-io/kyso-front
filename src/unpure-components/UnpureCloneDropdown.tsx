import { useAppDispatch } from '@/hooks/redux-hooks';
import type { CommonData } from '@/types/common-data';
import { KysoButton } from '@/types/kyso-button.enum';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon, ClipboardCopyIcon, FolderDownloadIcon, TerminalIcon, XIcon } from '@heroicons/react/outline';
import type { ReportDTO } from '@kyso-io/kyso-model';
import { downloadReportAction } from '@kyso-io/kyso-store';
import saveAs from 'file-saver';
import { Fragment, useState } from 'react';
import slugify from 'slugify';
import PureKysoButton from '@/components/PureKysoButton';

interface Props {
  reportUrl: string;
  report: ReportDTO;
  commonData: CommonData;
  hasPermissionDeleteReport: boolean;
  hasPermissionEditReport: boolean;
}

// function timeout(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

const UnpureCloneDropdown = (props: Props) => {
  const { reportUrl } = props;
  const { report } = props;
  const dispatch = useAppDispatch();
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alertText, setAlertText] = useState('Creating zip, this may take a moment...');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const downloadReport = async () => {
    setAlertText('Creating zip, this may take a moment...');
    setShow(true);
    const result = await dispatch(downloadReportAction(report.id!));
    setAlertText('Downloading...');
    if (result.payload) {
      const blob = new Blob([result.payload], { type: 'application/zip' });
      saveAs(blob, `${slugify(report.name)}.zip`);
      setAlertText('Download fininshed.');
    } else {
      setShow(true);
      setAlertText('An error occured with the download.');
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
                  <input value={cloneCommand} type="text" className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300" />
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
            <PureKysoButton type={KysoButton.TERCIARY} onClick={() => downloadReport()} className={'flex flex-row text-md font-medium'}>
              <div className="flex flex-row items-center space-x-2">
                <FolderDownloadIcon className="w-5 h-5 text-gray-900" />
                <div className="text-md font-medium text-gray-900">Download zip</div>
              </div>
            </PureKysoButton>
          </div>
        </Popover.Panel>
      </Popover>

      <div aria-live="assertive" className="z-50 fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start">
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto border ring-opacity/5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <FolderDownloadIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">{alertText}</p>
                  </div>
                  <div className="ml-4 shrink-0 flex">
                    <button
                      type="button"
                      className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => {
                        setShow(false);
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
};

export default UnpureCloneDropdown;
