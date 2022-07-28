import { NavigationSelector } from '@/components/NavigationSelector';
import { PureKysoBreadcrumb } from '@/components/PureKysoBreadcrumb';
import type { CommonData } from '@/hooks/use-common-data';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { ReportDTO } from '@kyso-io/kyso-model';
import type { ReactNode } from 'react';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  basePath: string;
  children: ReactNode;
  report?: ReportDTO;
  commonData: CommonData;
}

const UnpureMain = (props: Props) => {
  const { basePath, report, commonData } = props;

  const selectorItems: BreadcrumbItem[] = [];
  if (commonData.permissions && commonData.permissions.organizations) {
    commonData.permissions!.organizations.forEach((organization) => {
      selectorItems.push(new BreadcrumbItem(organization.display_name, `${basePath}/${organization.name}`, commonData.organization?.sluglified_name === organization.name));
    });
  }

  const channelSelectorItems: BreadcrumbItem[] = [];

  if (commonData.permissions && commonData.permissions.teams) {
    commonData
      .permissions!.teams.filter((team) => team.organization_id === commonData.organization?.id)
      .forEach((team) => {
        channelSelectorItems.push(new BreadcrumbItem(team.display_name, `${basePath}/${commonData.organization?.sluglified_name}/${team.name}`, commonData.team?.sluglified_name === team.name));
      });
  }

  const breadcrumb: BreadcrumbItem[] = [];

  if (report) {
    breadcrumb.push(
      new BreadcrumbItem(
        report?.title,
        `${basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`,
        commonData.organization && commonData.team && report && true,
      ),
    );
  }

  return (
    <React.Fragment>
      {selectorItems.length > 0 && (
        <div className="border-b ">
          <div className="md:container min-h-[50px] mx-auto flex items-center">
            {commonData.organization && <NavigationSelector selectorItems={selectorItems} />}
            {commonData.organization && (
              <svg className="shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
            )}
            {commonData.organization && <NavigationSelector selectorItems={channelSelectorItems} selectorLabel="channel" />}
            {commonData.organization && report && (
              <svg className="shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
            )}
            {commonData.organization && <PureKysoBreadcrumb breadcrumbs={breadcrumb}></PureKysoBreadcrumb>}
          </div>
        </div>
      )}
      <div className="py-4 px-6">{props.children}</div>
    </React.Fragment>
  );
};

export default UnpureMain;
