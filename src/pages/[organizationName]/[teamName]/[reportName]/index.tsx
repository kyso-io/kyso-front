import KysoTopBar from '@/layouts/KysoTopBar';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import { useRouter } from 'next/router';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { fetchReportsTreeAction } from '@kyso-io/kyso-store';
import { useEffect } from 'react';
import UnPureTree from '@/wrappers/UnPureTree';
import UnpureReportRender from '@/wrappers/UnpureReportRender';
import classNames from '@/helpers/ClassNames';
import { useFileToRender } from '@/hooks/use-file-to-render';
import UnpureMain from '@/wrappers/UnpureMain';

const Index = () => {
  const router = useRouter();
  const commonData: CommonData = useCommonData();
  const report = useCommonReportData();
  const dispatch = useAppDispatch();
  const breadcrumb: BreadcrumbItem[] = [];
  const fileToRender = useFileToRender();
  let tree = useAppSelector((state) => state.reports.tree);

  if (tree) {
    tree = [...tree].sort((ta, tb) => {
      return Number(ta.type > tb.type);
    });
  }

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
        filePath: (router.query.path as string) || '',
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
      <UnpureMain>
        <div className="flex flex-col flex-1 bg-neutral-50 h-screen w-full">
          <UnPureTree tree={tree} prefix={`${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`} />

          {fileToRender && (
            <div className={classNames('bg-white border-b border-l border-r rounded-b-lg')}>
              <UnpureReportRender />
            </div>
          )}
        </div>
      </UnpureMain>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
