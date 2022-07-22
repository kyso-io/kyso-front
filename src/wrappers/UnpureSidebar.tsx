import { PureSidebar } from '@/components/PureSidebar';
import { Meta } from '@/layouts/Meta';
import { Sanitizer } from '@/helpers/Sanitizer';
import { PureKysoBreadcrumb } from '@/components/PureKysoBreadcrumb';
import { HashtagIcon } from '@heroicons/react/solid';
import { LeftMenuItem } from '@/model/left-menu-item.model';
import type { BreadcrumbItem } from '@/model/breadcrum-item.model';
import { useRouter } from 'next/router';
import { NavigationSelectorItem } from '@/model/navigation-selector-item.model';

import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { Helper } from '@/helpers/Helper';
import { NavigationSelector } from '@/components/NavigationSelector';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UnpureSidebar = (props: any) => {
  const router = useRouter();
  const commonData: CommonData = useCommonData();

  const selectorItems: NavigationSelectorItem[] = [];
  if (commonData.permissions && commonData.permissions.organizations) {
    commonData.permissions!.organizations.forEach((organization) => {
      selectorItems.push(new NavigationSelectorItem(organization.display_name, `${router.basePath}/${organization.name}`, commonData.organization?.sluglified_name === organization.name));
    });
  }

  const channelSelectorItems: NavigationSelectorItem[] = [];
  if (commonData.permissions && commonData.permissions.teams) {
    commonData
      .permissions!.teams.filter((team) => team.organization_id === commonData.organization?.id)
      .forEach((team) => {
        channelSelectorItems.push(
          new NavigationSelectorItem(team.display_name, `${router.basePath}/${commonData.organization?.sluglified_name}/${team.name}`, commonData.team?.sluglified_name === team.name),
        );
      });
  }

  let channelList: LeftMenuItem[] = [];
  if (commonData.permissions && commonData.permissions.teams && commonData.organization) {
    channelList = commonData
      .permissions!.teams.filter((t) => t.organization_id === commonData.organization.id)
      .map((x) => {
        return new LeftMenuItem(x.name, HashtagIcon, 0, `${router.basePath}/${commonData.organization.sluglified_name}/${Helper.slugify(x.name)}`, Helper.slugify(x.name) === router.query.teamName);
      });
  }

  const breadcrumb: BreadcrumbItem[] = [];

  // if (commonData.organization) {
  //   breadcrumb.push(new BreadcrumbItem(commonData.organization.display_name, `${router.basePath}/${commonData.organization?.sluglified_name}`, !!(commonData.organization && !commonData.team)));
  // }

  // if (commonData.team) {
  //   breadcrumb.push(
  //     new BreadcrumbItem(
  //       `# ${commonData.team.display_name}`,
  //       `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}`,
  //       !!(commonData.organization && commonData.team),
  //     ),
  //   );
  // }

  return (
    <>
      <PureSidebar
        navigation={channelList}
        selectorItems={selectorItems}
        meta={
          <Meta
            title={`Kyso - ${Sanitizer.ifNullReturnDefault(commonData.organization?.display_name, '')}`}
            description={`${Sanitizer.ifNullReturnDefault(commonData.organization?.display_name, '')}`}
          />
        }
      >
        <div className="md:pl-64 flex flex-1 bg-white border-b">
          <div className="p-4 flex items-center justify-between space-x-2">
            <NavigationSelector selectorItems={selectorItems} />
            <svg className="shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
            </svg>
            <NavigationSelector selectorItems={channelSelectorItems} selectorLabel="channel" />
            <PureKysoBreadcrumb breadcrumbs={breadcrumb}></PureKysoBreadcrumb>
          </div>
        </div>

        <div className="md:pl-64 flex flex-col flex-1 bg-neutral-50 ">
          <div className="py-4 px-6">{props.children}</div>
        </div>
      </PureSidebar>
    </>
  );
};

export default UnpureSidebar;
