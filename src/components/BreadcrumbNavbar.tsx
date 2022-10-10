import { NavigationSelector } from '@/components/NavigationSelector';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/types/common-data';
import { PlusCircleIcon } from '@heroicons/react/outline';
import type { ReportDTO } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
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
      const paths = router.query.path;
      const crumbs = paths
        .filter((p: string) => p !== '')
        .map((p, index) => {
          return new BreadcrumbItem(p, `${reportUrl}/${paths.slice(0, index + 1).join('/')}${version ? `?version=${version}` : ''}`, false);
        });
      data.push(...crumbs);
    } else if (report.main_file) {
      const breadcrumItem: BreadcrumbItem = new BreadcrumbItem(report.main_file, `${reportUrl}/${report.main_file}${version ? `?version=${version}` : ''}`, false);
      data.push(breadcrumItem);
    }
    return data;
  }, [commonData.organization, commonData.team, report]);

  return (
    <div>
      {organizationSelectorItems.length > 0 && (
        <div className="flex lg:flex-row flex-col lg:items-center space-y-2 lg:space-y-0 lg:space-x-0 p-2">
          {
            <NavigationSelector
              selectorItems={organizationSelectorItems}
              extraItem={
                commonData.user !== null ? (
                  <React.Fragment>
                    <span className="my-2 bg-gray-300 h-0.5 mx-3" />
                    <a href={`${basePath}/create-organization`} className={clsx('text-gray-500 hover:bg-gray-50 hover:text-gray-900', 'flex items-center px-3 py-2 text-sm  rounded-md')}>
                      <PlusCircleIcon className="w-5 h-5 mr-1" /> New organization
                    </a>
                  </React.Fragment>
                ) : undefined
              }
            />
          }
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
                  <a
                    href={page.href}
                    className={page.current ? 'text-sm hover:underline font-medium text-gray-800 hover:text-black' : 'text-sm hover:underline  font-medium text-gray-500 hover:text-gray-700'}
                    style={{
                      textOverflow: 'ellipsis',
                      maxWidth: '55vh',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }}
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
              </div>
            ))}
        </div>
      )}
      {props.children && <div className="py-4 px-6">{props.children}</div>}
    </div>
  );
};

export default BreadcrumbNavbar;
