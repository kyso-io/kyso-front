import PureAvatar from '@/components/PureAvatar';
import type { UserDTO, TeamMember } from '@kyso-io/kyso-model';
import UnPureSuggestContentDropdown from './UnPureSuggestContentDropdown';
import UnPureSuggestTagsListbox from './UnPureSuggestTagsListbox';

type UnPureReportCreateReportInfoProps = {
  user: UserDTO;
  channelMembers: TeamMember[];
  setSelectedPeople: (selectedPeople: string[]) => void;
  selectedPeople: string[];
  tags: string[];
  onSetTags: (_tags: string[]) => void;
  selectedTags: string[];
};

const UnPureReportCreateReportInfo = (props: UnPureReportCreateReportInfoProps) => {
  const { user, channelMembers = [], setSelectedPeople = () => {}, selectedPeople, onSetTags = () => {}, tags = [], selectedTags = [] } = props;

  return (
    <>
      <div className="md:grid md:grid-cols-1 md:gap-6">
        <div className="md:col-span-1 inline-flex items-center">
          <PureAvatar src={user?.avatar_url} title={user?.display_name} />
          <p className="mx-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">{user?.display_name}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {selectedPeople?.map((person: any) => (
            <div key={person.id} className="flex -space-x-1 overflow-hidden">
              <PureAvatar src={person?.avatar_url} title={person.nickname} />
            </div>
          ))}
          <UnPureSuggestContentDropdown label={'Add authors'} channelMembers={channelMembers} selectedPeople={selectedPeople} setSelectedPeople={setSelectedPeople} />
          {/* <div className="ml-5">
            Created:
            <span className="text-gray-400 ml-1 mr-5">{format(new Date(), 'MMM dd, yyyy')}.</span>
            Last update on:
            <span className="text-gray-400 ml-1 mr-5">{format(new Date(), 'MMM dd, yyyy')}.</span>
          </div> */}
          {selectedTags.length > 0 &&
            selectedTags.map((tag) => (
              <span key={tag} className="flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-300 text-gray-800 mr-3">
                {tag}
              </span>
            ))}
          <UnPureSuggestTagsListbox tags={tags} onSetTags={onSetTags} selectedTags={selectedTags} />
        </div>
      </div>
    </>
  );
};

export default UnPureReportCreateReportInfo;
