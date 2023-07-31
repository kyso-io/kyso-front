import PureChangeReportImage from '@/components/PureChangeReportImage';
import type { CommonData } from '@/types/common-data';
import { BookmarkIcon as BookmarkIconOutline, ChatIcon } from '@heroicons/react/outline';
import { EyeIcon, ThumbUpIcon } from '@heroicons/react/solid';
import type { ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import { ReportPermissionsEnum } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import { toSvg } from 'jdenticon';
import moment from 'moment';
import { Tooltip } from 'primereact/tooltip';
import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { HelperPermissions } from '../helpers/check-permissions';
import PureAvatarGroup from './PureAvatarGroup';
import PureShareButton from './PureShareButton';
import PureTagGroup from './PureTagGroup';

const MAX_LENGTH_DESCRIPTION: number = 700;

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
  const random: string = uuidv4();

  const hasPermissionReportGlobalPin: boolean = useMemo(
    () => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.GLOBAL_PIN),
    [commonData.organization, commonData.team, commonData.user],
  );

  const hasPermissionEditReport: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.EDIT), [commonData, random]);

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
          <PureChangeReportImage commonData={commonData} hasPermissionEditReport={hasPermissionEditReport} reportImage={reportImage} report={report} />
        </div>
        <div className="flex-1 min-w-0 py-3 pr-3 relative">
          <a href={`/${report.organization_sluglified_name}/${report.team_sluglified_name}/${report.name}`} className="focus:outline-none">
            <h3 className="text-sm md:text-lg leading-6 font-medium text-gray-900 break-words">{report.title}</h3>
            <p className="text-xs md:text-sm text-gray-500 pt-3 break-words">{description}</p>
          </a>
          <div className="hidden md:block absolute bottom-2 right-0">
            <PureTagGroup tags={report.tags} />
          </div>
        </div>
        {commonData.user && (
          <div className="absolute top-0 right-0">
            <Tooltip target=".pin-tooltip" />
            <div className="flex flex-row">
              {/* USER PIN */}
              {toggleUserPinReport && (
                <div className="pin-tooltip" onClick={toggleUserPinReport} data-pr-tooltip={report.user_pin ? 'Remove personal pin from the top' : 'Pin personally to the top'} data-pr-position="top">
                  <BookmarkIconOutline fill={report.user_pin ? '#4f46e5' : 'white'} className="cursor-pointer h-7 w-7 text-indigo-600 -mt-1 hover:text-indigo-600" />
                </div>
              )}
              {/* GLOBAL */}
              <div
                className="pin-tooltip"
                data-pr-tooltip={
                  hasPermissionReportGlobalPin
                    ? report.pin
                      ? 'Remove global pin for everyone'
                      : 'Pin globaly for everyone'
                    : report.pin
                    ? 'Report pinned globally'
                    : 'Report does not pinned globally'
                }
                data-pr-position="top"
                onClick={() => {
                  if (!toggleGlobalPinReport || !hasPermissionReportGlobalPin) {
                    return;
                  }
                  toggleGlobalPinReport();
                }}
              >
                <BookmarkIconOutline
                  fill={report.pin ? '#f97316' : 'white'}
                  className={clsx({ 'cursor-pointer': toggleGlobalPinReport && hasPermissionReportGlobalPin }, 'h-7 w-7 text-orange-500 -mt-1 hover:text-orange-500')}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center p-2 border-t">
        <div className="grow flex flex-row items-center text-gray-500 text-xs space-x-2">
          {authors && <PureAvatarGroup data={authors} avatarAsLink={true}></PureAvatarGroup>}
          <span className="hidden lg:block pr-3">{moment(report.created_at).format('MMMM DD, YYYY')}</span>
          <EyeIcon className="hidden lg:block  shrink-0 h-5 w-5 text-gray-500" />
          <span className="hidden lg:block  pr-3">{report.views}</span>
          <ChatIcon className="hidden lg:block shrink-0 h-5 w-5 text-orange-500" />
          <span className="hidden lg:block">{report.comments.length}</span>
        </div>
        <div className="flex flex-row items-center text-gray-500 text-xs space-x-4">
          <PureShareButton
            iconClasses="h-5 w-5 text-gray-500"
            buttonClasses="hover:bg-gray-100"
            title="Share report"
            description="Send this url to someone to share this report"
            report={report}
            commonData={commonData}
            url={`${window.location.origin}/${report.organization_sluglified_name}/${report.team_sluglified_name}/${report.name}`}
          />
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
