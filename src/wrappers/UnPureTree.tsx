import PureTreeItem from '@/components/PureTreeItem';
import { useRouter } from 'next/router';
import classNames from '@/helpers/class-names';
import type { GithubFileHash } from '@kyso-io/kyso-model';
import { useTree } from '@/hooks/use-tree';
import { extname, dirname } from 'path';
import { ChevronLeftIcon } from '@heroicons/react/solid';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import buildReportUrl from '@/helpers/build-report-url';

const UnpureTree = () => {
  const router = useRouter();
  const commonData: CommonData = useCommonData();
  const report = useCommonReportData();

  let currentPath = '';
  if (router.query.path) {
    currentPath = (router.query.path as string) || '';
  }
  const breadcrumbs: BreadcrumbItem[] = [];
  const lastPathSegment = currentPath.split('/').slice(-1)[0];

  const selfTree: GithubFileHash[] = useTree({
    path: currentPath,
  });

  const parentTree: GithubFileHash[] = useTree({
    path: dirname(currentPath),
  });

  // console.log({ selfTree, path: currentPath })
  // console.log({ parentTree, path: dirname(currentPath) })
  let currentItem: GithubFileHash | null | undefined = null;

  if (selfTree && parentTree) {
    currentItem = [...selfTree, ...parentTree].find((treeItem) => treeItem.path === lastPathSegment);
  }

  let tree = selfTree;
  if (currentItem?.type === 'file') {
    tree = parentTree;
  }

  if (report) {
    breadcrumbs.push(new BreadcrumbItem(report?.name, `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`, false));
  }

  if (router.query.path) {
    let paths = (router.query.path as string).split('/');

    // dont show the filename in these breadcrumbs - not enough space
    if (currentItem?.type === 'file') {
      paths = paths.slice(0, -1);
    }

    const littleCrumbs = paths.map((path, index) => {
      let url = buildReportUrl(router.basePath, commonData.organization, commonData.team, report);
      if (router.query.version) {
        url += `version=${router.query.version}&`;
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

  const goToNewPath = (item?: GithubFileHash) => {
    // if item is undefined it means go up
    // lets go up
    if (!item) {
      // only inside one folder going to top level, lets remove path from query
      if (currentPath.split('/').length === 1) {
        console.log(1);
        const qs = { ...router.query };
        delete qs.path;
        return router.replace({ query: qs });
      }
      if (currentPath.split('/').length > 1) {
        console.log(2);
        // inside deeper folder, remove last folder from path only
        const existingPathIsFile = extname(lastPathSegment!) !== '';
        const sliceIndex = existingPathIsFile ? 2 : 1;
        return router.replace({ query: { ...router.query, path: currentPath.split('/').slice(0, -sliceIndex).join('/') } });
      }
    }

    // default case normal folder link
    const isFile = item!.type === 'file';
    const existingPathIsFile = currentItem?.type === 'file';

    if (!isFile) {
      if (existingPathIsFile) {
        console.log(3);
        const dirPath = currentPath.split('/').slice(0, -1).join('/');
        const newPath: string | null = `${dirPath ? `${dirPath}/` : ''}${item!.path}`;
        return router.replace({ query: { ...router.query, path: newPath } });
      }

      console.log(4);
      const newPath: string | null = `${currentPath ? `${currentPath}/` : ''}${item!.path}`;
      return router.replace({ query: { ...router.query, path: newPath } });
    }

    if (isFile) {
      if (item!.path === lastPathSegment) {
        console.log(5);
        // do nothing since its a re-click
      } else if (!existingPathIsFile) {
        console.log(6);
        // its currently on a folder
        const newPath: string | null = `${currentItem ? `${currentPath}/` : ''}${item!.path}`;
        // console.log(currentItem, newPath)
        return router.replace({ query: { ...router.query, path: newPath } });
      } else {
        console.log(7);
        // its currently on a file
        const dirPath = currentPath.split('/').slice(0, -1).join('/');
        const newPath: string | null = `${dirPath ? `${dirPath}/` : ''}${item!.path}`;
        return router.replace({ query: { ...router.query, path: newPath } });
      }
    }

    return null;
  };

  return (
    <div>
      <div className="text-sm rounded">
        <div className="flex min-h-12 items-center justify-between mt-12">
          <div className="flex items-center space-x-0 ml-3 mb-6 h-4">
            <div className={classNames('flex items-center')}>
              <div className={classNames('hover:underline ml-0 text-sm', 'font-normal text-gray-400 mr-1')}>files in</div>
              {breadcrumbs.map((page, index) => (
                <div key={`${page.href}+${index}`} className={classNames('flex items-center')}>
                  <a
                    key={`${page.href}+${index}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const url = new URL(page.href, 'https://kyso.io');
                      router.replace({ query: { ...router.query, path: url.searchParams.get('path') } });
                    }}
                    href={page.href}
                    className={classNames('hover:underline ml-0 text-sm', index + 1 === breadcrumbs.length ? 'font-normal text-gray-400' : 'font-medium text-indigo-500')}
                    aria-current={page.current ? 'page' : undefined}
                  >
                    {page.name}
                  </a>
                  <svg className="shrink-0 h-3 w-3 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="">
        {currentPath && (
          <button
            onClick={(e) => {
              e.preventDefault();
              goToNewPath();
            }}
            className={classNames('py-2 px-3 text-sm w-full text-gray-400 group flex items-center justify-between truncate', 'hover:underline')}
          >
            <div className={classNames('group flex items-center font-medium text-slate-500', 'hover:text-gray-900', 'font-normal')}>
              <ChevronLeftIcon className="h-6 w-6 mr-1 text-gray-400" />
              <span className="text-gray-400">back</span>
            </div>
          </button>
        )}

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {tree?.map((item: any) => (
          <PureTreeItem
            key={item.path}
            treeItem={item}
            current={lastPathSegment === item.path}
            isMainFile={item.path === report.main_file}
            onClick={(e) => {
              e.preventDefault();
              goToNewPath(item);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default UnpureTree;
