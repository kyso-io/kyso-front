import { PureKysoBreadcrumb } from '@/components/PureKysoBreadcrumb';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import { useRouter } from 'next/router';
import { NavigationSelectorItem } from '@/model/navigation-selector-item.model';

import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { NavigationSelector } from '@/components/NavigationSelector';
import { useCommonReportData } from '@/hooks/use-common-report-data';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UnpureMain = (props: any) => {
  const router = useRouter();
  const report = useCommonReportData();
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

  const breadcrumb: BreadcrumbItem[] = [];

  if (report) {
    breadcrumb.push(
      new BreadcrumbItem(
        report?.title,
        `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`,
        commonData.organization && commonData.team && report && true,
      ),
    );
  }

  return (
    <>
      <div className="flex border-b justify-end">
        <div className="md:container md:mx-auto flex">
          <div className="py-4 pl-6 pr-2 flex items-center space-x-2">
            <NavigationSelector selectorItems={selectorItems} />
            <svg className="shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
            </svg>
            <NavigationSelector selectorItems={channelSelectorItems} selectorLabel="channel" />
            {report && (
              <svg className="shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
            )}
          </div>
          <div className="flex">
            <PureKysoBreadcrumb breadcrumbs={breadcrumb}></PureKysoBreadcrumb>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 bg-neutral-50 ">
        <div className="py-4 px-6 md:container md:mx-auto">{props.children}</div>
      </div>
    </>
  );
};

export default UnpureMain;
