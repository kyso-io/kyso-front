import type { ResourcePermissions } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import type { CommonData } from '../types/common-data';

interface Props {
  commonData: CommonData;
}

const SettingsAside = ({ commonData }: Props) => {
  const router = useRouter();
  const { organizationName } = router.query;
  const organizations: ResourcePermissions[] = useMemo(() => {
    let data: ResourcePermissions[] = [];
    if (!commonData.permissions || !commonData.permissions.organizations) {
      return data;
    }
    data = commonData.permissions.organizations;
    data.sort((a: ResourcePermissions, b: ResourcePermissions) => {
      const displayNameA: string = a.display_name.toLowerCase();
      const displayNameB: string = b.display_name.toLowerCase();
      if (displayNameA < displayNameB) {
        return -1;
      }
      if (displayNameA > displayNameB) {
        return 1;
      }
      return 0;
    });
    return data;
  }, [commonData.permissions]);

  return (
    <div>
      <h3 className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" id="projects-headline">
        Settings
      </h3>
      <div className="flex flex-col justify-start">
        {commonData.user !== null && (
          <a
            href={`/user/${commonData.user?.username}/settings`}
            className={clsx(
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
            className={clsx(
              router.route.startsWith('/user/[username]/tokens') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'flex items-center px-3 py-2 text-sm font-medium rounded-md',
            )}
          >
            Tokens
          </a>
        )}
        <div
          className={clsx(
            router.route.startsWith('/settings') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            'flex items-center px-3 py-2 text-sm font-medium rounded-md',
          )}
        >
          <a href={`/settings`}>Organizations</a>
          <span className="mx-2">{'>'}</span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                router.push(`/settings/${e.target.value}`);
              } else {
                router.push(`/settings`);
              }
            }}
            value={organizationName ?? ''}
            className="cursor-pointer mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            defaultValue="Canada"
          >
            <option value="">All</option>
            {organizations?.map((organization: ResourcePermissions) => (
              <option key={organization.id} value={organization.name}>
                {organization.display_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SettingsAside;
