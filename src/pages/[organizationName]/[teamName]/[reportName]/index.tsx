import KysoTopBar from "@/layouts/KysoTopBar";
import type { CommonData } from "@/hooks/use-common-data";
import { useCommonData } from "@/hooks/use-common-data";
import UnpureReportRender from "@/wrappers/UnpureReportRender";
import { KysoBreadcrumb } from "@/components/KysoBreadcrumb";
import { BreadcrumbItem } from "@/model/breadcrum-item.model";
import { useRouter } from "next/router";
import { useCommonReportData } from "@/hooks/use-common-report-data";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { fetchReportsTreeAction } from "@kyso-io/kyso-store";
import { useEffect } from "react";
import UnPureTree from "@/wrappers/UnPureTree";

const Index = () => {
  const router = useRouter();
  const commonData: CommonData = useCommonData();
  const report = useCommonReportData();
  const dispatch = useAppDispatch();
  const breadcrumb: BreadcrumbItem[] = [];
  const tree = useAppSelector((state) => state.reports.tree);

  useEffect(() => {
    if (!report) {
      return;
    }
    const asyncFn = async () => {
      interface ArgType {
        reportId: string;
        filePath: string;
        version?: number;
      }

      const args: ArgType = {
        reportId: report!.id as string,
        filePath: (router.query.path as string) || "",
      };
      if (router.query.version && !Number.isNaN(router.query.version)) {
        args.version = parseInt(router.query.version as string, 10);
      }
      await dispatch(fetchReportsTreeAction(args));
    };
    asyncFn();
  }, [report?.id, router?.query?.path]);

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
      <div className="md:pl-64 flex flex-col flex-1 bg-white border-b">
        <div className="p-4 flex items-center justify-between">
          <KysoBreadcrumb navigation={breadcrumb}></KysoBreadcrumb>
        </div>
      </div>
      <div>
        <div className="md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 mt-16 bg-neutral-100">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-20">
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
              <div className="pt-4">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center" id="communities-headline">
                  {/* <CollectionIcon 
                    className={classNames("text-gray-400 group-hover:text-gray-500", "flex-shrink-0 -ml-1 mr-2 h-5 w-5")}
                  /> */}
                  <span className="truncate">Tree</span>
                </p>
                <div className="mt-3 space-y-2" aria-labelledby="communities-headline">
                  <UnPureTree tree={tree} prefix={`${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:pl-64 flex flex-col flex-1 bg-neutral-50 ">
          <div className="py-4 px-6">
            <UnpureReportRender />
          </div>
        </div>
      </div>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
