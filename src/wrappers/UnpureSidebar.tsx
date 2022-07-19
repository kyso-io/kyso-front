import { PureSidebar } from '@/components/PureSidebar';
import { Meta } from '@/layouts/Meta';
import { Sanitizer } from '@/helpers/Sanitizer';
import { KysoBreadcrumb } from '@/components/KysoBreadcrumb';
import { HashtagIcon } from '@heroicons/react/solid';
import { LeftMenuItem } from '@/model/left-menu-item.model';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import { useRouter } from 'next/router';
import { OrganizationSelectorItem } from '@/model/organization-selector-item.model';

import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { Helper } from '@/helpers/Helper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UnpureSidebar = (props: any) => {
  const router = useRouter();
  const commonData: CommonData = useCommonData();

  const currentOrgSlug = commonData.organization?.sluglified_name;

  const organizationSelectorItems: OrganizationSelectorItem[] = [];
  if (commonData.permissions && commonData.permissions.organizations) {
    commonData.permissions!.organizations.forEach((organization) => {
      organizationSelectorItems.push(new OrganizationSelectorItem(organization.display_name, `${router.basePath}/${organization.name}`, currentOrgSlug === organization.name));
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

  if (commonData.organization) {
    breadcrumb.push(new BreadcrumbItem(commonData.organization.display_name, `${router.basePath}/${commonData.organization?.sluglified_name}`, !!(commonData.organization && !commonData.team)));
  }

  if (commonData.team) {
    breadcrumb.push(
      new BreadcrumbItem(
        `# ${commonData.team.display_name}`,
        `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}`,
        !!(commonData.organization && commonData.team),
      ),
    );
  }

  return (
    <>
      <PureSidebar
        navigation={channelList}
        organizationSelectorItems={organizationSelectorItems}
        meta={
          <Meta
            title={`Kyso - ${Sanitizer.ifNullReturnDefault(commonData.organization?.display_name, '')}`}
            description={`${Sanitizer.ifNullReturnDefault(commonData.organization?.display_name, '')}`}
          />
        }
      >
        <div className="md:pl-64 flex flex-col flex-1 bg-white border-b">
          <div className="p-4 flex items-center justify-between">
            <div>
              <KysoBreadcrumb navigation={breadcrumb}></KysoBreadcrumb>
            </div>
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
