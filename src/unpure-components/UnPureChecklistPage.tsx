import { CheckCircleIcon } from '@heroicons/react/solid';
import React from 'react';

interface Props {
  setValue: (value: string) => void;
  setOpen: () => void;
}

const UnPureCheckListPage = (props: Props) => {
  const { setValue, setOpen } = props;

  return (
    <div className="space-y-5 py-8">
      <div className="sm:pr-12 px-6 flex mb-3">
        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" aria-hidden="true" />
        <h2 className="text-xl font-medium text-gray-900 ">Well done, you got your first Search</h2>
      </div>
      <span className="text-gray-500 pt-2 px-6">Here is your Onboard checklist</span>

      <div className="text-sm w-96 px-6">
        <label className="font-medium text-gray-700">Comments div</label>
        <p className="text-gray-500">Get notified when someones posts a comment on a posting.</p>
      </div>
      <div className="flex justify-center pt-10">
        <button
          className="w-fit whitespace-nowrap p-3 font-medium text-white rounded bg-kyso-600 hover:bg-kyso-700 text-sm flex flex-row items-center focus:ring-0 focus:outline-none"
          onClick={() => {
            window.open('https://docs.kyso.io/search-and-discovery/how-to-search');
            setValue('');
            setOpen();
          }}
        >
          What to know more
        </button>
      </div>
    </div>
  );
};

export default UnPureCheckListPage;
