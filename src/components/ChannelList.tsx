import checkPermissions from '@/helpers/check-permissions';
import classNames from '@/helpers/class-names';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/types/common-data';
import { PlusCircleIcon } from '@heroicons/react/outline';
import { TeamPermissionsEnum } from '@kyso-io/kyso-model';
import { useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  basePath: string;
  commonData: CommonData;
}

const ChannelList = (props: Props) => {
  const { basePath, commonData } = props;
  const channelSelectorItems: BreadcrumbItem[] = [];

  const hasPermissionCreateChannel = useMemo(() => checkPermissions(commonData, TeamPermissionsEnum.CREATE), [commonData]);

  if (commonData.permissions && commonData.permissions.teams) {
    commonData
      .permissions!.teams.filter((team) => team.organization_id === commonData.organization?.id)
      .forEach((team) => {
        channelSelectorItems.push(new BreadcrumbItem(team.display_name, `${basePath}/${commonData.organization?.sluglified_name}/${team.name}`, commonData.team?.sluglified_name === team.name));
      });
  }

  return (
    <div>
      <h3 className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" id="projects-headline">
        Channels
      </h3>
      <div className="flex flex-col justify-start">
        {channelSelectorItems &&
          channelSelectorItems.map((item: BreadcrumbItem) => (
            <a
              key={item.href}
              href={item.href}
              className={classNames(item.current ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', 'flex items-center px-3 py-2 text-sm font-medium rounded-md')}
            >
              {item.name}
            </a>
          ))}

        {hasPermissionCreateChannel && (
          <>
            <span className="my-2 bg-gray-300 h-0.5 mx-3" />
            <a
              href={`${basePath}/${commonData.organization?.sluglified_name}/create-channel`}
              className={classNames('text-gray-500 hover:bg-gray-50 hover:text-gray-900', 'flex items-center px-3 py-2 text-sm  rounded-md')}
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
