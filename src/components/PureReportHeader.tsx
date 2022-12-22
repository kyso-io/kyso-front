import PureShareButton from '@/components/PureShareButton';
import PureVersionsDropdown from '@/components/PureVersionsDropdown';
import classNames from '@/helpers/class-names';
import { FileTypesHelper } from '@/helpers/FileTypesHelper';
import type { Version } from '@/hooks/use-versions';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { CommonData } from '@/types/common-data';
import UnpureCloneDropdown from '@/unpure-components/UnpureCloneDropdown';
import UnpureReportActionDropdown from '@/unpure-components/UnpureReportActionDropdown';
import { ExternalLinkIcon, ThumbUpIcon } from '@heroicons/react/solid';
import type { ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import format from 'date-fns/format';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import type { FileToRender } from '../types/file-to-render';
import PureAvatarGroup from './PureAvatarGroup';
import PureTagGroup from './PureTagGroup';

type IPureReportHeaderProps = {
  report: ReportDTO;
  reportUrl: string;
  frontEndUrl: string;
  fileToRender: FileToRender | null;
  authors: UserDTO[];
  version?: string;
  versions: Version[];
  onUpvoteReport: () => void;
  commonData: CommonData;
  hasPermissionEditReport: boolean;
  hasPermissionDeleteReport: boolean;
  children?: ReactElement;
  onSetFileAsMainFile: () => void;
  setUser: (user: UserDTO) => void;
};

declare global {
  interface Window {
    htmlFileUrl: string | null;
    onlyofficeFileParam: string | null;
    svsFileParam: string | null;
  }
}

const MAX_LENGTH_DESCRIPTION: number = 400;

const PureReportHeader = (props: IPureReportHeaderProps) => {
  const {
    report,
    frontEndUrl,
    children,
    fileToRender,
    versions,
    authors,
    version,
    reportUrl,
    onUpvoteReport,
    commonData,
    hasPermissionEditReport,
    hasPermissionDeleteReport,
    onSetFileAsMainFile,
    setUser,
  } = props;

  const description: string = useMemo(() => {
    if (report?.description && report.description.length > MAX_LENGTH_DESCRIPTION) {
      return `${report.description.substring(0, MAX_LENGTH_DESCRIPTION)}...`;
    }
    return report?.description ? report.description : '';
  }, [report.description]);

  if (fileToRender && fileToRender.path.endsWith('.html')) {
    window.htmlFileUrl = `${frontEndUrl}/scs${fileToRender.path_scs}`;
  } else {
    window.htmlFileUrl = null;
  }
  if (fileToRender && FileTypesHelper.isOnlyOffice(fileToRender.path)) {
    window.onlyofficeFileParam = encodeURIComponent(`http://kyso-scs/scs${fileToRender.path_scs}`);
  } else {
    window.onlyofficeFileParam = null;
  }
  if (fileToRender && FileTypesHelper.isSVS(fileToRender.path)) {
    window.svsFileParam = encodeURIComponent(`http://kyso-scs/scs${fileToRender.path_scs}`);
  } else {
    window.svsFileParam = null;
  }
  return (
    <div className="w-full flex 2xl:flex-row lg:flex-col justify-between p-2">
      <div className="2xl:w-4/6 flex flex-col justify-between">
        <h1 className="text-2xl font-medium break-words">{report?.title}</h1>
        {description && <div className="text-sm break-words">{description}</div>}
        <div className="mt-3 flex text-sm flex-col lg:flex-row lg:items-top text-gray-500 font-light space-x-2 min-h-min">
          <div className="flex">
            <PureAvatarGroup data={authors} size={TailwindHeightSizeEnum.H8} tooltip={true}></PureAvatarGroup>
          </div>
          <div className="hidden lg:block">
            <p className="mt-2 text-sm text-gray-500">
              Created
              <span className="text-gray-800 ml-1 mr-2 ">{report?.created_at && format(new Date(report.created_at), 'MMM dd, yyyy')}.</span>
              Last update on
              <span className="text-gray-800 ml-1 mr-2">{report?.updated_at && format(new Date(report.updated_at), 'MMM dd, yyyy')}.</span>
            </p>
          </div>
          {report?.tags && (
            <div
              className="hidden lg:block min-h-min"
              style={{
                overflowWrap: 'break-word',
                maxHeight: '1vh',
              }}
            >
              <PureTagGroup tags={[...report.tags]} />
            </div>
          )}
        </div>
      </div>
      <div className="hidden lg:nlock lg:flex 2xl:w-2/6 lg:flex-col justify-between items-start space-y-8">
        <div className="flex flex-row w-full justify-end space-x-4">
          {children}
          {report?.id && (
            <button
              type="button"
              className={clsx(
                'inline-flex space-x-2 text-sm font-small rounded-md text-gray-500 items-center focus:outline-none focus:ring-0 border border-transparent bg-white hover:bg-gray-100 px-2.5 py-1.5',
                !commonData.user ? 'cursor-default' : '',
              )}
              onClick={() => {
                if (!commonData.user) {
                  return;
                }
                onUpvoteReport();
              }}
            >
              <span className="text-gray-500">{report.stars}</span>
              <ThumbUpIcon className={classNames('h-5 w-5', report.mark_as_star_by_user ? 'text-indigo-600 hover:text-indigo-700' : '')} aria-hidden="true" />
              <span className="sr-only">upvotes</span>
            </button>
          )}
          <PureShareButton
            iconClasses="h-5 w-5 text-indigo-600 hover:text-indigo-700"
            buttonClasses="hover:bg-gray-100"
            title="Share report"
            description="Send this url to someone to share this report"
            withText={true}
            url={`${window.location.origin}/${report.organization_sluglified_name}/${report.team_sluglified_name}/${report.name}`}
          />
        </div>
        <div className="flex flex-row items-center justify-end w-full">
          <div className="flex flex-row border rounded divide-x items-center">
            {window.htmlFileUrl && window.htmlFileUrl !== '' && (
              <button
                className="inline-flex w-38 items-center  hover:bg-gray-100 p-1.5 px-2 font-medium text-sm text-gray-700 focus:ring-0 focus:outline-none"
                onClick={() => {
                  window.open(`/html-render.html`, 'htmlViewer', 'fullscreen=yes');
                }}
              >
                Open in Window
                <ExternalLinkIcon className="ml-1 h-4 w-4" aria-hidden="true" />
              </button>
            )}
            {window.onlyofficeFileParam && window.onlyofficeFileParam !== '' && (
              <button
                className="inline-flex w-38 items-center  hover:bg-gray-100 p-1.5 px-2 font-medium text-sm text-gray-700 focus:ring-0 focus:outline-none"
                onClick={() => {
                  window.open(`/onlyoffice-render.html`, 'onlyofficeViewer', 'fullscreen=yes');
                }}
              >
                Open in Window
                <ExternalLinkIcon className="ml-1 h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <UnpureCloneDropdown
              reportUrl={`${frontEndUrl}${reportUrl}`}
              report={report}
              commonData={commonData}
              hasPermissionEditReport={hasPermissionEditReport}
              hasPermissionDeleteReport={hasPermissionDeleteReport}
              setUser={setUser}
            />
            <PureVersionsDropdown versions={versions} version={version} reportUrl={reportUrl} />
            {(hasPermissionEditReport || hasPermissionDeleteReport) && (
              <UnpureReportActionDropdown
                report={report}
                commonData={commonData}
                hasPermissionDeleteReport={hasPermissionDeleteReport}
                hasPermissionEditReport={hasPermissionEditReport}
                fileToRender={fileToRender}
                onSetFileAsMainFile={onSetFileAsMainFile}
                version={version}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PureReportHeader;
