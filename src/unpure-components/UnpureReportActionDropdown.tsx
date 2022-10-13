import { useAppDispatch } from '@/hooks/redux-hooks';
import type { CommonData } from '@/types/common-data';
import { Menu, Transition } from '@headlessui/react';
import { DotsVerticalIcon, FolderDownloadIcon, InformationCircleIcon, PencilIcon, TrashIcon, XIcon } from '@heroicons/react/solid';
import type { ReportDTO } from '@kyso-io/kyso-model';
import { classNames } from 'primereact/utils';
import { Fragment, useState } from 'react';
import { TailwindColor } from '@/tailwind/enum/tailwind-color.enum';
import { deleteReportAction } from '@kyso-io/kyso-store';
import ToasterNotification from '@/components/ToasterNotification';

interface Props {
  report: ReportDTO;
  commonData: CommonData;
  hasPermissionDeleteReport: boolean;
  hasPermissionEditReport: boolean;
  openMetadata: () => void;
}

const UnpureReportActionDropdown = (props: Props) => {
  const { report, commonData, hasPermissionDeleteReport, hasPermissionEditReport, openMetadata } = props;
  const dispatch = useAppDispatch();
  const [show, setShow] = useState(false);
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');

  const [alertText, setAlertText] = useState('Creating zip, this may take a moment...');

  const deleteReport = async () => {
    if (!hasPermissionDeleteReport) {
      setShowToaster(true);
      setMessageToaster('Insufficient permissions');
      return;
    }
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    setAlertText('Deleting...');
    await dispatch(deleteReportAction(report.id!));
    setAlertText('Deleted.');
    window.location.href = `/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}`;
  };

  return (
    <>
      <ToasterNotification
        show={showToaster}
        setShow={setShowToaster}
        message={messageToaster}
        backgroundColor={TailwindColor.SLATE_50}
        icon={<InformationCircleIcon className="h-6 w-6 text-rose-700" aria-hidden="true" />}
      />
      {/* <PureEditMetadata isOpen={isEditOpen} setOpen={() => openEdit(!isEditOpen)} report={report} commonData={commonData} authors={authors} /> */}
      {/* There is a option to delete in the "dots menu". Hiding this one */}
      {/* <PureKysoButton type={KysoButton.TERCIARY} onClick={() => deleteReport()} className={'relative inline-block text-rose-700 rounded-none  border border-r-0 border-y-0 border-gray-300 p-2'}>
        <TrashIcon className="mr-1 h-5 w-5 text-rose-700" aria-hidden="true" />
        Delete
      </PureKysoButton> */}

      <Menu as="div" className="p-1.5 px-2 font-medium hover:bg-gray-100 text-sm relative inline-block" style={{ zIndex: 1 }}>
        <Menu.Button className="rounded-full flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
          <span className="sr-only">Open options</span>
          <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
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
          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white border focus:outline-none">
            <div className="py-1">
              {hasPermissionEditReport && (
                <Menu.Item>
                  <a href="#" onClick={() => openMetadata()} className={classNames('text-gray-700', 'block px-4 py-2 text-sm hover:bg-gray-100 group flex items-center')}>
                    <PencilIcon className="mr-2 h-5 w-5 text-gray-700" />
                    Edit Report
                  </a>
                </Menu.Item>
              )}

              {hasPermissionDeleteReport && (
                <Menu.Item>
                  <a href="#" onClick={() => deleteReport()} className="text-rose-700 ', 'block px-4 py-2 text-sm hover:bg-gray-100 group flex items-center">
                    <TrashIcon className="mr-2 h-5 w-5 text-rose-700" aria-hidden="true" />
                    Delete
                  </a>
                </Menu.Item>
              )}
              {/* <Menu.Item>
                <a
                  href="#"
                  // onClick={() => }
                  className={classNames(
                    'text-gray-700',
                    'block px-4 py-2 text-sm hover:bg-gray-100'
                  )}
                >
                  Download current file as pdf
                </a>
            </Menu.Item> */}
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

export default UnpureReportActionDropdown;
