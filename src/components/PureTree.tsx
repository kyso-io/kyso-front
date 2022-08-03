import PureTreeItem from '@/components/PureTreeItem';
import classNames from '@/helpers/class-names';
import type { GithubFileHash, ReportDTO } from '@kyso-io/kyso-model';
import { extname } from 'path';
import { ChevronLeftIcon } from '@heroicons/react/solid';
import type { CommonData } from '@/hooks/use-common-data';

type IPureTree = {
  path: string;
  basePath: string;
  commonData: CommonData;
  report: ReportDTO;
  version: string;
  selfTree: GithubFileHash[];
  parentTree: GithubFileHash[];
};

const PureTree = (props: IPureTree) => {
  const { path, basePath, version, commonData, report, selfTree = [], parentTree = [] } = props;

  let currentPath = '';
  if (path) {
    currentPath = (path as string) || '';
  }

  const lastPathSegment = currentPath.split('/').slice(-1)[0];

  let currentItem: GithubFileHash | null | undefined = null;

  if (selfTree && parentTree) {
    currentItem = [...selfTree, ...parentTree].find((treeItem) => treeItem.path === lastPathSegment);
  }

  let tree = selfTree;
  if (currentItem?.type === 'file') {
    tree = parentTree;
  }

  const reportUrl = `${basePath}/${commonData.organization.sluglified_name}/${commonData.team.sluglified_name}/${report.name}`;

  let paths = (path as string).split('/');
  // dont show the filename in these breadcrumbs - not enough space
  if (currentItem?.type === 'file') {
    paths = paths.slice(0, -1);
  }

  let crumbs = paths
    .filter((p) => p !== '')
    .map((p, index) => {
      return { path: p, href: `${reportUrl}/${paths.slice(0, index + 1).join('/')}${version ? `?version=${version}` : ``}` };
    });

  crumbs = [{ path: report.name, href: reportUrl }, ...crumbs];

  const getNewPath = (item?: GithubFileHash): string => {
    // if item is undefined it means go up
    let newUrl = ``;
    // lets go up
    if (!item) {
      // only inside one folder going to top level, lets remove path from query
      if (currentPath.split('/').length === 1) {
        newUrl = reportUrl;
      }
      if (currentPath.split('/').length > 1) {
        // inside deeper folder, remove last folder from path only
        const existingPathIsFile = extname(lastPathSegment!) !== '';
        const sliceIndex = existingPathIsFile ? 2 : 1;
        newUrl = `${reportUrl}/${currentPath.split('/').slice(0, -sliceIndex).join('/')}`;
      }
    }

    // default case normal folder link
    const isFile = item?.type === 'file';
    const existingPathIsFile = currentItem?.type === 'file';

    if (!isFile) {
      if (existingPathIsFile) {
        const dirPath = currentPath.split('/').slice(0, -1).join('/');
        const newPath: string | null = `${dirPath ? `${dirPath}/` : ''}${item?.path}`;
        newUrl = `${reportUrl}/${newPath}`;
      }

      const newPath: string | null = `${currentPath ? `${currentPath}/` : ''}${item?.path}`;
      newUrl = `${reportUrl}/${newPath}`;
    }

    if (isFile) {
      if (item?.path === lastPathSegment) {
        // do nothing since its a re-click
        newUrl = `#`;
      } else if (!existingPathIsFile) {
        // its currently on a folder
        const newPath: string | null = `${currentItem ? `${currentPath}/` : ''}${item?.path}`;
        newUrl = `${reportUrl}/${newPath}`;
      } else {
        // its currently on a file
        const dirPath = currentPath.split('/').slice(0, -1).join('/');
        const newPath: string | null = `${dirPath ? `${dirPath}/` : ''}${item?.path}`;
        newUrl = `${reportUrl}/${newPath}`;
      }
    }

    if (version) {
      newUrl = `${newUrl}?version=${version}`;
    }

    return newUrl;
  };

  return (
    <div className="p-2 flex flex-col space-y-2">
      <div className="px-2 flex flex-col space-y-2">
        <h3 className=" text-xs font-semibold text-gray-500 uppercase tracking-wider" id="projects-headline">
          Files
        </h3>
        {crumbs && crumbs.length > 0 && (
          <div className={classNames('flex items-center whitespace-nowrap')}>
            {crumbs.map((crumb, index) => (
              <div key={`${crumb.href}+${index}`} className="flex flex-row items-center">
                <a
                  key={`${crumb.href}+${index}`}
                  href={crumb.href}
                  className={classNames('hover:underline text-sm', index + 1 === crumbs.length ? 'font-normal text-gray-400' : 'font-medium text-indigo-500')}
                >
                  {crumb.path}
                </a>
                <svg className="shrink-0 h-3 w-3 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              </div>
            ))}
          </div>
        )}

        <a href={getNewPath()} className={classNames('text-sm items-center', currentPath ? 'text-gray-400 hover:underline cursor-pointer' : 'text-gray-200 cursor-default')}>
          <div className={classNames('group flex min-h-[24px] items-center', '')}>
            <ChevronLeftIcon className="h-6 w-6 mr-1" />
            <span>back</span>
          </div>
        </a>
      </div>

      <div>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {tree?.map((item: any) => (
          <PureTreeItem key={item.path} treeItem={item} current={lastPathSegment === item.path} isMainFile={item.path === report.main_file} href={getNewPath(item)} />
        ))}
      </div>
    </div>
  );
};

export default PureTree;
