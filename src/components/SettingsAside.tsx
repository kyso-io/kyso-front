import type { ResourcePermissions } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CommonData } from '../types/common-data';

interface Props {
  commonData: CommonData;
}

const ALL_SPECIAL_VALUE: string = 'allspecialvalue';

const SettingsAside = ({ commonData }: Props) => {
  const router = useRouter();
  let { organizationName } = router.query;
  const { all } = router.query;

  if (all) {
    organizationName = ALL_SPECIAL_VALUE;
  }

  if (!organizationName) {
    organizationName = '';
  }

  const [organizationNameSelectValue, setOrganizationNameSelectValue] = useState<string>(organizationName as string);

  const organizations: ResourcePermissions[] = useMemo(() => {
    let data: ResourcePermissions[] = [];
    if (!commonData.permissions || !commonData.permissions.organizations) {
      return data;
    }
    data = [...commonData.permissions.organizations];
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
          <Link
            href={`/user/${commonData.user?.username}/settings`}
            className={clsx(
              router.route.startsWith('/user/[username]/settings') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'flex items-center px-3 py-2 text-sm font-medium rounded-md',
            )}
          >
            User
          </Link>
        )}
        {commonData.user !== null && (
          <Link
            href={`/user/${commonData.user?.username}/tokens`}
            className={clsx(
              router.route.startsWith('/user/[username]/tokens') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'flex items-center px-3 py-2 text-sm font-medium rounded-md',
            )}
          >
            Tokens
          </Link>
        )}
        {commonData.user !== null && (
          <Link
            href={`/settings/notifications`}
            className={clsx(
              router.route === '/settings/notifications' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'flex items-center px-3 py-2 text-sm font-medium rounded-md',
            )}
          >
            Notifications
          </Link>
        )}
        {organizations.length > 0 && (
          <div
            className={clsx(
              router.route === '/settings' || router.route === '/settings/[organizationName]' || router.route === '/settings/[organizationName]/[teamName]'
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'flex items-center px-3 py-2 text-sm font-medium rounded-md',
            )}
          >
            <Link href={`/settings`}>Organizations</Link>
            <span className="mx-2">{'>'}</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  if (e.target.value === ALL_SPECIAL_VALUE) {
                    setOrganizationNameSelectValue(ALL_SPECIAL_VALUE);
                    // router.push(`/settings?all=true`);
                    window.location.href = `/settings?all=true`;
                  } else {
                    setOrganizationNameSelectValue(e.target.value);
                    // router.push(`/settings/${e.target.value}`);
                    window.location.href = `/settings/${e.target.value}`;
                  }
                } else {
                  // router.push(`/settings`);
                  window.location.href = `/settings`;
                }
              }}
              value={organizationNameSelectValue ?? ''}
              className="cursor-pointer mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value=""></option>
              <option value={ALL_SPECIAL_VALUE}>All</option>
              {organizations?.map((organization: ResourcePermissions) => (
                <option key={organization.id} value={organization.name}>
                  {organization.display_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsAside;
