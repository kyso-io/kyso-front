import { NavigationSelector } from '@/components/NavigationSelector';
import type { CommonData } from '@/hooks/use-common-data';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { ReportDTO } from '@kyso-io/kyso-model';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { ChannelSelector } from './ChannelSelector';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  basePath: string;
  children?: ReactNode;
  report?: ReportDTO;
  commonData: CommonData;
}

const BreadcrumbNavbar = (props: Props) => {
  const { basePath, report, commonData } = props;
  const router = useRouter();

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
        commonData.organization != null && commonData.team != null && report != null,
      ),
    );
  }

  if (Array.isArray(router.query.path)) {
    const paths = router.query.path;
    const reportUrl = `${basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`;
    const version = router.query.version as string;
    const crumbs = paths
      .filter((p) => p !== '')
      .map((p, index) => {
        return new BreadcrumbItem(p, `${reportUrl}/${paths.slice(0, index + 1).join('/')}${version ? `?version=${version}` : ''}`, false);
      });

    console.log(crumbs);
    breadcrumb.push(...crumbs);
  }

  return (
    <div>
      {selectorItems.length > 0 && (
        <div className="flex lg:flex-row flex-col lg:items-center space-y-2 lg:space-y-0 lg:space-x-0 p-2">
          {<NavigationSelector selectorItems={selectorItems} />}
          {commonData.organization && (
            <svg className="hidden lg:inline-block shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
            </svg>
          )}

          {commonData.organization && <ChannelSelector basePath={basePath} commonData={commonData} />}

          {commonData.organization && report && (
            <svg className="hidden lg:inline-block shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
            </svg>
          )}

          {commonData.organization &&
            breadcrumb.map((page, index) => (
              <>
                <div key={page.href} className="flex items-center">
                  <a
                    href={page.href}
                    className={page.current ? 'text-sm hover:underline font-medium text-gray-800 hover:text-black' : 'text-sm hover:underline  font-medium text-gray-500 hover:text-gray-700'}
                    aria-current={page.current ? 'page' : undefined}
                  >
                    {page.name}
                  </a>
                </div>
                {index !== breadcrumb.length - 1 && (
                  <svg className="hidden lg:inline-block shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                )}
              </>
            ))}
        </div>
      )}
      {props.children && <div className="py-4 px-6">{props.children}</div>}
    </div>
  );
};

export default BreadcrumbNavbar;
