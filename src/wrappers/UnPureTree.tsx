import PureTreeItem from '@/components/PureTreeItem';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useRouter } from 'next/router';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import { useEffect, useState } from 'react';
import { useFileToRender } from '@/hooks/use-file-to-render';
import classNames from '@/helpers/class-names';
import { ArrowsExpandIcon, SelectorIcon, StarIcon } from '@heroicons/react/solid';
import { updateReportAction } from '@kyso-io/kyso-store';
import { useAppDispatch } from '@/hooks/redux-hooks';
import type { GithubFileHash, UpdateReportRequestDTO } from '@kyso-io/kyso-model';
import { useTree } from '@/hooks/use-tree';

type IUnPureTreeProps = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  prefix: string;
};

const UnPureTree = (props: IUnPureTreeProps) => {
  const router = useRouter();
  const { prefix } = props;
  const tree: GithubFileHash[] = useTree();
  const breadcrumbs: BreadcrumbItem[] = [];
  const commonData: CommonData = useCommonData();
  const report = useCommonReportData();
  const [isBusy, setIsBusy] = useState(false);
  const dispatch = useAppDispatch();
  const fileToRender = useFileToRender();
  // is it just a file page, not a directory
  const isTerminalFile = tree && tree?.length === 1 && tree[0]!.path === router.query.path;
  const isAtSelf = report?.main_file === fileToRender?.path;

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

  // TODO
  const setMainFile = async () => {
    setIsBusy(true);
    const result = await dispatch(
      updateReportAction({
        reportId: report.id!,
        data: {
          main_file: tree && tree.length >= 1 && tree[0]!.path,
        } as UpdateReportRequestDTO,
      }),
    );
    if (result?.payload) {
      // success
    }
    setIsBusy(false);
  };

  const makeNewPath = (currentPath: null | string, newPage: null | string) => {
    if (!currentPath) {
      return `${newPage}`;
    }

    if (newPage === '..') {
      return currentPath.split('/').slice(0, -1).join('/');
    }

    return `${currentPath}/${newPage}`;
  };

  return (
    <div>
      <div className="text-xs border text-gray-800 bg-gray-100 rounded-t ">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center space-x-0 ml-3">
            {breadcrumbs.map((page, index) => (
              <div key={`${page.href}+${index}`}>
                <div className="flex items-center">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      const url = new URL(page.href, 'https://kyso.io');
                      router.replace({ query: { ...router.query, path: url.searchParams.get('path') } });
                    }}
                    href={page.href}
                    className={'hover:underline ml-0 text-sm font-medium'}
                    aria-current={page.current ? 'page' : undefined}
                  >
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
          <div className="flex items-center px-2 space-x-4">
            {fileToRender && !isAtSelf && (
              <button
                type="button"
                onClick={() => {
                  setMainFile();
                }}
                className="inline-flex w-38 items-center px-3 py-2 border rounded text-xs font-medium text-slate-700 hover:bg-slate-200 focus:outline-none"
              >
                <StarIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                {isBusy ? 'Setting' : 'Set as main file'}
              </button>
            )}
            {fileToRender && isAtSelf && (
              <div className="inline-flex items-center py-2 rounded text-xs font-medium text-slate-700">
                <StarIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Main file
              </div>
            )}
            {fileToRender?.path.endsWith('.html') && fileToRender && (
              <a href={`${'/scs'}${fileToRender.path_scs}`} className="block" target="_blank" rel="noreferrer">
                <button className="inline-flex w-38 items-center px-3 py-2 border hover:bg-slate-200  rounded text-xs font-medium text-slate-700">
                  <ArrowsExpandIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                  Open in Full screen
                </button>
              </a>
            )}
            {!isTerminalFile && (
              <button
                type="button"
                className="inline-flex ml-3 w-40 items-center px-3 py-4 border-l rounded-tr text-xs font-medium text-gray-700 hover:underline focus:outline-none"
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
          {router.query.path && breadcrumbs && breadcrumbs.length > 1 && (
            <a
              onClick={(e) => {
                e.preventDefault();
                const path = makeNewPath(router.query.path as string, '..');
                router.replace({ query: { ...router.query, path } });
              }}
              href={breadcrumbs?.slice(-2)[0]!.href}
              className={classNames('font-medium text-blue-700', 'hover:text-gray-900', 'font-normal hover:bg-neutral-50')}
            >
              <div className="py-2 px-3 text-sm group flex items-center justify-between">..</div>
            </a>
          )}

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {tree?.map((item: any) => (
            <PureTreeItem
              key={item.path}
              treeItem={item}
              prefix={prefix}
              currentPath={router.query?.path as string}
              pathOfMainFile={report?.main_file}
              onClick={(e) => {
                e.preventDefault();
                const path = makeNewPath(router.query.path as string, item.path);
                router.replace({ query: { ...router.query, path } });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UnPureTree;
