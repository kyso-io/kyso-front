import { CalendarIcon, ChatIcon, DocumentReportIcon } from '@heroicons/react/outline';
import type { OrganizationInfoDto, TeamInfoDto } from '@kyso-io/kyso-model';
import moment from 'moment';
import PureTeamVisibilityIcon from './PureTeamVisibilityIcon';

interface Props {
  info: OrganizationInfoDto | TeamInfoDto;
  visibility?: string;
  hasLabel?: boolean;
  showPrivacy?: boolean;
}

const InfoActivity = ({ info, visibility, hasLabel, showPrivacy }: Props) => {
  return (
    <div className="flex flex-row text-xs space-x-2">
      {showPrivacy && <PureTeamVisibilityIcon visibility={visibility} hasLabel={hasLabel} />}
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
          <span className="ml-1  text-gray-500">Last activity: {moment(info.lastChange).format('DD/MM/YYYY')}</span>
        </div>
      )}
    </div>
  );
};

export default InfoActivity;
