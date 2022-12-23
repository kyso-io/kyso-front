import { CheckCircleIcon, ChevronDoubleRightIcon } from '@heroicons/react/solid';
import React from 'react';
import { ProgressBar } from 'primereact/progressbar';

interface Props {
  setValue: (value: string) => void;
}

const UnPureCheckListTour = (props: Props) => {
  const { setValue } = props;

  return (
    <div className="space-y-5 py-8">
      {/* <legend className="sr-only">Notifications</legend> */}
      <h2 className="text-xl font-medium text-gray-900 sm:pr-12 px-6">Welcome on board!</h2>
      <span className="text-gray-500 pt-2 px-6">Here is your Onboard checklist</span>
      <div className="px-8 pb-10">
        <ProgressBar value={10} style={{ height: '15px', fontSize: '10px' }} color="#0c9f6e" />
      </div>

      <div
        className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3"
        onClick={() => {
          setValue('comments');
        }}
      >
        <div className="flex h-5 items-center w-8">
          {/* <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " /> */}
          <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">Comments div</label>
          <p className="text-gray-500">Get notified when someones posts a comment on a posting.</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>

      <div className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3" onClick={() => setValue('offers')}>
        <div className="flex h-5 items-center w-8">
          {/* <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " /> */}
          <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">Offers</label>
          <p className="text-gray-500">Get notified when a candidate accepts or rejects an offer.</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>

      <div className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3" onClick={() => setValue('comments')}>
        <div className="flex h-5 items-center w-8">
          <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />
          {/* <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> */}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">Comments</label>
          <p className="text-gray-500">Get notified when someones posts a comment on a posting.</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>

      <div className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3" onClick={() => setValue('candidates')}>
        <div className="flex h-5 items-center w-8">
          <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />
          {/* <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> */}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">Candidates</label>
          <p className="text-gray-500">Get notified when a candidate applies for a job.</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default UnPureCheckListTour;
