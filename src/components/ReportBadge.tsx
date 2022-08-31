import type { CommonData } from '@/types/common-data';
import { Menu, Transition } from '@headlessui/react';
import { BookmarkIcon, ChatIcon } from '@heroicons/react/outline';
import { BookmarkIcon as BookmarkIconSolid, EyeIcon, ThumbUpIcon } from '@heroicons/react/solid';
import type { ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import { ReportPermissionsEnum } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import { toSvg } from 'jdenticon';
import moment from 'moment';
import { Fragment, useMemo } from 'react';
import router from 'next/router';
import checkPermissions from '../helpers/check-permissions';
import PureAvatarGroup from './PureAvatarGroup';
import PureShareButton from './PureShareButton';

const MAX_LENGTH_DESCRIPTION: number = 200;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface Props {
  commonData: CommonData;
  report: ReportDTO;
  authors: UserDTO[];
  toggleUserStarReport: () => void;
  toggleUserPinReport?: () => void;
  toggleGlobalPinReport?: () => void;
}

const ReportBadge = ({ commonData, report, authors, toggleUserStarReport, toggleUserPinReport, toggleGlobalPinReport }: Props) => {
  const hasPermissionReportGlobalPin: boolean = useMemo(() => {
    return checkPermissions(commonData, ReportPermissionsEnum.GLOBAL_PIN);
  }, [commonData.organization, commonData.team, commonData.user]);
  const reportImage: string = useMemo(() => {
    if (report.preview_picture) {
      return report.preview_picture;
    }
    const svgString = toSvg(report.title, 400);
    return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svgString)}`;
  }, []);

  const onClickToggleUserStarReport = () => {
    if (!commonData.user) {
      return;
    }
    toggleUserStarReport();
  };

  const description: string = useMemo(() => {
    if (report?.description && report.description.length > MAX_LENGTH_DESCRIPTION) {
      return `${report.description.substring(0, MAX_LENGTH_DESCRIPTION)}...`;
    }
    return report?.description ? report.description : '';
  }, [report.description]);

  return (
    <div className={classNames(report.pin || report.user_pin ? ' border border-indigo-600' : '', 'bg-white rounded border')}>
      <div className="relative flex space-x-2">
        <div className="shrink-0">
          <div className="bg-stripes-sky-blue rounded-tl-lg text-center overflow-hidden mx-auto border-r border-r-gray-200">
            <img className="object-cover" style={{ width: 200, height: 200 }} src={reportImage} alt="report preview image" />
          </div>
        </div>
        <div className="flex-1 min-w-0 py-3 pr-3 relative">
          <a href={`/${report.organization_sluglified_name}/${report.team_sluglified_name}/${report.name}`} className="focus:outline-none">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{report.title}</h3>
            <p className="text-sm text-gray-500 pt-3">{description}</p>
          </a>
          <div className="absolute bottom-2 right-0">
            {report.report_type && (
              <span className="bg-orange-100 text-orange-800 text-xs font-semibold mr-2 px-2.5 py-1 rounded-xl dark:bg-orange-200 dark:text-orange-900">{report.report_type}</span>
            )}
            {report.tags.map((tag: string, indexTag: number) => (
              <span key={indexTag} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-1 rounded-xl dark:bg-blue-200 dark:text-blue-800">
                {tag}
              </span>
            ))}
          </div>
        </div>
        {commonData.user && (
          <div className="absolute top-0 right-0">
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button>
                {report.pin || report.user_pin ? (
                  <BookmarkIconSolid className="h-7 w-7 text-indigo-600 -mt-1 hover:text-indigo-700" />
                ) : (
                  <BookmarkIcon className="h-7 w-10 text-indigo-600 -mt-1 hover:text-indigo-700" />
                )}
              </Menu.Button>
              {toggleUserPinReport && toggleGlobalPinReport && (
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-gray-200 ring-opacity/5 focus:outline-none">
                    {hasPermissionReportGlobalPin && (
                      <Menu.Item>
                        {({ active }) => (
                          <div onClick={toggleGlobalPinReport} className={clsx('py-1 pointer rounded-md ', { 'bg-gray-50': active })}>
                            <button className={classNames(active ? 'bg-gray-50 text-gray-700' : 'text-gray-900', 'block px-4 py-2 text-sm')}>
                              {report.pin ? 'Remove pin for everyone' : 'Pin for everyone'}
                            </button>
                          </div>
                        )}
                      </Menu.Item>
                    )}
                    {!report.pin && (
                      <Menu.Item>
                        {({ active }) => (
                          <div onClick={toggleUserPinReport} className={clsx('py-1 pointer rounded-md ', { 'bg-gray-50': active })}>
                            <button className={classNames(active ? 'bg-gray-50 text-gray-700' : 'text-gray-900', 'block px-4 py-2 text-sm')}>
                              {report.user_pin ? 'Remove pin from the top' : 'Pin to the top'}
                            </button>
                          </div>
                        )}
                      </Menu.Item>
                    )}
                  </Menu.Items>
                </Transition>
              )}
            </Menu>
          </div>
        )}
      </div>
      <div className="flex items-center p-2 border-t">
        <div className="grow flex flex-row items-center text-gray-500 text-xs space-x-2">
          {authors && <PureAvatarGroup data={authors}></PureAvatarGroup>}
          <span className="pr-3">{moment(report.created_at).format('MMMM DD, YYYY')}</span>
          <EyeIcon className="shrink-0 h-5 w-5 text-gray-500" />
          <span className="pr-3">{report.views}</span>
          <ChatIcon className="shrink-0 h-5 w-5 text-orange-500" />
          <span>{report.comments.length}</span>
        </div>
        <div className="flex flex-row items-center text-gray-500 text-xs space-x-4">
          <PureShareButton report={report} basePath={router.basePath} commonData={commonData} color={'text-gray-500'} />
          <div className="flex flex-row items-center space-x-2 bg-white hover:bg-gray-100 p-2  rounded-md">
            <span>{report.stars}</span>
            <ThumbUpIcon
              className={clsx('shrink-0 h-5 w-5 text ', { 'cursor-pointer': commonData.user !== null })}
              color={report.mark_as_star_by_user ? '#4f46e5' : ''}
              onClick={onClickToggleUserStarReport}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBadge;
