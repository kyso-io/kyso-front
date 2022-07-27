import KysoTopBar from '@/layouts/KysoTopBar';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { useReports } from '@/hooks/use-reports';
import UnpureMain from '@/unpure-components/UnpureMain';
import UnpureReportBadge from '@/unpure-components/UnpureReportBadge';
import PureReportFilter from '@/components/PureReportFilter';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import checkPermissions from '@/helpers/check-permissions';
import { useMemo } from 'react';
import type { ReportDTO } from '@kyso-io/kyso-model';

const tags = ['plotly', 'multiqc', 'python', 'data-science', 'rstudio', 'genetics', 'physics'];

const pushQueryString = (router: NextRouter, newValue: object) => {
  let query: { tags?: string | string[]; search?: string; sort?: string } = {};
  if (router.query.tags) {
    query.tags = router.query.tags;
  }
  if (router.query.search) {
    query.search = router.query.search as string;
  }
  if (router.query.sort) {
    query.sort = router.query.sort as string;
  }

  query = {
    ...query,
    ...newValue,
  };

  router.push({
    pathname: `/${router.query.organizationName}/${router.query.teamName}`,
    query,
  });
};

const Index = () => {
  const router = useRouter();
  useRedirectIfNoJWT();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });

  const reports: ReportDTO[] | undefined = useReports({
    teamId: commonData.team?.id,
    perPage: router.query.per_page as string,
    page: router.query.page as string,
    search: router.query.search as string,
    sort: router.query.sort as string,
    tags: router.query.tags as string[],
  });

  const hasPermissionGlobalPinReport = useMemo(() => checkPermissions(commonData, 'KYSO_IO_REPORT_GLOBAL_PIN'), [commonData]);

  const sortOptions = [
    { name: 'Recently published', value: '-created_at' },
    { name: 'Recently updated', value: '-updated_at' },
  ];

  let activeFilters = [];
  if (router.query.search) {
    activeFilters.push(`${router.query.search}`);
  }
  if (router.query.tags) {
    if (Array.isArray(router.query.tags)) {
      activeFilters = activeFilters.concat(router.query.tags);
    } else {
      activeFilters.push(router.query.tags);
    }
  }

  let currentPage = 1;
  if (router.query.page && router.query.page.length > 0) {
    currentPage = parseInt(router.query.page as string, 10);
  }

  let reportsPerPage = 20;
  if (router.query.per_page && router.query.per_page.length > 0) {
    reportsPerPage = parseInt(router.query.per_page as string, 10);
  }

  let enabledNextPage = false;
  if (reports && reports.length === reportsPerPage) {
    enabledNextPage = true;
  }

  let extraParamsUrl = '';
  if (router.query.search && router.query.search.length > 0) {
    extraParamsUrl += `&search=${router.query.search}`;
  }
  if (router.query.sort && router.query.sort.length > 0) {
    extraParamsUrl += `&sort=${router.query.sort}`;
  }
  if (router.query.tags && router.query.tags.length > 0) {
    extraParamsUrl += `&tags=${router.query.tags}`;
  }

  if (router.query.per_page && router.query.per_page.length > 0) {
    extraParamsUrl += `&per_page=${router.query.per_page}`;
  }

  return (
    <UnpureMain basePath={router.basePath} commonData={commonData}>
      <div className="container mx-auto">
        <PureReportFilter
          defaultSearch={(router.query.search as string) || null}
          sortOptions={sortOptions}
          tags={tags}
          activeFilters={activeFilters}
          onSetSearch={(search: string) => {
            pushQueryString(router, { search });
          }}
          onSetTags={(newTags: string[]) => {
            pushQueryString(router, { tags: newTags });
          }}
          onSetSort={(sort: string) => {
            pushQueryString(router, { sort });
          }}
          currentSort={router.query.sort as string}
          onClear={() => {
            router.push({
              pathname: `/${router.query.organizationName}/${router.query.teamName}`,
              query: null,
            });
          }}
        />
        <div className="mt-8">
          <ul role="list" className="space-y-4">
            {reports?.map((report) => (
              <UnpureReportBadge key={report.id} report={report} commonData={commonData} hasPermissionGlobalPinReport={hasPermissionGlobalPinReport} />
            ))}
          </ul>
        </div>

        <div className="flex-1 flex mt-4 justify-center">
          {!(currentPage - 1 < 1) && (
            <a
              href={currentPage - 1 < 1 ? '#' : `?page=${currentPage - 1}${extraParamsUrl}`}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </a>
          )}

          {enabledNextPage && <p className="px-6 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">Page {currentPage}</p>}

          {enabledNextPage && (
            <a
              href={enabledNextPage ? `?page=${currentPage + 1}${extraParamsUrl}` : '#'}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </a>
          )}
        </div>
      </div>
    </UnpureMain>
  );
};

Index.layout = KysoTopBar;

export default Index;
