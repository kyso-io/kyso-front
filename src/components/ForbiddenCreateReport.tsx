import { ExclamationCircleIcon } from '@heroicons/react/solid';
import type { CommonData } from '../types/common-data';

interface Props {
  commonData: CommonData;
}

export const ForbiddenCreateReport = ({ commonData }: Props) => {
  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-2/12"></div>
      <div className="rounded-md bg-yellow-50 p-4 mt-8">
        <div className="flex">
          <div className="shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Forbidden resource</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                You don&apos;t have permissions to create reports. Come back to
                <a href={commonData.team ? `/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}` : `/${commonData.organization?.sluglified_name}`} className="font-bold">
                  {' '}
                  {commonData.team ? commonData.team?.display_name : commonData.organization?.display_name}{' '}
                </a>
                page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
