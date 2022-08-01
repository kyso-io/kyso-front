import format from 'date-fns/format';
import type { UserDTO } from '@kyso-io/kyso-model';
import { PureAvatar } from '@/components/PureAvatar';
import UnpureSuggestContentDropdown from './UnPureSuggestContentDropdown';

type UnpureReportCreateHeaderProps = {
  user: UserDTO;
  title: string | '';
  description: string | '';
  setTitle: (newTitle: string) => void;
  setDescription: (newDescription: string) => void;
  setStop: (_stopTyping: boolean) => void;
  stopTyping: boolean | false;
  cacheStatus: string | 'saved';
};

const UnpureReportCreateHeader = (props: UnpureReportCreateHeaderProps) => {
  const { title = null, description = null, user, setTitle, setStop, setDescription, cacheStatus } = props;

  return (
    <>
      <div className="prose-sm">
        <div className="mb-2 inline-flex items-center">
          <input
            type="text"
            value={title || ''}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            onBlur={() => {
              setStop(true);
            }}
            placeholder="Title"
            className="
            focus:shadow-sm
            focus:ring-indigo-500
            focus:border-indigo-500 
            block 
            w-full
            pr-2
            border-white
            border-0
            rounded-md
            text-3xl
            font-medium
            focus:text-gray-500
            text-gray-900
          "
          />
          <span className="text-sm w-10 ml-3 font-medium text-gray-400 group-hover:text-gray-600"> v: 1 </span>
          <h2 className="ml-10">{cacheStatus}</h2>
        </div>
        <input
          type="text"
          value={description || ''}
          placeholder="Description"
          onChange={(e) => {
            // setBusy(false);
            setDescription(e.target.value);
          }}
          className="
          focus:shadow-sm
        focus:ring-indigo-500
        focus:border-indigo-500 
          block 
          w-full
          pr-2
          focus:w-full 
        border-white
          border-0
        text-gray-500
          sm:text-sm
          rounded-md"
        />
        <div className="prose prose-sm mt-2 ml-2 flex items-center text-gray-500 font-light space-x-2">
          <div className="flex">
            <div key={user?.display_name} className="shrink-0 group block">
              <div className="flex items-center">
                <div>
                  <PureAvatar avatarUrl={user?.avatar_url} defaultName={user?.display_name} />
                </div>
                <div className="mx-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{user?.display_name}</p>
                </div>

                <UnpureSuggestContentDropdown label={'Add authors'} />

                <div className="ml-5">
                  Created:
                  <span className="text-gray-800 ml-1 mr-5">{format(new Date(), 'MMM dd, yyyy')}.</span>
                  Last update on:
                  <span className="text-gray-800 ml-1 mr-5">{format(new Date(), 'MMM dd, yyyy')}.</span>
                </div>
                <span className="inline-flex rounded-full items-center py-0.5 pl-2.5 pr-1 ml-5 mr-3 text-sm font-medium bg-indigo-100 text-indigo-700">
                  Tag
                  <button
                    type="button"
                    className="shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                  >
                    <span className="sr-only">Remove large option</span>
                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                      <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                    </svg>
                  </button>
                </span>
                <UnpureSuggestContentDropdown label={'Add tags'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnpureReportCreateHeader;
