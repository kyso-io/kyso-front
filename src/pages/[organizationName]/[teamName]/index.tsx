import KysoTopBar from "@/layouts/KysoTopBar";
import type { NextRouter } from "next/router";
import { useRouter } from "next/router";
import { useReports } from "@/hooks/use-reports";
import UnpureSidebar from "@/wrappers/UnpureSidebar";
import UnpureReportBadge from "@/wrappers/UnpureReportBadge";
import PureReportFilter from "@/components/PureReportFilter";

const tags = [
  "plotly",
  "multiqc",
  "python",
  "data-science",
  "rstudio",
  "genetics",
  "physics",
];

const pushQueryString = (router: NextRouter, newValue: object) => {
  let query: { tags?: string | string[]; search?: string; sort?: string } = {};
  if (router.query.tags) query.tags = router.query.tags;
  if (router.query.search) query.search = router.query.search as string;
  if (router.query.sort) query.sort = router.query.sort as string;

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

  const reports = useReports({
    perPage: router.query.per_page as string,
    page: router.query.page as string,
    search: router.query.search as string,
    sort: router.query.sort as string,
    tags: router.query.tags as string[],
  });

  const sortOptions = [
    { name: "Recently published", value: "-created_at" },
    { name: "Recently updated", value: "-updated_at" },
  ];

  if (!router.query.teamName && !router.query.organizationName) {
    return <div>404</div>;
  }

  const onSetSearch = (search: string) => {
    pushQueryString(router, { search });
  };

  const onSetTags = (_tags: string[]) => {
    pushQueryString(router, { tags: _tags });
  };

  const onSetSort = (sort: string) => {
    pushQueryString(router, { sort });
  };

  let activeFilters = [];
  if (router.query.search) activeFilters.push(`${router.query.search}`);
  if (router.query.tags) {
    if (Array.isArray(router.query.tags))
      activeFilters = activeFilters.concat(router.query.tags);
    else activeFilters.push(router.query.tags);
  }

  return (
    <>
      <UnpureSidebar>
        <div className="container mx-auto flex">
          <div className="basis-3/4">
            <PureReportFilter
              defaultSearch={(router.query.search as string) || null}
              sortOptions={sortOptions}
              tags={tags}
              activeFilters={activeFilters}
              onSetSearch={onSetSearch}
              onSetTags={onSetTags}
              onSetSort={onSetSort}
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
                  <UnpureReportBadge id={report.id} key={report.id} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </UnpureSidebar>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
