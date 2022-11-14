import ToasterNotification from '@/components/ToasterNotification';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { TailwindColor } from '@/tailwind/enum/tailwind-color.enum';
import type { CommonData } from '@/types/common-data';
import { Menu, Transition } from '@headlessui/react';
import { DotsVerticalIcon, FolderDownloadIcon, InformationCircleIcon, PencilIcon, StarIcon, TrashIcon } from '@heroicons/react/solid';
import type { ReportDTO } from '@kyso-io/kyso-model';
import { deleteReportAction } from '@kyso-io/kyso-store';
import { classNames } from 'primereact/utils';
import React, { Fragment, useMemo, useState } from 'react';
import type { FileToRender } from '../types/file-to-render';

interface Props {
  report: ReportDTO;
  fileToRender: FileToRender | null;
  commonData: CommonData;
  hasPermissionDeleteReport: boolean;
  hasPermissionEditReport: boolean;
  openMetadata: () => void;
  onSetFileAsMainFile: () => void;
  version?: string;
}

const UnpureReportActionDropdown = (props: Props) => {
  const { report, fileToRender, commonData, hasPermissionDeleteReport, hasPermissionEditReport, openMetadata, onSetFileAsMainFile, version } = props;
  const dispatch = useAppDispatch();
  const [show, setShow] = useState(false);
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
  const [alertText, setAlertText] = useState('Creating zip, this may take a moment...');
  const canChangeReportMainFile: boolean = useMemo(() => {
    if (!hasPermissionEditReport || !report || !fileToRender) {
      return false;
    }
    let versionNumber: number | null = null;
    if (version) {
      try {
        versionNumber = parseInt(version, 10);
      } catch (e) {}
    }
    return (versionNumber === null || versionNumber === report.last_version) && report.main_file_id !== fileToRender.id;
  }, [hasPermissionEditReport, report, fileToRender]);

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
                <React.Fragment>
                  <Menu.Item>
                    <a
                      href={`/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/create-report-form?reportId=${report.id}`}
                      className={classNames('text-gray-700', 'block px-4 py-2 text-sm hover:bg-gray-100 group flex items-center')}
                    >
                      <PencilIcon className="mr-2 h-5 w-5 text-gray-700" />
                      Edit Report
                    </a>
                  </Menu.Item>
                  <Menu.Item>
                    <a href="#" onClick={() => openMetadata()} className={classNames('text-gray-700', 'block px-4 py-2 text-sm hover:bg-gray-100 group flex items-center')}>
                      <PencilIcon className="mr-2 h-5 w-5 text-gray-700" />
                      Change picture
                    </a>
                  </Menu.Item>
                </React.Fragment>
              )}
              {canChangeReportMainFile && (
                <Menu.Item>
                  <span onClick={onSetFileAsMainFile} className={classNames('text-gray-700', 'block px-4 py-2 text-sm hover:bg-gray-100 group flex items-center cursor-pointer')}>
                    <StarIcon className="mr-2 h-5 w-5 text-gray-700" />
                    Set this file as main
                  </span>
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
      <ToasterNotification show={show} setShow={setShow} icon={<FolderDownloadIcon className="h-6 w-6 text-green-400" aria-hidden="true" />} message={alertText} />
    </>
  );
};

export default UnpureReportActionDropdown;
