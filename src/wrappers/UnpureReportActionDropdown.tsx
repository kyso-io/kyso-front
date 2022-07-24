import { useAppDispatch } from '@/hooks/redux-hooks';
import { Fragment, useState } from 'react';
import { saveAs } from 'file-saver';
import classNames from '@/helpers/class-names';
import { DotsVerticalIcon, FolderDownloadIcon, XIcon } from '@heroicons/react/solid';
import { Menu, Transition } from '@headlessui/react';
import { downloadReportAction } from '@kyso-io/kyso-store';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import type { ReportDTO } from '@kyso-io/kyso-model';
import slugify from 'slugify';

const UnpureReportActionDropdown = () => {
  const report: ReportDTO = useCommonReportData();
  const dispatch = useAppDispatch();
  const [show, setShow] = useState(false);
  const [downloadText, setDownloadText] = useState('Creating zip, this may take a moment...');

  const downloadReport = async () => {
    setShow(true);
    const result = await dispatch(downloadReportAction(report.id!));
    setDownloadText('Downloading...');
    if (result.payload) {
      const blob = new Blob([result.payload], { type: 'application/zip' });
      saveAs(blob, `${slugify(report.name)}.zip`);
      setDownloadText('Download fininshed.');
    } else {
      setShow(true);
      setDownloadText('An error occured with the download.');
    }
  };

  return (
    <>
      <Menu as="div" className="z-50  relative inline-block text-left">
        <div>
          <Menu.Button className="rounded-full flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
            <span className="sr-only">Open options</span>
            <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white border focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                <a href="settings" className={classNames('text-gray-700', 'block px-4 py-2 text-sm hover:bg-gray-50')}>
                  Report settings
                </a>
              </Menu.Item>
              <Menu.Item>
                <a href="versions" className={classNames('text-gray-700', 'block px-4 py-2 text-sm hover:bg-gray-50')}>
                  Versions
                </a>
              </Menu.Item>
              <Menu.Item>
                <a href="#" onClick={() => downloadReport()} className={classNames('text-gray-700', 'block px-4 py-2 text-sm hover:bg-gray-50')}>
                  Download project as zip
                </a>
              </Menu.Item>
              {/* <Menu.Item>
                <a
                  href="#"
                  // onClick={() => }
                  className={classNames(
                    'text-gray-700',
                    'block px-4 py-2 text-sm hover:bg-gray-50'
                  )}
                >
                  Download current file as pdf
                </a>
            </Menu.Item>
             */}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
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
            <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity/5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <FolderDownloadIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">{downloadText}</p>
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

export default UnpureReportActionDropdown;
