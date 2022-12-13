import classNames from '@/helpers/class-names';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/types/common-data';
import { Menu, Transition } from '@headlessui/react';
import { DotsVerticalIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/outline';
import { TeamPermissionsEnum } from '@kyso-io/kyso-model';
import { deleteTeamAction } from '@kyso-io/kyso-store';
import { Fragment, useMemo } from 'react';
import { HelperPermissions } from '../helpers/check-permissions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  basePath: string;
  commonData: CommonData;
}

const ChannelList = (props: Props) => {
  const { basePath, commonData } = props;
  const dispatch = useAppDispatch();
  const channelSelectorItems: BreadcrumbItem[] = [];
  if (commonData.permissions && commonData.permissions.teams) {
    commonData
      .permissions!.teams.filter((team) => team.organization_id === commonData.organization?.id)
      .forEach((team) => {
        channelSelectorItems.push(new BreadcrumbItem(team.display_name, `${basePath}/${commonData.organization?.sluglified_name}/${team.name}`, commonData.team?.sluglified_name === team.name));
      });
  }

  const hasPermissionCreateChannel = useMemo(() => HelperPermissions.checkPermissions(commonData, TeamPermissionsEnum.CREATE), [commonData]);
  const hasPermissionDeleteChannel = useMemo(() => HelperPermissions.checkPermissions(commonData, TeamPermissionsEnum.DELETE), [commonData]);

  const deleteChannel = async () => {
    if (!hasPermissionDeleteChannel) {
      return;
    }

    /* eslint-disable no-alert */
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    await dispatch(deleteTeamAction(commonData.team!.id!));
  };

  return (
    <div>
      <h3 className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" id="projects-headline">
        Channels
      </h3>
      <div className="flex flex-col justify-start">
        {channelSelectorItems &&
          channelSelectorItems.map((item: BreadcrumbItem) => (
            <div
              key={item.href}
              className={classNames(
                'flex flex-row items-center justify-between',
                item.current ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'flex items-center px-3 py-2 text-sm font-medium rounded-md',
              )}
            >
              <a key={item.href} href={item.href}>
                {item.name}
              </a>
              <Menu as="div" className="p-1.5 px-2 font-medium hover:bg-gray-100 text-sm z-50 relative inline-block">
                <Menu.Button className="rounded-full flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                  <span className="sr-only">Open options</span>
                  <DotsVerticalIcon className="h-4 w-4" aria-hidden="true" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white border focus:outline-none">
                    <div className="py-1">
                      {hasPermissionDeleteChannel && (
                        <Menu.Item>
                          <a href="#" onClick={() => deleteChannel()} className="text-gray-700', 'block px-4 py-2 text-sm hover:bg-gray-50 group flex items-center">
                            <TrashIcon className="mr-1 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                            Delete
                          </a>
                        </Menu.Item>
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          ))}
      </div>

      {hasPermissionCreateChannel && (
        <a
          href={`${commonData.organization?.sluglified_name}/channels/create`}
          className={classNames('text-gray-500 hover:bg-gray-50 hover:text-gray-900', 'flex items-center px-3 py-2 text-sm font-medium rounded-md')}
        >
          <PlusCircleIcon className="w-5 h-5 mr-1" /> New channel
        </a>
      )}
    </div>
  );
};

export default ChannelList;
