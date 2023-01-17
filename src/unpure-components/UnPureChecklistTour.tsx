import { CheckCircleIcon, ChevronDoubleRightIcon, XCircleIcon } from '@heroicons/react/solid';
import React from 'react';
import { ProgressBar } from 'primereact/progressbar';

interface Props {
  setValue: (value: string) => void;
}

const UnPureCheckListTour = (props: Props) => {
  const { setValue } = props;
  const progress = 100;
  return (
    <div className="space-y-5 pt-8">
      {/* <legend className="sr-only">Notifications</legend> */}
      <h2 className="text-xl font-medium text-gray-900 sm:pr-12 px-6 flex">
        {progress !== 100 && 'Welcome on board!'}
        {progress === 100 && (
          <>
            You completed the onboarding process!
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-indigo-500 ml-3">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
              />
            </svg>
          </>
        )}
      </h2>
      <span className="text-gray-500 pt-2 px-6">Here is your Onboard checklist</span>
      <div className="px-8 pb-10">
        <ProgressBar value={progress} style={{ height: '15px', fontSize: '10px' }} color="#0c9f6e" />
      </div>

      <div
        className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3"
        onClick={() => {
          setValue('signup');
        }}
      >
        <div className="flex h-5 items-center w-8">
          {/* <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " /> */}
          <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">Sign up to Kyso.</label>
          <p className="text-gray-500">Know more about how others see you.</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>

      <div className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3" onClick={() => setValue('publish')}>
        <div className="flex h-5 items-center w-8">
          {/* <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " /> */}
          <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">Publish existant work.</label>
          <p className="text-gray-500">Publish and share your analysis to anyone in your organization.</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>

      <div className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3" onClick={() => setValue('read')}>
        <div className="flex h-5 items-center w-8">
          <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />
          {/* <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> */}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">Read a report.</label>
          <p className="text-gray-500">Find understandable results on some of the Kyso report examples.</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>

      <div className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3" onClick={() => setValue('search')}>
        <div className="flex h-5 items-center w-8">
          <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />
          {/* <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> */}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">Search and discover.</label>
          <p className="text-gray-500">Find, navegate and stay up to date on the existing set of work on a topic.</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>
      <div className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3" onClick={() => setValue('cli')}>
        <div className="flex h-5 items-center w-8">
          <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />
          {/* <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> */}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">Complete installation.</label>
          <p className="text-gray-500">Get the most from Kyso CLI. Clone, publish, update, edit and much more.</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>
      <div className="border-t">
        <div className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3" onClick={() => setValue('cli')}>
          <div className="flex h-5 items-center w-8">
            <XCircleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
          </div>
          <div className="ml-3 text-sm w-96">
            <label className="font-medium text-gray-700">Finish and remove.</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnPureCheckListTour;
