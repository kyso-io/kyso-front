import '@fortawesome/fontawesome-svg-core/styles.css';
import { faPeriod } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PureTopTabs from '@/components/PureTopTabs';

type IUserProfileInfo = {
  // user: UserInfoDto;
  user: {
    name: string;
    role: string | '';
    date: string | '';
    location: string | '';
    email: string;
    backgroundImage: string | '';
    avatarUrl: string | '';
  };
  onChangeTab: (_tag: string) => void;
  currentTab: string;
};

const UserProfileInfo = (props: IUserProfileInfo) => {
  const { user, onChangeTab, currentTab } = props;
  const tabs = [{ name: 'Overview' }, { name: 'Activity' }];
  return (
    <div className="flex flex-row space-x-8">
      <div className="w-1/6"></div>
      <div className="w-4/6 flex flex-col">
        <div>
          <img className="h-32 w-full object-cover lg:h-80" src={user.backgroundImage} alt="" />
        </div>
        <div className="sm:flex sm:items-center sm:justify-between px-10">
          <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
            <div className="flex">
              <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32" src={user.avatarUrl} alt="" />
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white overflow-hidden">
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <h2 className="text-3xl font-bold leading-7 text-gray-600 sm:text-3xl sm:truncate">{user.name}</h2>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white overflow-hidden">
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6 items-center">
            <div className="mt-2 flex items-center text-sm">
              <p className="text-base font-bold leading-relaxed text-gray-700">{user.role}</p>
            </div>
            <div className="sm:flex hidden items-center text-sm text-gray-500">
              <FontAwesomeIcon icon={faPeriod} />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <p className="text-base font-light leading-relaxed text-gray-800">Member since: {user.date}</p>
              {/* (date).format('YYYY-MM-DD') */}
            </div>
          </div>
          <div className="pt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6 items-center">
            <div className="mt-2 flex items-center text-sm">
              <p className="text-m font-medium text-gray-600 sm:text-l">{user.location}</p>
            </div>
            <div className="sm:flex hidden items-center text-sm text-gray-500">
              <FontAwesomeIcon icon={faPeriod} />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <p className="text-m font-medium text-blue-600 sm:text-l">{user.email}</p>
            </div>
            <div className="sm:flex hidden items-center text-sm text-gray-500 ">
              <FontAwesomeIcon icon={faPeriod} />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <p className="text-m font-medium text-gray-600 sm:text-l">{user.location}</p>
            </div>
          </div>
          <div>
            <PureTopTabs tabs={tabs} onChangeTab={onChangeTab} currentTab={currentTab} marginTopSmall={'mt-3'} marginTopBig={'mt-10'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
