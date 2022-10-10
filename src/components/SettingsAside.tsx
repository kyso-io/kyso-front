import classNames from '@/helpers/class-names';
import { useRouter } from 'next/router';
import type { CommonData } from '../types/common-data';

interface Props {
  commonData: CommonData;
}

const SettingsAside = ({ commonData }: Props) => {
  const router = useRouter();
  return (
    <div>
      <h3 className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" id="projects-headline">
        Settings
      </h3>
      <div className="flex flex-col justify-start">
        {commonData.user !== null && (
          <a
            href={`/user/${commonData.user?.username}/settings`}
            className={classNames(
              router.route.startsWith('/user/[username]/settings') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'flex items-center px-3 py-2 text-sm font-medium rounded-md',
            )}
          >
            User
          </a>
        )}
        {commonData.user !== null && (
          <a
            href={`/user/${commonData.user?.username}/tokens`}
            className={classNames(
              router.route.startsWith('/user/[username]/tokens') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'flex items-center px-3 py-2 text-sm font-medium rounded-md',
            )}
          >
            Tokens
          </a>
        )}
        <a
          href={`/settings`}
          className={classNames(
            router.route.startsWith('/settings') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            'flex items-center px-3 py-2 text-sm font-medium rounded-md',
          )}
        >
          Organizations
        </a>
      </div>
    </div>
  );
};

export default SettingsAside;
