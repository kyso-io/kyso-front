import { NavigationSelector } from '@/components/NavigationSelector';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/types/common-data';
import type { ReportDTO } from '@kyso-io/kyso-model';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import Link from 'next/link';
import { ChannelSelector } from './ChannelSelector';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  basePath: string;
  children?: ReactNode;
  report: ReportDTO | null | undefined;
  commonData: CommonData;
}

const BreadcrumbNavbar = (props: Props) => {
  const { basePath, report, commonData } = props;
  const router = useRouter();

  const organizationSelectorItems: BreadcrumbItem[] = useMemo(() => {
    if (!commonData.permissions || !commonData.permissions.organizations) {
      return [];
    }
    return commonData.permissions!.organizations.map((organization) => {
      return new BreadcrumbItem(organization.display_name, `${basePath}/${organization.name}`, commonData.organization?.sluglified_name === organization.name);
    });
  }, [commonData.permissions, commonData.organization]);

  const breadcrumb: BreadcrumbItem[] = useMemo(() => {
    const data: BreadcrumbItem[] = [];
    if (!report) {
      return data;
    }
    data.push(
      new BreadcrumbItem(
        report?.title,
        `${basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`,
        commonData.organization != null && commonData.team != null && report != null,
      ),
    );
    const reportUrl = `${basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`;
    const version = router.query.version as string;
    if (router.query.path && Array.isArray(router.query.path)) {
      const paths = router.query.path.filter((p: string) => p !== '');
      const crumbs: BreadcrumbItem[] = paths.map(
        (p, index) => new BreadcrumbItem(p, `${reportUrl}/${paths.slice(0, index + 1).join('/')}${version ? `?version=${version}` : ''}`, index === paths.length - 1),
      );
      data.push(...crumbs);
    } else if (report.main_file) {
      const paths: string[] = report.main_file.split('/').filter((p: string) => p !== '');
      const crumbs: BreadcrumbItem[] = paths.map(
        (p, index) => new BreadcrumbItem(p, `${reportUrl}/${paths.slice(0, index + 1).join('/')}${version ? `?version=${version}` : ''}`, index === paths.length - 1),
      );
      data.push(...crumbs);
    }
    return data;
  }, [commonData.organization, commonData.team, report, router.query?.path, router.query?.version, router]);

  const breadcrumbItems = breadcrumb.length;
  let hideBreadcrumbClassName = '';

  if (breadcrumbItems > 0) {
    hideBreadcrumbClassName = 'hidden lg:block';
  }

  return (
    <div className={hideBreadcrumbClassName}>
      {organizationSelectorItems.length > 0 && (
        <div className="flex flex-row items-center space-y-0 space-x-0 p-2">
          {<NavigationSelector commonData={commonData} selectorItems={organizationSelectorItems} />}
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
              <div key={page.href} className="flex items-center">
                <div className="flex items-center">
                  <Link
                    href={page.href}
                    className={
                      page.current
                        ? 'text-xs lg:text-sm hover:underline font-medium text-gray-800 hover:text-black'
                        : 'text-xs lg:text-sm hover:underline  font-medium text-gray-500 hover:text-gray-700'
                    }
                    style={{
                      textOverflow: 'ellipsis',
                      maxWidth: '55vh',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }}
                    aria-current={page.current ? 'page' : undefined}
                  >
                    {page.name}
                  </Link>
                </div>
                {index !== breadcrumb.length - 1 && (
                  <svg className="hidden lg:inline-block shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                )}
              </div>
            ))}
        </div>
      )}
      {props.children && <div className="py-4 px-6">{props.children}</div>}
    </div>
  );
};

export default BreadcrumbNavbar;
