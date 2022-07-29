import Cookies from 'universal-cookie';
import UnpureReportCreateHeader from '@/unpure-components/UnPureReportCreateHeader';
import { useState } from 'react';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { useUser } from '@/hooks/use-user';
import type { UserDTO } from '@kyso-io/kyso-model';
import PureTopTabs from '@/components/PureTopTabs';
import UnpureMarkdownEditor from '@/unpure-components/UnpureMardownEditor';
import UnpureCreateFile from '@/unpure-components/UnpureCreateFile';
import UnpureCreateFileList from '@/unpure-components/UnpureCreateFileList';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';

const CreateReport = () => {
  useRedirectIfNoJWT();
  const user: UserDTO = useUser();

  const cookies = new Cookies();
  let cookieTitle = '';
  if (cookies.get('editorTitle')) {
    cookieTitle = cookies.get('editorTitle');
  }

  let cookieDescription = '';
  if (cookies.get('editorDescription')) {
    cookieDescription = cookies.get('editorDescription');
  }

  const [newTitle, setTitle] = useState(cookieTitle);
  const [stopTyping, setStop] = useState(false);
  const [newDescription, setDescription] = useState(cookieDescription);

  const tabs = [{ name: 'Write' }, { name: 'Preview' }];
  const [currentTab, onChangeTab] = useState('Write');

  return (
    <>
      <>
        <div className="flex flex-row space-x-10 ">
          <div className="flex flex-col h-screen w-[450px] space-y-6 truncate">
            <div className="text-sm rounded">
              <div className="flex min-h-12 border-b mr-10">
                <UnpureCreateFile />
              </div>
              <div className="flex min-h-12 mr-10 mt-2">
                <UnpureCreateFileList fileName={'fileName'} />
              </div>
            </div>
          </div>

          <div className="flex flex-col h-screen w-full space-y-6 pt-6 ">
            <div className="flex justify-between">
              <UnpureReportCreateHeader title={newTitle} description={newDescription} user={user} setTitle={setTitle} setDescription={setDescription} setStop={setStop} stopTyping={stopTyping} />
            </div>

            <div className="flex space-x-4">
              <div className="w-full">
                <PureTopTabs tabs={tabs} onChangeTab={onChangeTab} currentTab={currentTab} />
                <div className="mt-10">
                  <UnpureMarkdownEditor />
                </div>
                <div className="mt-5 text-right">
                  <button
                    type="reset"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
      ;
    </>
  );
};

CreateReport.layout = KysoApplicationLayout;

export default CreateReport;
