import { useAppDispatch } from '@/hooks/redux-hooks';
import type { CommonData } from '@/types/common-data';
import { Menu, Transition } from '@headlessui/react';
import { ChatAltIcon, DotsVerticalIcon, PencilIcon, PresentationChartLineIcon, StarIcon, TrashIcon } from '@heroicons/react/solid';
import type { ReportDTO } from '@kyso-io/kyso-model';
import { deleteReportAction } from '@kyso-io/kyso-store';
import { classNames } from 'primereact/utils';
import React, { Fragment, useMemo } from 'react';
import { Helper } from '@/helpers/Helper';
import { ToasterMessages } from '@/helpers/ToasterMessages';
import { ToasterIcons } from '@/enums/toaster-icons';
import type { FileToRender } from '../types/file-to-render';

interface Props {
  report: ReportDTO;
  fileToRender: FileToRender | null;
  commonData: CommonData;
  hasPermissionDeleteReport: boolean;
  hasPermissionEditReport: boolean;
  onSetFileAsMainFile: () => void;
  version?: string;
  showToaster: (message: string, icon: JSX.Element) => void;
  isCurrentUserSolvedCaptcha: () => boolean;
  isCurrentUserVerified: () => boolean;
}

const UnpureReportActionDropdown = (props: Props) => {
  const { report, fileToRender, commonData, hasPermissionDeleteReport, hasPermissionEditReport, onSetFileAsMainFile, version, isCurrentUserVerified, isCurrentUserSolvedCaptcha, showToaster } = props;
  const dispatch = useAppDispatch();

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
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    if (!hasPermissionDeleteReport) {
      showToaster(ToasterMessages.noEnoughPermissions(), ToasterIcons.ERROR);
      return;
    }

    /* eslint-disable no-alert */
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    showToaster('Deleting...', ToasterIcons.INFO);
    await dispatch(deleteReportAction(report.id!));
    showToaster('Report deleted successfully!', ToasterIcons.SUCCESS);
    window.location.href = `/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}`;
  };

  return (
    <>
      <Menu as="div" className="p-1.5 px-2 font-medium hover:bg-gray-100 text-sm relative inline-block" style={{ zIndex: 3 }}>
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
              <Menu.Item>
                <a
                  href={`/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report.name}/analytics`}
                  className={classNames('text-gray-700', 'px-4 py-2 text-sm hover:bg-gray-100 group flex items-center')}
                >
                  <PresentationChartLineIcon className="mr-2 h-5 w-5 text-gray-700" />
                  Analytics
                </a>
              </Menu.Item>
              <Menu.Item>
                <a
                  href={`/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report.name}/tasks`}
                  className={classNames('text-gray-700', 'px-4 py-2 text-sm hover:bg-gray-100 group flex items-center')}
                >
                  <ChatAltIcon className="mr-2 h-5 w-5 text-gray-700" />
                  Tasks
                </a>
              </Menu.Item>
              {hasPermissionEditReport && (
                <React.Fragment>
                  <Menu.Item>
                    <a
                      onClick={() => {
                        const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

                        if (!isValid) {
                          return;
                        }

                        window.location.assign(`/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/create-report-form?reportId=${report.id}`);
                      }}
                      className={classNames('text-gray-700 px-4 py-2 text-sm hover:bg-gray-100 group flex items-center cursor-pointer')}
                    >
                      <PencilIcon className="mr-2 h-5 w-5 text-gray-700" />
                      Edit Report
                    </a>
                  </Menu.Item>
                </React.Fragment>
              )}
              {canChangeReportMainFile && (
                <Menu.Item>
                  <span onClick={onSetFileAsMainFile} className={classNames('text-gray-700', 'px-4 py-2 text-sm hover:bg-gray-100 group flex items-center cursor-pointer')}>
                    <StarIcon className="mr-2 h-5 w-5 text-gray-700" />
                    Set this file as main
                  </span>
                </Menu.Item>
              )}
              {hasPermissionDeleteReport && (
                <Menu.Item>
                  <a href="#" onClick={() => deleteReport()} className="text-rose-700 ', 'block px-4 py-2 text-sm hover:bg-gray-100 group flex items-center border-t">
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
    </>
  );
};

export default UnpureReportActionDropdown;
