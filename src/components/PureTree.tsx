import PureTreeItem from '@/components/PureTreeItem';
import classNames from '@/helpers/class-names';
import type { GithubFileHash, ReportDTO } from '@kyso-io/kyso-model';
import { extname } from 'path';
import { ChevronLeftIcon } from '@heroicons/react/solid';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/hooks/use-common-data';

type IPureTree = {
  path: string;
  basePath: string;
  commonData: CommonData;
  report: ReportDTO;
  version: string;
  onPushQuery: (newPath?: string | null | undefined) => void;
  selfTree: GithubFileHash[];
  parentTree: GithubFileHash[];
};

const PureTree = (props: IPureTree) => {
  const { path, basePath, version, commonData, report, onPushQuery, selfTree = [], parentTree = [] } = props;

  let currentPath = '';
  if (path) {
    currentPath = (path as string) || '';
  }
  const breadcrumbs: BreadcrumbItem[] = [];
  const lastPathSegment = currentPath.split('/').slice(-1)[0];

  let currentItem: GithubFileHash | null | undefined = null;

  if (selfTree && parentTree) {
    currentItem = [...selfTree, ...parentTree].find((treeItem) => treeItem.path === lastPathSegment);
  }

  let tree = selfTree;
  if (currentItem?.type === 'file') {
    tree = parentTree;
  }

  breadcrumbs.push(new BreadcrumbItem(report.name, `${basePath}/${commonData.organization.sluglified_name}/${commonData.team.sluglified_name}/${report.name}`, false));

  if (path) {
    let paths = (path as string).split('/');

    // dont show the filename in these breadcrumbs - not enough space
    if (currentItem?.type === 'file') {
      paths = paths.slice(0, -1);
    }

    const littleCrumbs = paths.map((pathItem, index) => {
      let url = `${basePath}/${commonData.organization.sluglified_name}/${commonData.team.sluglified_name}/${report.name}`;
      if (version) {
        url += `version=${version}&`;
      }

      url += `path=`;
      if (index === 0) {
        url += `${pathItem}`;
      } else {
        url += `${paths.slice(0, index).join('/')}/${pathItem}`;
      }

      return new BreadcrumbItem(pathItem, url, false);
    });

    breadcrumbs.push(...littleCrumbs);
  }

  const goToNewPath = (item?: GithubFileHash) => {
    // if item is undefined it means go up
    // lets go up
    if (!item) {
      // only inside one folder going to top level, lets remove path from query
      if (currentPath.split('/').length === 1) {
        return onPushQuery();
      }
      if (currentPath.split('/').length > 1) {
        // inside deeper folder, remove last folder from path only
        const existingPathIsFile = extname(lastPathSegment!) !== '';
        const sliceIndex = existingPathIsFile ? 2 : 1;
        return onPushQuery(currentPath.split('/').slice(0, -sliceIndex).join('/'));
      }
    }

    // default case normal folder link
    const isFile = item!.type === 'file';
    const existingPathIsFile = currentItem?.type === 'file';

    if (!isFile) {
      if (existingPathIsFile) {
        const dirPath = currentPath.split('/').slice(0, -1).join('/');
        const newPath: string | null = `${dirPath ? `${dirPath}/` : ''}${item!.path}`;
        return onPushQuery(newPath);
      }

      const newPath: string | null = `${currentPath ? `${currentPath}/` : ''}${item!.path}`;
      return onPushQuery(newPath);
    }

    if (isFile) {
      if (item!.path === lastPathSegment) {
        // do nothing since its a re-click
      } else if (!existingPathIsFile) {
        // its currently on a folder
        const newPath: string | null = `${currentItem ? `${currentPath}/` : ''}${item!.path}`;
        return onPushQuery(newPath);
      } else {
        // its currently on a file
        const dirPath = currentPath.split('/').slice(0, -1).join('/');
        const newPath: string | null = `${dirPath ? `${dirPath}/` : ''}${item!.path}`;
        return onPushQuery(newPath);
      }
    }

    return null;
  };

  return (
    <div>
      <div className="text-sm rounded">
        <div className="flex min-h-12 items-center justify-between">
          <div className="flex items-center space-x-0 ml-3 mb-6 h-4">
            <div className={classNames('flex items-center')}>
              {/* <div className={classNames('hover:underline ml-0 text-sm', 'font-normal text-gray-400 mr-1')}>files in</div> */}
              {breadcrumbs.map((page, index) => (
                <div key={`${page.href}+${index}`} className={classNames('flex items-center')}>
                  <a
                    key={`${page.href}+${index}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const url = new URL(page.href, 'https://kyso.io');
                      return onPushQuery(url.searchParams.get('path'));
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
        <button
          onClick={(e) => {
            e.preventDefault();
            goToNewPath();
          }}
          className={classNames(
            'py-2 px-3 text-sm w-full group flex items-center justify-between truncate',
            currentPath ? 'text-gray-400 hover:underline cursor-pointer' : 'text-gray-200 cursor-default',
          )}
        >
          <div className={classNames('group flex min-h-[24px] items-center', '')}>
            <ChevronLeftIcon className="h-6 w-6 mr-1 " />
            <span>back</span>
          </div>
        </button>

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

export default PureTree;
