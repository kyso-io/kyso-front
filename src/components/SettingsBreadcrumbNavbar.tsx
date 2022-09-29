import { NavigationSelector } from '@/components/NavigationSelector';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/types/common-data';
import type { ReportDTO, ResourcePermissions } from '@kyso-io/kyso-model';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

interface Props {
  basePath: string;
  children?: ReactNode;
  report: ReportDTO | null | undefined;
  commonData: CommonData;
}

const SettingsBreadcrumbNavbar = (props: Props) => {
  const { basePath, commonData } = props;

  const organizationSelectorItems: BreadcrumbItem[] = useMemo(() => {
    if (commonData.permissions && commonData.permissions.organizations) {
      return commonData.permissions!.organizations.map(
        (organizationResourcePermission: ResourcePermissions) =>
          new BreadcrumbItem(
            organizationResourcePermission.display_name,
            `${basePath}/settings/${organizationResourcePermission.name}`,
            commonData.organization?.sluglified_name === organizationResourcePermission.name,
          ),
      );
    }
    return [];
  }, [commonData?.permissions, commonData?.organization]);

  const channelSelectorItems: BreadcrumbItem[] = useMemo(() => {
    if (commonData.permissions && commonData.permissions.teams) {
      const data: BreadcrumbItem[] = commonData
        .permissions!.teams.filter((teamResourcePermission: ResourcePermissions) => teamResourcePermission.organization_id === commonData.organization?.id)
        .map(
          (teamResourcePermission: ResourcePermissions) =>
            new BreadcrumbItem(
              teamResourcePermission.display_name,
              `${basePath}/settings/${commonData.organization?.sluglified_name}/${teamResourcePermission.name}`,
              commonData.team?.sluglified_name === teamResourcePermission.name,
            ),
        );
      return data;
    }
    return [];
  }, [commonData?.permissions, commonData?.organization]);

  return (
    <div>
      {organizationSelectorItems.length > 0 && (
        <div className="flex lg:flex-row flex-col lg:items-center space-y-2 lg:space-y-0 lg:space-x-0 p-2">
          {<NavigationSelector selectorItems={organizationSelectorItems} />}
          {commonData.organization && (
            <svg className="hidden lg:inline-block shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
            </svg>
          )}
          {commonData.organization && <NavigationSelector selectorItems={channelSelectorItems} selectorLabel="channel" />}
        </div>
      )}
      {props.children && <div className="py-4 px-6">{props.children}</div>}
    </div>
  );
};

export default SettingsBreadcrumbNavbar;
