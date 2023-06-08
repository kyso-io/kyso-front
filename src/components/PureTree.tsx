import PureTreeItem from '@/components/PureTreeItem';
import classNames from '@/helpers/class-names';
import type { CommonData } from '@/types/common-data';
import type { FileToRender } from '@/types/file-to-render';
import { ChevronLeftIcon } from '@heroicons/react/solid';
import type { GithubFileHash, File as KysoFile, ReportDTO } from '@kyso-io/kyso-model';
import Link from 'next/link';
import { useMemo } from 'react';
import { Helper } from '../helpers/Helper';

type IPureTree = {
  path: string;
  basePath: string;
  commonData: CommonData;
  report: ReportDTO;
  version: string;
  selfTree: GithubFileHash[];
  reportFiles: KysoFile[];
  selectedFile?: FileToRender;
  onNavigation?: (e: React.MouseEvent<HTMLElement>) => void;
};

const PureTree = (props: IPureTree) => {
  const { path, basePath, version, commonData, report, selfTree, onNavigation, selectedFile, reportFiles } = props;

  const backHref: string = useMemo(() => {
    const pathParts: string[] = path.split('/');
    if (pathParts.length === 0) {
      return '';
    }
    if (pathParts.length === 1) {
      return `${basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report.name}${version ? `?version=${version}` : ``}`;
    }
    const tmpParts: string[] = path.split('/');
    tmpParts.pop();
    const st: GithubFileHash[] = Helper.getReportTree(reportFiles, tmpParts);
    if (st.length >= 1) {
      return `${basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report.name}/${tmpParts.join('/')}${version ? `?version=${version}` : ``}`;
    }
    return `${basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report.name}/${version ? `?version=${version}` : ``}`;
  }, [path, version, reportFiles]);

  let currentPath = '';
  if (path) {
    currentPath = (path as string) || '';
  }

  const lastPathSegment = currentPath.split('/').slice(-1)[0];

  let currentItem: GithubFileHash | null | undefined = null;

  if (selfTree) {
    currentItem = selfTree.find((treeItem) => treeItem.path === lastPathSegment);
  }

  const reportUrl = `${basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report.name}`;

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

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex flex-col space-y-2 w-full">
        {/* <h3 className=" text-xs font-semibold text-gray-500 uppercase tracking-wider" id="projects-headline">
          Files
        </h3> */}
        {
          /* Removed crumbs with && false */
          crumbs && crumbs.length > 0 && false && (
            <div className={classNames('w-full flex items-center whitespace-nowrap')}>
              {crumbs.map((crumb, index) => (
                <div key={`${crumb.href}+${index}`} className="flex flex-row items-center">
                  <Link href={crumb.href}>
                    <span className={classNames('hover:underline text-sm', index + 1 === crumbs.length ? 'font-normal text-gray-400' : 'font-medium text-indigo-500')} onClick={onNavigation}>
                      {crumb.path}
                    </span>
                  </Link>
                  <svg className="shrink-0 h-3 w-3 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                </div>
              ))}
            </div>
          )
        }

        <Link href={backHref}>
          <span
            className={classNames('text-sm items-center group flex min-h-[24px]', currentPath ? 'text-gray-400 hover:underline cursor-pointer' : 'text-gray-200 cursor-default')}
            onClick={onNavigation}
          >
            <ChevronLeftIcon className="h-6 w-6 mr-1" />
            back
          </span>
        </Link>
      </div>

      <div className="text-ellipsis overflow-hidden">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {selfTree.map((item: any) => (
          <PureTreeItem
            onNavigation={onNavigation}
            key={item.path}
            treeItem={item}
            isMainFile={item.id === report.main_file_id}
            href={`/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report.name}/${item.path}${version ? `?version=${version}` : ``}`}
            selectedFile={selectedFile}
          />
        ))}
      </div>
    </div>
  );
};

export default PureTree;
