import { CalendarIcon, ChatIcon, DocumentReportIcon } from '@heroicons/react/outline';
import type { OrganizationInfoDto, TeamInfoDto } from '@kyso-io/kyso-model';
import moment from 'moment';

interface Props {
  info: OrganizationInfoDto | TeamInfoDto;
}

const InfoActivity = ({ info }: Props) => {
  return (
    <div className="flex flex-row text-xs space-x-2">
      <div className="flex items-center pr-4">
        <DocumentReportIcon className="h-5 w-5 text-blue-500" />
        <span className="ml-1  text-gray-500">
          {info.reports} {info.reports === 1 ? 'report' : 'reports'}
        </span>
      </div>
      <div className="flex items-center pr-4">
        <ChatIcon className="h-5 w-5 text-orange-500" />
        <span className="ml-1  text-gray-500">
          {info.comments} {info.comments === 1 ? 'comment' : 'comments'}
        </span>
      </div>
      {info.lastChange && (
        <div className="flex items-center pr-4">
          <CalendarIcon className="h-5 w-5 text-pink-500" />
          <span className="ml-1  text-gray-500">{moment(info.lastChange).format('DD/MM/YYYY')} last activity</span>
        </div>
      )}
    </div>
  );
};

export default InfoActivity;
