import PureTopTabs from '@/components/PureTopTabs';
import { useRouter } from 'next/router';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { faPeriod } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { UserDTO } from '@kyso-io/kyso-model';
import { useUser } from '@/hooks/use-user';
import moment from 'moment';
import PureAvatar from './PureAvatar';

const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80';

type IUserProfileInfo = {
  onChangeTab: (_tag: string) => void;
  currentTab: string;
  userProfile: UserDTO;
};

const UserProfileInfo = (props: IUserProfileInfo) => {
  const { onChangeTab, currentTab, userProfile } = props;
  const user: UserDTO | null = useUser();
  const router = useRouter();
  const tabs = [{ name: 'Overview' }, { name: 'Activity' }];

  let isUserAuthor = false;
  if (user && user.id === userProfile.id) {
    isUserAuthor = true;
  }

  return (
    <div className="flex flex-row space-x-8">
      <div className="w-1/6"></div>
      <div className="w-4/6 flex flex-col">
        {BACKGROUND_IMAGE && (
          <div>
            <img className="h-32 w-full object-cover lg:h-80" src={BACKGROUND_IMAGE} alt="" />
          </div>
        )}
        {/* avatar */}
        {!BACKGROUND_IMAGE && <div className="h-20 w-full object-cover" />}
        <div className="sm:flex sm:items-center sm:justify-between px-10">
          <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
            <div className="flex">
              <PureAvatar src={userProfile.avatar_url} title={userProfile.display_name} size={TailwindHeightSizeEnum.H24} />
              {/* <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32" src={userProfile.avatar_url} alt="" /> */}
            </div>
          </div>
          {isUserAuthor && (
            <div className="mt-6 mb-1 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <a href={`${router.basePath}/in/settings`} className="text-indigo-500">
                  Edit
                </a>
              </button>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-white overflow-hidden">
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <h2 className="text-3xl font-bold leading-7 text-gray-600 sm:text-3xl sm:truncate">{userProfile.display_name}</h2>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white overflow-hidden">
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6 items-center">
            {userProfile.bio && (
              <div className="mt-2 flex items-center text-sm">
                <p className="text-base font-bold leading-relaxed text-gray-700">{userProfile.bio}</p>
              </div>
            )}
            {userProfile.bio && userProfile.created_at && (
              <div className="sm:flex hidden items-center text-sm text-gray-500">
                <FontAwesomeIcon icon={faPeriod} />
              </div>
            )}
            {userProfile.created_at && (
              <div className="mt-2 flex items-center text-sm">
                <p className="text-base font-light leading-relaxed text-gray-800">Member since: {moment(userProfile.created_at).format('MMM DD,YYYY')}</p>
              </div>
            )}
          </div>
          <div className="pt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6 items-center">
            {userProfile.location && (
              <div className="mt-2 flex items-center text-sm">
                <p className="text-m font-medium text-gray-600 sm:text-l">{userProfile.location}</p>
              </div>
            )}
            {userProfile.email && userProfile.location && (
              <div className="sm:flex hidden items-center text-sm text-gray-500">
                <FontAwesomeIcon icon={faPeriod} />
              </div>
            )}
            {userProfile.email && (
              <div className="mt-2 flex items-center text-sm">
                <p className="text-m font-medium text-blue-600 sm:text-l">{userProfile.email}</p>
              </div>
            )}
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
