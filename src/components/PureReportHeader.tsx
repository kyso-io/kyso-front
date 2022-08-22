import type { ReactElement } from 'react';
import PureShareButton from '@/components/PureShareButton';
import PureVersionsDropdown from '@/components/PureVersionsDropdown';
import classNames from '@/helpers/class-names';
import type { CommonData } from '@/types/common-data';
import UnpureCloneDropdown from '@/unpure-components/UnpureCloneDropdown';
import UnpureReportActionDropdown from '@/unpure-components/UnpureReportActionDropdown';
import { ThumbUpIcon } from '@heroicons/react/solid';
import type { ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import format from 'date-fns/format';
import router from 'next/router';

import type { Version } from '@/hooks/use-versions';
import clsx from 'clsx';
import PureAvatarGroup from './PureAvatarGroup';

type IPureReportHeaderProps = {
  report: ReportDTO;
  reportUrl: string;
  frontEndUrl: string;
  authors: UserDTO[];
  version?: string;
  versions: Version[];
  onUpvoteReport: () => void;
  commonData: CommonData;
  hasPermissionEditReport: boolean;
  hasPermissionDeleteReport: boolean;
  children?: ReactElement;
};

const PureReportHeader = (props: IPureReportHeaderProps) => {
  const { report, frontEndUrl, children, versions, authors, version, reportUrl, onUpvoteReport, commonData, hasPermissionEditReport, hasPermissionDeleteReport } = props;

  return (
    <div className="w-full flex flex-row justify-between p-2">
      <div className="w-4/6 flex flex-col justify-between">
        <h1 className="text-2xl font-medium">{report?.title}</h1>
        {/* {report?.description && <div className="text-md">{report?.description}</div>} */}
        <div className="flex text-sm flex-col lg:flex-row lg:items-center text-gray-500 font-light space-x-2">
          <div className="flex">
            <PureAvatarGroup data={authors}></PureAvatarGroup>
          </div>
          <div>
            created
            <span className="text-gray-800 mx-1 ">{report?.created_at && format(new Date(report.created_at), 'MMM dd, yyyy')}.</span>
            Last update on
            <span className="text-gray-800 mx-2">{report?.updated_at && format(new Date(report.updated_at), 'MMM dd, yyyy')}.</span>
          </div>
        </div>
      </div>
      <div className="flex w-2/6 flex-col justify-between items-start space-y-8">
        <div className="flex flex-row w-full justify-end space-x-4">
          {children}

          {report?.id && (
            <button
              type="button"
              className={clsx('inline-flex space-x-2 text-gray-400 hover:text-gray-500', !commonData.user ? 'cursor-default' : '')}
              onClick={() => {
                if (!commonData.user) {
                  return;
                }
                onUpvoteReport();
              }}
            >
              <ThumbUpIcon className={classNames('h-5 w-5', report.mark_as_star_by_user ? 'text-indigo-500' : '')} aria-hidden="true" />
              <span className="text-gray-900">{report.stars}</span>
              <span className="sr-only">upvotes</span>
            </button>
          )}
          <PureShareButton report={report} basePath={router.basePath} commonData={commonData} />
        </div>

        <div className="flex flex-row items-center justify-end w-full">
          <div className="flex flex-row border rounded divide-x items-center">
            <UnpureCloneDropdown
              reportUrl={`${frontEndUrl}${reportUrl}`}
              report={report}
              commonData={commonData}
              hasPermissionEditReport={hasPermissionEditReport}
              hasPermissionDeleteReport={hasPermissionDeleteReport}
            />

            <PureVersionsDropdown versions={versions} version={version} reportUrl={reportUrl} />

            <UnpureReportActionDropdown report={report} commonData={commonData} hasPermissionEditReport={hasPermissionEditReport} hasPermissionDeleteReport={hasPermissionDeleteReport} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PureReportHeader;
