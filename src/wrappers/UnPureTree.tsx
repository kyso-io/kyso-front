import PureTreeItem from '@/components/PureTreeItem';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useRouter } from 'next/router';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import { useEffect } from 'react';
import { useFileToRender } from '@/hooks/use-file-to-render';
import classNames from '@/helpers/ClassNames';
import { SelectorIcon, StarIcon } from '@heroicons/react/solid';

type IUnPureTreeProps = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  tree: any;
  prefix: string;
};

const UnPureTree = (props: IUnPureTreeProps) => {
  const router = useRouter();
  // const dispatch = useAppDispatch()
  const { tree, prefix } = props;
  // const [isBusy, setIsBusy] = useState(false)
  const breadcrumbs: BreadcrumbItem[] = [];

  const commonData: CommonData = useCommonData();
  const report = useCommonReportData();

  const fileToRender = useFileToRender();

  // is it just a file page, not a directory
  const isTerminalFile = tree && tree.length === 1 && tree[0].path === router.query.path;

  if (report) {
    breadcrumbs.push(new BreadcrumbItem(report?.name, `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`, false));
  }

  useEffect(() => {
    if (router.query.path) {
      router.replace({ query: { ...router.query, fbvisible: true } });
    }
  }, [router.query.path]);

  if (router.query.path) {
    const paths = (router.query.path as string).split('/');
    const littleCrumbs = paths.map((path, index) => {
      let url = `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}?`;
      if (router.query.version) {
        url += `version=${router.query.version}&fbvisible=true&`;
      }

      url += `path=`;
      if (index === 0) {
        url += `${path}`;
      } else {
        url += `${paths.slice(0, index).join('/')}/${path}`;
      }

      return new BreadcrumbItem(path, url, false);
    });

    breadcrumbs.push(...littleCrumbs);
  }

  if (fileToRender && !router.query.path) {
    // this means its a readme or other index file
    breadcrumbs.push(new BreadcrumbItem(fileToRender.path, `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`, false));
  }

  // const setMainFile = async () => {
  //   setIsBusy(true);
  //   const result = await dispatch(
  //     updateReportAction({
  //       reportId: report.id!,
  //       data: {
  //         main_file: tree[0].path,
  //       },
  //     })
  //   );
  //   if (result?.payload) {
  //     // success
  //   }
  //   setIsBusy(false);
  // };

  return (
    <div className={classNames('bg-white')}>
      <div>
        <div className="text-xs group h-12 flex pl-3 items-center border text-gray-800 bg-gray-100 rounded-t justify-between">
          <div className="flex items-center space-x-0">
            {breadcrumbs.map((page, index) => (
              <div key={`${page.href}+${index}`}>
                <div className="flex items-center">
                  <a href={page.href} className={'hover:underline ml-0 text-sm font-medium'} aria-current={page.current ? 'page' : undefined}>
                    {page.name}
                  </a>
                  {index + 1 !== breadcrumbs.length && (
                    <svg className="shrink-0 h-3 w-3 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {fileToRender && report?.main_file !== fileToRender?.path && (
              <button
                // onClick={setMainFile}
                type="button"
                className="inline-flex m-3 w-38 items-center px-3 py-2 border rounded text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 focus:outline-none"
              >
                <StarIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Set as entrypoint file
              </button>
            )}
            {fileToRender && report?.main_file === fileToRender?.path && (
              <div className="inline-flex m-3 w-38 items-center px-3 py-2 border rounded text-xs font-medium text-slate-500">
                <StarIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Entrypoint file
              </div>
            )}
            {!isTerminalFile && (
              <button
                type="button"
                className="inline-flex ml-3 w-40 items-center px-3 py-4 border-l rounded-tr text-xs font-medium text-gray-700 bg-gray-200 hover:bg-slate-300 focus:outline-none"
                onClick={() => {
                  if (router.query.fbvisible) {
                    const { query } = router;
                    delete query.fbvisible;
                    router.replace({ query: { ...query } });
                  } else {
                    router.replace({ query: { ...router.query, fbvisible: true } });
                  }
                }}
              >
                {router.query.fbvisible && (
                  <>
                    <SelectorIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                    Hide File Browser
                  </>
                )}
                {!router.query.fbvisible && (
                  <>
                    <SelectorIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                    Show File Browser
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {router.query.fbvisible && !isTerminalFile && (
        <div className="divide-y border-b border-x">
          {breadcrumbs && breadcrumbs.length > 1 && (
            <a href={breadcrumbs?.slice(-2)[0]!.href} className={classNames('font-medium text-blue-700', 'hover:text-gray-900', 'font-normal hover:bg-neutral-50')}>
              <div className="py-2 px-3 text-sm group flex items-center justify-between">..</div>
            </a>
          )}

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {tree?.map((item: any) => (
            <PureTreeItem key={item.path} treeItem={item} prefix={prefix} currentPath={router.query?.path as string} pathOfMainFile={report?.main_file} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UnPureTree;
