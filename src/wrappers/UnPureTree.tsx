import PureTreeItem from '@/components/PureTreeItem';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useRouter } from 'next/router';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import { useEffect } from 'react';
import { useFileToRender } from '@/hooks/use-file-to-render';
import classNames from '@/helpers/ClassNames';

type IUnPureTreeProps = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  tree: any;
  prefix: string;
};

const UnPureTree = (props: IUnPureTreeProps) => {
  const router = useRouter();
  const { tree, prefix } = props;
  const breadcrumbs: BreadcrumbItem[] = [];

  const commonData: CommonData = useCommonData();
  const report = useCommonReportData();

  const fileToRender = useFileToRender();

  // is it just a file page, not a directory
  const isOnlySelf = tree && tree.length === 1 && tree[0].path === router.query.path;

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

  return (
    <div className={classNames('bg-white border shadow', fileToRender ? 'rounded-t-lg' : 'rounded-lg')}>
      <div className="div-auto w-full">
        <div
        // className="border-b"
        >
          <div className="p-3 text-xs group flex items-center px-3 text-gray-600 justify-between">
            <div className="flex items-center space-x-0">
              {breadcrumbs.map((page, index) => (
                <div key={page.href}>
                  <div className="flex items-center">
                    <a href={page.href} className={'ml-0 text-sm text-slate-500 hover:text-slate-700'} aria-current={page.current ? 'page' : undefined}>
                      {page.name}
                    </a>
                    {index + 1 !== breadcrumbs.length && (
                      <svg className="shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="">
              {!isOnlySelf && (
                <button
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
                  {router.query.fbvisible ? 'Hide File Browser' : 'Show File Browser'}
                </button>
              )}
            </div>
          </div>
        </div>

        {router.query.fbvisible && !isOnlySelf && (
          <div className="divide-y border-t">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {tree?.map((item: any) => (
              <PureTreeItem key={item.path} treeItem={item} prefix={prefix} currentPath={router.query?.path as string} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnPureTree;
