import Cookies from 'universal-cookie';
import UnPureReportCreateTitle from '@/unpure-components/UnPureReportCreateTitle';
import UnPureReportCreateDescription from '@/unpure-components/UnPureReportCreateDescription';
import { useState, useEffect } from 'react';
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

  const [newTitle, setTitle] = useState('');
  const [newDescription, setDescription] = useState('');
  const [draftStatus, setDraftStatus] = useState('');

  const tabs = [{ name: 'Write' }, { name: 'Preview' }];
  const [currentTab, onChangeTab] = useState('Write');

  const d: string[] = [];
  const [selectedTags, setTags] = useState(d);
  const [selectedPeople, setSelectedPeople] = useState(d);
  const tags = ['plotly', 'multiqc', 'python', 'data-science', 'rstudio', 'genetics', 'physics'];

  // const [readmeContent, setReadmeContent] = useState('');

  const setTitleDelay = (_newTitle: string) => {
    setTitle(_newTitle);
    setDraftStatus('Saving ...');
    delayedCallback('editorTitle', _newTitle);
  };

  const setDescriptionDelay = (_newDescription: string) => {
    setDescription(_newDescription);
    setDraftStatus('Saving ...');
    delayedCallback('editorDescription', _newDescription);
  };

  const setAuthorsDelay = (_newAuthors: string[]) => {
    setSelectedPeople(_newAuthors);
    setDraftStatus('Saving ...');
    delayedCallback('editorAuthors', _newAuthors);
  };

  const setTagsDelay = (_newTags: string[]) => {
    setTags(_newTags);
    setDraftStatus('Saving ...');
    delayedCallback('editorTags', _newTags);
  };

  // const setReadmeContentDelay = (_newReadmeContent: string[]) => {
  //   setReadmeContent(_newReadmeContent);
  //   setDraftStatus('Saving ...');
  //   delayedCallback('editorReadme', _newReadmeContent);
  // };

  const delayedCallback = debounce(async (string, _newAuthors) => {
    cookies.set(string, _newAuthors);
    setDraftStatus('All changes saved in local storage');
  }, 1000);

  useEffect(() => {
    if (cookies.get('editorTitle')) {
      setTitle(cookies.get('editorTitle'));
    }
    if (cookies.get('editorDescription')) {
      setDescription(cookies.get('editorDescription'));
    }
    if (cookies.get('editorAuthors')) {
      setSelectedPeople(cookies.get('editorAuthors'));
    }
    if (cookies.get('editorTags')) {
      setTags(cookies.get('editorTags'));
    }
    // if (cookies.get('editorReadme')) {
    //   setReadmeContent(cookies.get('editorReadme'));
    // }
  }, []);

  return (
    <>
      <>
        <div className="flex flex-row space-x-10 ">
          <div className="basis-1/6"></div>
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
                selectedPeople={selectedPeople}
                setSelectedPeople={(_selectedPeople: string[]) => setAuthorsDelay(_selectedPeople)}
                selectedTags={selectedTags}
                tags={tags}
                onSetTags={(newTags: string[]) => {
                  setTagsDelay(newTags);
                }}
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
