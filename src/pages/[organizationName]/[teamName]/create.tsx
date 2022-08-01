import Cookies from 'universal-cookie';
import UnPureReportCreateTitle from '@/unpure-components/UnPureReportCreateTitle';
import UnPureReportCreateDescription from '@/unpure-components/UnPureReportCreateDescription';
import { useState } from 'react';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/router';
import type { CommonData } from '@/hooks/use-common-data';
import { useChannelMembers } from '@/hooks/use-channel-members';
import { useCommonData } from '@/hooks/use-common-data';
import type { UserDTO } from '@kyso-io/kyso-model';
import PureTopTabs from '@/components/PureTopTabs';
import UnpureMarkdownEditor from '@/unpure-components/UnpureMardownEditor';
import UnpureCreateFile from '@/unpure-components/UnpureCreateFile';
import UnpureCreateFileList from '@/unpure-components/UnpureCreateFileList';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import UnPureReportCreateReportInfo from '@/unpure-components/UnPureReportCreateReportInfo';
import debounce from 'lodash.debounce';

const CreateReport = () => {
  useRedirectIfNoJWT();
  const router = useRouter();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });

  const user: UserDTO = useUser();
  const channelMembers = useChannelMembers({ commonData });

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
  const [newDescription, setDescription] = useState(cookieDescription);
  const [draftStatus, setDraftStatus] = useState('');

  const tabs = [{ name: 'Write' }, { name: 'Preview' }];
  const [currentTab, onChangeTab] = useState('Write');

  const setTitleDelay = (_newTitle: string) => {
    setTitle(_newTitle);
    setDraftStatus('Saving ...');
    delayedCallbackTitle(_newTitle);
  };

  const delayedCallbackTitle = debounce(async (_newTitle) => {
    cookies.set('editorTitle', _newTitle);
    setDraftStatus('All changes saved in local storage');
  }, 1000);

  const setDescriptionDelay = (_newDescription: string) => {
    setDescription(_newDescription);
    setDraftStatus('Saving ...');
    delayedCallbackDescription(_newDescription);
  };

  const delayedCallbackDescription = debounce(async (_newDescription) => {
    cookies.set('editorDescription', _newDescription);
    setDraftStatus('All changes saved in local storage');
  }, 1000);

  const [selectedPerson, setSelectedPerson] = useState<string[]>([]);
  console.log('selectedPerson', selectedPerson);
  return (
    <>
      <>
        <div className="flex flex-row space-x-10 ">
          <div className="basis-1/6"></div>
          {/* 
          <div className="flex flex-col w-full space-y-6 pt-6"> */}
          <div className="basis-5/6">
            <div className="mb-4">
              <UnPureReportCreateTitle title={newTitle} setTitle={setTitleDelay} draftStatus={draftStatus} />
            </div>
            <div className="mb-4">
              <UnPureReportCreateDescription description={newDescription} setDescription={setDescriptionDelay} />
            </div>
            <div className="mb-6">
              <UnPureReportCreateReportInfo
                user={user}
                channelMembers={channelMembers}
                selectedPerson={selectedPerson}
                setSelectedPerson={(_selectedPerson: string[]) => setSelectedPerson(_selectedPerson)}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row space-x-10 ">
          <div className="basis-1/6">
            <div className="text-sm rounded mt-6">
              <div className="flex min-h-12 border-b mx-10">
                <UnpureCreateFile />
              </div>
              <div className="flex min-h-12 mx-10 mt-2">
                <UnpureCreateFileList fileName={'fileName'} />
              </div>
            </div>
          </div>
          <div className="basis-5/6">
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
      </>
    </>
  );
};

CreateReport.layout = KysoApplicationLayout;

export default CreateReport;
