import classNames from '@/helpers/class-names';
import type { CommonData } from '@/hooks/use-common-data';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  basePath: string;
  commonData: CommonData;
}

const ChannelList = (props: Props) => {
  const { basePath, commonData } = props;
  const channelSelectorItems: BreadcrumbItem[] = [];
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
      </div>

      {/* <a
        href={`${commonData.organization?.sluglified_name}/team/create`}
      >
        Create a new channel
      </a> */}
    </div>
  );
};

export default ChannelList;
