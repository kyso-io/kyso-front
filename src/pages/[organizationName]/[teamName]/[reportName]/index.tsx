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
import { useAuthors } from '@/hooks/use-authors';
import format from 'date-fns/format';
import UnpureUpvoteButton from '@/wrappers/UnpureUpvoteButton';
import UnpureShareButton from '@/wrappers/UnpureShareButton';
import UnpureReportActionDropdown from '@/wrappers/UnpureReportActionDropdown';

const Index = () => {
  const router = useRouter();
  const commonData: CommonData = useCommonData();
  const report = useCommonReportData();
  const authors = useAuthors();

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
        <div className="flex flex-col bg-neutral-50 h-screen w-full">
          <div className="flex justify-between p-1">
            <div className="prose-sm">
              <h1 className="m-0 mb-2">{report?.title}</h1>
              {report?.description && <p>{report?.description}</p>}
              <div className="prose prose-sm flex items-center text-gray-500 font-light space-x-2">
                <div className="flex">
                  {authors?.map((author) => (
                    <div key={author.display_name} className="shrink-0 group block">
                      <div className="flex items-center">
                        <div>
                          <img className="m-0 inline-block h-9 w-9 rounded-full" src={author.avatar_url} alt="" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{author.display_name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  created
                  <span className="text-gray-800 mx-1 ">{report?.created_at && format(new Date(report.created_at), 'MMM dd, yyyy')}.</span>
                  Last update on
                  <span className="text-gray-800 mx-2">{report?.updated_at && format(new Date(report.updated_at), 'MMM dd, yyyy')}.</span>
                </div>
                {/* {report?.last_version && (
                  <p> Version: {report.last_version} </p>
                )}
                {report?.tags.map(tag => (
                  <div>
                    {tag}
                  </div>
                ))} */}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {report?.id && <UnpureUpvoteButton id={report!.id} />}
              {report?.id && <UnpureShareButton id={report!.id} />}
              {report?.id && <UnpureReportActionDropdown id={report!.id} />}
            </div>
          </div>
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
