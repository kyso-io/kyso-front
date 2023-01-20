import { HelperPermissions } from '@/helpers/check-permissions';
import classNames from '@/helpers/class-names';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/types/common-data';
import { PlusCircleIcon } from '@heroicons/react/outline';
import type { ResourcePermissions } from '@kyso-io/kyso-model';
import { TeamPermissionsEnum } from '@kyso-io/kyso-model';
import { useMemo } from 'react';
import { TailwindWidthSizeEnum } from '../tailwind/enum/tailwind-width.enum';
import ChannelVisibility from './ChannelVisibility';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  basePath: string;
  commonData: CommonData;
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

  const channelSelectorItems: BreadcrumbItem[] = useMemo(() => {
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
      breadcrumbItems.sort((a: BreadcrumbItem, b: BreadcrumbItem) => {
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
      return breadcrumbItems;
    }
    return [];
  }, [commonData?.organization, commonData?.permissions?.teams]);

  return (
    <div>
      <h3 className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" id="projects-headline">
        Channels
      </h3>
      <div className="flex flex-col justify-start">
        {channelSelectorItems.map((item: BreadcrumbItem) => (
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
              containerClasses="ml-3"
              teamVisibility={item.team_visibility!}
              imageWidth={TailwindWidthSizeEnum.W3}
              imageMarginX={TailwindWidthSizeEnum.W3}
              imageMarginY={TailwindWidthSizeEnum.W1}
            />
          </a>
        ))}

        {(hasPermissionCreateChannel || hasPermissionCreateChannelFromOrganization) && (
          <>
            <span className="my-2 bg-gray-300 h-0.5 mx-3" />
            <a
              href={`${basePath}/${commonData.organization?.sluglified_name}/create-channel`}
              className={classNames('text-gray-500 hover:bg-gray-100 hover:text-gray-900', 'flex items-center px-3 py-2 text-sm  rounded-md')}
            >
              <PlusCircleIcon className="w-5 h-5 mr-1" /> New channel
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default ChannelList;
