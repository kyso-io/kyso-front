import format from 'date-fns/format';
import type { UserDTO } from '@kyso-io/kyso-model';
import UnPureSuggestContentDropdown from './UnPureSuggestContentDropdown';

type UnPureReportCreateHeaderProps = {
  user: UserDTO;
  title?: string;
  description?: string;
  setTitle: (newTitle: string) => void;
  setDescription: (newDescription: string) => void;
  setStop: (_stopTyping: boolean) => void;
  stopTyping: boolean | false;
  // suggestions: { id: number; name: string; imageUrl: string }[];
  // isDraftSaved: string | 'false';
};

const UnPureReportCreateHeader = (props: UnPureReportCreateHeaderProps) => {
  const { title = null, description = null, user } = props;
  // const { title = null, description = null, user, setTitle, setDescription, setStop, stopTyping, isDraftSaved } = props;
  return (
    <>
      <div className="prose-sm">
        <h1 className="m-0 mb-2">
          title{title}
          <span className="text-sm ml-3 font-medium text-gray-400 group-hover:text-gray-600"> v: 1 </span>
        </h1>
        <p>description {description}</p>
        <div className="prose prose-sm flex items-center text-gray-500 font-light space-x-2">
          <div className="flex">
            <div key={user?.display_name} className="shrink-0 group block">
              <div className="flex items-center">
                <div>
                  <img className="m-0 inline-block h-9 w-9 rounded-full" src={user?.avatar_url} alt="" />
                </div>
                <div className="mx-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{user?.display_name}</p>
                </div>

                <UnPureSuggestContentDropdown label={'Add authors'} />

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
                <UnPureSuggestContentDropdown label={'Add tags'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnPureReportCreateHeader;
