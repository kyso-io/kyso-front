import PureAvatar from '@/components/PureAvatar';
import type { UserDTO, TeamMember } from '@kyso-io/kyso-model';
import { format } from 'date-fns';
import UnpureSuggestContentDropdown from './UnPureSuggestContentDropdown';

type UnPureReportCreateReportInfoProps = {
  user: UserDTO;
  channelMembers: TeamMember[];
  setSelectedPerson: (selectedPerson: string[]) => void;
  selectedPerson: string[];
};

const UnPureReportCreateReportInfo = (props: UnPureReportCreateReportInfoProps) => {
  const { user, channelMembers, setSelectedPerson, selectedPerson } = props;

  return (
    <>
      <div className="md:grid md:grid-cols-1 md:gap-6">
        <div className="md:col-span-1 inline-flex items-center">
          <PureAvatar avatarUrl={user?.avatar_url} defaultName={user?.display_name} />
          <p className="mx-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">{user?.display_name}</p>
          <UnpureSuggestContentDropdown label={'Add authors'} channelMembers={channelMembers} selectedPerson={selectedPerson} setSelectedPerson={setSelectedPerson} />
          <div className="ml-5">
            Created:
            <span className="text-gray-400 ml-1 mr-5">{format(new Date(), 'MMM dd, yyyy')}.</span>
            Last update on:
            <span className="text-gray-400 ml-1 mr-5">{format(new Date(), 'MMM dd, yyyy')}.</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-300 text-gray-800 mr-3">Tag</span>
          {/* <UnpureSuggestContentDropdown label={'Add tags'} channelMembers={channelMembers} /> */}
        </div>
      </div>
    </>
  );
};

export default UnPureReportCreateReportInfo;
