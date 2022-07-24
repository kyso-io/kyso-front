import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useRouter } from 'next/router';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import { Fragment, useState } from 'react';
import { useFileToRender } from '@/hooks/use-file-to-render';
import classNames from '@/helpers/class-names';
import { QuestionMarkCircleIcon, StarIcon } from '@heroicons/react/solid';
import { updateReportAction } from '@kyso-io/kyso-store';
import { useAppDispatch } from '@/hooks/redux-hooks';
import type { GithubFileHash, UpdateReportRequestDTO } from '@kyso-io/kyso-model';
import { useTree } from '@/hooks/use-tree';
import { Menu, Transition } from '@headlessui/react';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { PureSpinner } from '@/components/PureSpinner';

const UnureFileHeader = () => {
  const router = useRouter();

  const tree: GithubFileHash[] = useTree({
    path: router.query.path as string,
  });
  const breadcrumbs: BreadcrumbItem[] = [];
  const commonData: CommonData = useCommonData();
  const report = useCommonReportData();
  const [isBusy, setIsBusy] = useState(false);
  const dispatch = useAppDispatch();

  let currentPath = '';
  if (router.query.path) {
    currentPath = (router.query.path as string) || '';
  }

  const fileToRender = useFileToRender({
    path: currentPath,
  });

  const isMainFile = report?.main_file === fileToRender?.path;

  if (report) {
    breadcrumbs.push(new BreadcrumbItem(report?.name, `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`, false));
  }

  if (router.query.path) {
    const paths = (router.query.path as string).split('/');
    const littleCrumbs = paths.map((path, index) => {
      let url = `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}?`;
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

  if (fileToRender && !router.query.path) {
    // this means its a readme or other index file
    breadcrumbs.push(new BreadcrumbItem(fileToRender.path, `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`, false));
  }

  // TODO
  const setMainFile = async () => {
    setIsBusy(true);
    console.log({ main_file: tree && tree.length >= 1 && tree[0]!.path });
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

  return (
    <div>
      <div className="text-xs border text-gray-800 bg-gray-100 rounded-t ">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center space-x-0 ml-3">
            {breadcrumbs.map((page, index) => (
              <div key={`${page.href}+${index}`}>
                <div className={classNames('flex items-center')}>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      const url = new URL(page.href, 'https://kyso.io');
                      router.replace({ query: { ...router.query, path: url.searchParams.get('path') } });
                    }}
                    href={page.href}
                    className={classNames('hover:underline ml-0 text-sm', index + 1 === breadcrumbs.length ? 'font-normal text-gray-500' : 'font-medium text-indigo-500')}
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
          <div className="flex items-center px-2 space-x-2">
            {fileToRender && !isMainFile && (
              <button
                type="button"
                onClick={() => {
                  setMainFile();
                }}
                className="inline-flex w-38 items-center px-3 py-2 border rounded text-xs font-medium text-slate-700 hover:bg-slate-200 focus:outline-none"
              >
                {isBusy ? <PureSpinner size={5} /> : <StarIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />}
                Set as main file
              </button>
            )}
            {fileToRender && isMainFile && (
              <div className="inline-flex pr-2 items-center py-2 rounded text-xs font-medium text-slate-500">
                <Menu as="div" className="relative w-fit inline-block text-left">
                  <Menu.Button className="hover:bg-gray-100 p-2 text-xs flex items-center w-fit rounded text-left font-normal hover:outline-none">
                    This is the main file
                    <QuestionMarkCircleIcon className="shrink-0 ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-100" aria-hidden="true" />
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="z-50 origin-center absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-slate-200 ring-opacity/5 divide-y divide-gray-100 focus:outline-none">
                      <div className="prose prose-sm p-3 font-normal font-xs">The main file is the first file shown to your readers. Typically a Readme with table of contents.</div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            )}
            {fileToRender?.path.endsWith('.html') && fileToRender && (
              <a href={`${'/scs'}${fileToRender.path_scs}`} className="block" target="_blank" rel="noreferrer">
                <button className="inline-flex w-38 items-center px-3 py-2 border hover:bg-slate-200  rounded text-xs font-medium text-slate-500">
                  {/* <ArrowsExpandIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" /> */}
                  Open in Full screen
                  <ExternalLinkIcon className="ml-1 h-4 w-4" aria-hidden="true" />
                </button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnureFileHeader;
