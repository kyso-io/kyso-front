import { CalendarIcon, ChatAlt2Icon, ChatIcon, DocumentReportIcon } from '@heroicons/react/outline';
import type { OrganizationInfoDto, TeamInfoDto } from '@kyso-io/kyso-model';
import moment from 'moment';

interface Props {
  info: OrganizationInfoDto | TeamInfoDto;
}

const InfoActivity = ({ info }: Props) => {
  return (
    <div className="flex">
      <div className="flex items-center mr-10">
        <DocumentReportIcon className="h-6 w-6 text-blue-500" />
        <span className="ml-1 text-sm text-gray-500">
          {info.reports} {info.reports === 1 ? 'report' : 'reports'}
        </span>
      </div>
      <div className="flex items-center mr-10">
        <ChatIcon className="h-6 w-6 text-orange-400" />
        <span className="ml-1 text-sm text-gray-500">
          {info.comments} {info.comments === 1 ? 'comment' : 'comments'}
        </span>
      </div>
      <div className="flex items-center mr-10">
        <ChatAlt2Icon className="h-6 w-6 text-cyan-300" />
        <span className="ml-1 text-sm text-gray-500">
          {info.discussions} {info.discussions === 1 ? 'discussion' : 'discussions'}
        </span>
      </div>
      {info.lastChange && (
        <div className="flex items-center mr-10">
          <CalendarIcon className="h-6 w-6 text-red-400" />
          <span className="ml-1 text-sm text-gray-500">{moment(info.lastChange).format('DD/MM/YYYY')} last activity</span>
        </div>
      )}
    </div>
  );
};

export default InfoActivity;
