import { Menu, Transition } from '@headlessui/react';
import { BookmarkIcon, ChatIcon } from '@heroicons/react/outline';
import { BookmarkIcon as BookmarkIconSolid, EyeIcon, ShareIcon, ThumbUpIcon } from '@heroicons/react/solid';
import type { ReportDTO } from '@kyso-io/kyso-model';
import { ReportPermissionsEnum } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import { toSvg } from 'jdenticon';
import moment from 'moment';
import { useRouter } from 'next/router';
import { Fragment, useMemo } from 'react';
import checkPermissions from '../helpers/check-permissions';
import type { CommonData } from '../hooks/use-common-data';
import { useCommonData } from '../hooks/use-common-data';

const MAX_LENGTH_DESCRIPTION: number = 200;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface Props {
  report: ReportDTO;
  toggleUserStarReport: () => void;
  toggleUserPinReport: () => void;
  toggleGlobalPinReport: () => void;
}

const ReportBadge = ({ report, toggleUserStarReport, toggleUserPinReport, toggleGlobalPinReport }: Props) => {
  const router = useRouter();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });

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
    <div className="bg-white rounded-lg shadow" style={{ height: 262 }}>
      <div className="relative bg-white shadow-sm flex space-x-3">
        <div className="shrink-0">
          <div className="bg-stripes-sky-blue rounded-tl-lg text-center overflow-hidden mx-auto">
            <img className="object-fill h-56" style={{ width: 224, height: 224 }} src={reportImage} alt="report preview image" />
          </div>
        </div>
        <div className="flex-1 min-w-0 py-3 pr-2 relative">
          <a href="#" className="focus:outline-none">
            <p className="text-sm font-medium text-gray-900 pb-2">{report.title}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </a>
          <div className="absolute bottom-2 right-0">
            {report.report_type && <span className="bg-orange-100 text-orange-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-orange-200 dark:text-orange-900">{report.report_type}</span>}
            {report.tags.map((tag: string, indexTag: number) => (
              <span key={indexTag} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
                {tag}
              </span>
            ))}
          </div>
        </div>
        {commonData.user && (
          <div className="absolute top-0 right-0">
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button>{report.pin || report.user_pin ? <BookmarkIconSolid className="h-7 w-7 text-violet-400" /> : <BookmarkIcon className="h-7 w-10 text-violet-400" />}</Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity/5 focus:outline-none">
                  {hasPermissionReportGlobalPin && (
                    <Menu.Item>
                      {({ active }) => (
                        <div onClick={toggleGlobalPinReport} className={clsx('py-1 pointer', { 'bg-gray-100': active })}>
                          <button className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm')}>
                            {report.pin ? 'Remove pin for everyone' : 'Pin for everyone'}
                          </button>
                        </div>
                      )}
                    </Menu.Item>
                  )}
                  {!report.pin && (
                    <Menu.Item>
                      {({ active }) => (
                        <div onClick={toggleUserPinReport} className={clsx('py-1 pointer', { 'bg-gray-100': active })}>
                          <button className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm')}>
                            {report.user_pin ? 'Remove pin from the top' : 'Pin to the top'}
                          </button>
                        </div>
                      )}
                    </Menu.Item>
                  )}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        )}
      </div>
      <div className="-mt-px flex items-center p-2">
        <div className="grow flex flex-row items-center">
          <img className="w-6 h-6 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="Rounded avatar" />
          <span className="text-gray-500 text-sm pl-2 pr-5">{moment(report.created_at).format('MMMM DD, YYYY')}</span>
          <EyeIcon className="shrink-0 h-5 w-5" />
          <span className="text-gray-500 text-sm pl-2 pr-5">{report.views}</span>
          <ChatIcon className="shrink-0 h-5 w-5 text-orange-400" />
          <span className="text-gray-500 text-sm pl-2 pr-5">{report.comments.length}</span>
        </div>
        <ShareIcon className="shrink-0 h-5 w-5" />
        <span className="text-gray-500 text-sm pl-5 pr-2">{report.stars}</span>
        <ThumbUpIcon className={clsx('shrink-0 h-5 w-5', { 'cursor-pointer': commonData.user !== null })} color={report.mark_as_star_by_user ? 'blue' : ''} onClick={onClickToggleUserStarReport} />
      </div>
    </div>
  );
};

export default ReportBadge;
