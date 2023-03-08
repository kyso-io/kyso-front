import { HelperPermissions } from '@/helpers/check-permissions';
import classNames from '@/helpers/class-names';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/types/common-data';
import { PlusCircleIcon, SearchIcon } from '@heroicons/react/outline';
import type { ResourcePermissions } from '@kyso-io/kyso-model';
import { TeamPermissionsEnum } from '@kyso-io/kyso-model';
import { useEffect, useMemo, useState } from 'react';
import { TailwindWidthSizeEnum } from '../tailwind/enum/tailwind-width.enum';
import ChannelVisibility from './ChannelVisibility';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  basePath: string;
  commonData: CommonData;
  showScroll?: boolean;
}

const ChannelList = (props: Props) => {
  const { basePath, commonData } = props;

  const hasPermissionCreateChannel: boolean = useMemo(() => HelperPermissions.checkPermissions(commonData, TeamPermissionsEnum.CREATE), [commonData]);

  // For the private channels, doesn't matter if they dont have permissions to create a channel at channel level, makes no sense, so
  // we need to see as well at the organization level
  let hasPermissionCreateChannelFromOrganization: boolean = false;
  const organizationPermissions = commonData?.permissions?.organizations?.filter((x) => x.id === commonData.organization?.id);

  if (organizationPermissions && organizationPermissions.length > 0) {
    const createPermissions = organizationPermissions[0]?.permissions?.filter((y) => y === TeamPermissionsEnum.CREATE);

    if (createPermissions && createPermissions.length > 0) {
      hasPermissionCreateChannelFromOrganization = true;
    }
  }

  const [originalSortedSelectorItems, setOriginalSortedSelectorItems] = useState<BreadcrumbItem[]>([]);
  const [sortedSelectorItems, setSortedSelectorItems] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    if (commonData?.permissions?.teams && commonData.permissions.teams.length > 0) {
      const breadcrumbItems: BreadcrumbItem[] = commonData.permissions.teams
        .filter((teamResourcePermissions: ResourcePermissions) => teamResourcePermissions.organization_id === commonData.organization?.id)
        .map((teamResourcePermissions: ResourcePermissions) => {
          return new BreadcrumbItem(
            teamResourcePermissions.display_name,
            `${basePath}/${commonData.organization?.sluglified_name}/${teamResourcePermissions.name}`,
            commonData.team?.sluglified_name === teamResourcePermissions.name,
            teamResourcePermissions.team_visibility,
          );
        });
      const sorted: BreadcrumbItem[] = breadcrumbItems.sort((a: BreadcrumbItem, b: BreadcrumbItem) => {
        const nameA: string = a.name.toLowerCase();
        const nameB: string = b.name.toLowerCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

      setSortedSelectorItems(sorted);
      setOriginalSortedSelectorItems(sorted);
    }
  }, [commonData?.organization, commonData?.permissions?.teams]);

  return (
    <div>
      <h3 className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" id="projects-headline">
        Channels
        {(hasPermissionCreateChannel || hasPermissionCreateChannelFromOrganization) && (
          <a
            href={`${basePath}/${commonData.organization?.sluglified_name}/create-channel`}
            className={classNames('float-right text-gray-500 hover:bg-gray-100 hover:text-gray-900', 'text-sm rounded-md')}
          >
            <PlusCircleIcon className="w-5 h-5 mr-1" />
          </a>
        )}
      </h3>
      <div className="px-4 pb-2">
        <div className="relative mt-1 rounded-md shadow-sm">
          <input
            type="text"
            name="account-number"
            id="account-number"
            className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Search"
            onChange={(e) => {
              const filtered: BreadcrumbItem[] = originalSortedSelectorItems.filter((x) => x.name.toLowerCase().includes(e.target.value.toLowerCase()));
              setSortedSelectorItems(filtered);
            }}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className={classNames('flex flex-col justify-start', props.showScroll ? `max-h-[380px] overflow-auto` : '')}>
        {sortedSelectorItems.map((item: BreadcrumbItem) => (
          <a
            key={item.name}
            href={item.href}
            className={classNames(
              item.current ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md',
            )}
          >
            <span>{item.name}</span>
            <ChannelVisibility
              containerClasses="ml-3 mr-3"
              teamVisibility={item.team_visibility!}
              imageWidth={TailwindWidthSizeEnum.W3}
              imageMarginX={TailwindWidthSizeEnum.W3}
              imageMarginY={TailwindWidthSizeEnum.W1}
            />
          </a>
        ))}
      </div>
      {(hasPermissionCreateChannel || hasPermissionCreateChannelFromOrganization) && (
        <div className="mx-3">
          <span className="my-2 bg-gray-300 h-0.5" style={{ display: 'block' }} />
          <a
            href={`${basePath}/${commonData.organization?.sluglified_name}/create-channel`}
            className={classNames('text-gray-500 hover:bg-gray-100 hover:text-gray-900', 'flex items-center px-1 py-2 text-sm  rounded-md')}
          >
            <PlusCircleIcon className="w-5 h-5 mr-1" /> New channel
          </a>
        </div>
      )}
    </div>
  );
};

export default ChannelList;
