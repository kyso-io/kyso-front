import { PureSpinner } from '@/components/PureSpinner';
import classNames from '@/helpers/class-names';
import { useAppDispatch } from '@/hooks/redux-hooks';
import type { FileToRender } from '@/hooks/use-file-to-render';
import type { CommonData } from '@/types/common-data';
import { Menu, Transition } from '@headlessui/react';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { QuestionMarkCircleIcon, StarIcon } from '@heroicons/react/solid';
import type { GithubFileHash, ReportDTO, UpdateReportRequestDTO } from '@kyso-io/kyso-model';
import { updateReportAction } from '@kyso-io/kyso-store';
import { Fragment, useState } from 'react';

interface Props {
  tree: GithubFileHash[];
  report: ReportDTO;
  fileToRender: FileToRender | null;
  commonData: CommonData;
  basePath: string;
  path: string;
  version: string;
}

const UnureFileHeader = (props: Props) => {
  const { tree, report, fileToRender, basePath, commonData, path, version } = props;

  const [isBusy, setIsBusy] = useState(false);
  const dispatch = useAppDispatch();

  const isMainFile = report?.main_file === fileToRender?.path;

  const paths = (path as string).split('/');
  // // dont show the filename in these breadcrumbs - not enough space
  // if (currentItem?.type === 'file') {
  //   paths = paths.slice(0, -1);
  // }
  const reportUrl = `${basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report.name}`;
  const crumbs = paths
    .filter((p) => p !== '')
    .map((p, index) => {
      return { path: p, href: `${reportUrl}/${paths.slice(0, index + 1).join('/')}${version ? `?version=${version}` : ``}` };
    });

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

  return (
    <div className="w-full border-y">
      <div className="text-xs text-gray-800">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center space-x-0 ml-3">
            {crumbs.map((crumb, index) => (
              <div key={`${crumb.href}+${index}`}>
                <div className={classNames('flex items-center')}>
                  <a href={crumb.href} className={classNames('hover:underline ml-0 text-sm', index + 1 === crumbs.length ? 'font-normal text-gray-500' : 'font-medium text-indigo-700')}>
                    {crumb.path}
                  </a>
                  {index + 1 !== crumbs.length && (
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
