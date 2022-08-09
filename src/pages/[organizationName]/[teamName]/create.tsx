import Cookies from 'universal-cookie';
import UnPureReportCreateTitle from '@/unpure-components/UnPureReportCreateTitle';
import UnPureReportCreateDescription from '@/unpure-components/UnPureReportCreateDescription';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/router';
import { PureSpinner } from '@/components/PureSpinner';
import type { CommonData } from '@/hooks/use-common-data';
import { useChannelMembers } from '@/hooks/use-channel-members';
import { useCommonData } from '@/hooks/use-common-data';
import PureTopTabs from '@/components/PureTopTabs';
import UnpureFileSystemToolbar from '@/unpure-components/UnpureCreateFile';
import UnpureCreateFileList from '@/unpure-components/UnpureCreateFileList';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import UnPureReportCreateReportInfo from '@/unpure-components/UnPureReportCreateReportInfo';
import debounce from 'lodash.debounce';
import UnpureMarkdownEditor from '@/unpure-components/UnpureMardownEditor';
import { CreationReportFileSystemObject } from '@/model/creation-report-file';
import Filesystem from '@/components/Filesystem';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KysoMarkdownRenderer = dynamic<any>(() => import('@kyso-io/kyso-webcomponents').then((mod) => mod.KysoMarkdownRenderer), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center p-7 w-full">
      <PureSpinner />
    </div>
  ),
});

const CreateReport = () => {
  useRedirectIfNoJWT();
  const router = useRouter();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });
  const cancelHref = `/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}`;

  const user: UserDTO = useUser();
  const channelMembers = useChannelMembers({ commonData });

  const cookies = new Cookies();

  const [newTitle, setTitle] = useState('');
  const [newDescription, setDescription] = useState('');
  const [draftStatus, setDraftStatus] = useState('');

  const tabs = [{ name: 'Write' }, { name: 'Preview' }];
  const [currentTab, onChangeTab] = useState('Write');
  
  const [selectedTags, setTags] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const tags = ['plotly', 'multiqc', 'python', 'data-science', 'rstudio', 'genetics', 'physics'];
  
  const mainfile: CreationReportFileSystemObject[] = [
    new CreationReportFileSystemObject('Readme.md', 'Readme.md' ,'Readme.md', 'file', '')
  ];

  const [readmeContent, setReadmeContent] = useState('');
  let [files, setFiles] = useState(mainfile);

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

  const setReadmeContentDelay = (_newReadmeContent: string) => {
    setReadmeContent(_newReadmeContent);
    setDraftStatus('Saving ...');
    delayedCallback('editorReadme', _newReadmeContent);
  };

  const addNewFile = (newFile: CreationReportFileSystemObject ) => {
    files.push(newFile)

    setFiles(files);
    setDraftStatus('Saving ...');
    delayedCallback('editorfile', files);
  };

  const cleanCookies = () => {
    cookies.set('editorTitle', '');
    cookies.set('editorDescription', '');
    cookies.set('editorAuthors', []);
    cookies.set('editorTags', []);
    cookies.set('editorReadme', '');
    cookies.set('editorfile', []);
    router.reload();
  };

  const delayedCallback = debounce(async (string, _newAuthors) => {
    cookies.set(string, _newAuthors);
    setDraftStatus('All changes saved in local storage');
  }, 1000);

  useEffect(() => {
    if (cookies.get('editorTitle')?.length > 0) {
      setTitle(cookies.get('editorTitle'));
    }
    if (cookies.get('editorDescription')?.length > 0) {
      setDescription(cookies.get('editorDescription'));
    }
    if (cookies.get('editorAuthors')?.length > 0) {
      setSelectedPeople(cookies.get('editorAuthors'));
    }
    if (cookies.get('editorTags')?.length > 0) {
      setTags(cookies.get('editorTags'));
    }

    if (cookies.get('editorReadme')?.length > 0) {
      setReadmeContent(cookies.get('editorReadme'));
    }
    if (cookies.get('editorfile')?.length > 0) {
      setFiles(cookies.get('editorfile'));
    }
  }, []);

  return (
    <>
      <div className="flex flex-row space-x-10 ">
        <div className="basis-1/6"></div>
        <div className="basis-5/6">
          <UnPureReportCreateTitle cleanCookies={cleanCookies} 
            title={newTitle} setTitle={setTitleDelay} draftStatus={draftStatus} />
          
          <UnPureReportCreateDescription description={newDescription} setDescription={setDescriptionDelay} />
          
          <div className="ml-3">
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
          <div className="text-sm rounded mt-6 ">
            <div className="flex min-h-12 border-b mx-10 ">
              <UnpureFileSystemToolbar
                onCreate={(newfile: CreationReportFileSystemObject) => {
                  addNewFile(newfile);
                }}
              />
            </div>
            {files.length > 0 && (
              <Filesystem 
                files={files}  
                onAddNewFile={(newFile: CreationReportFileSystemObject) => {
                  addNewFile(newFile)
                }}
                onRemoveFile={(newFile: CreationReportFileSystemObject) => {
                  console.log("HOla delete")
                  console.log(newFile)
                  const indexToRemove: number = files.findIndex(x => x.id === newFile.id);

                  if(indexToRemove != -1) {
                    files.splice(indexToRemove, 1); 
                  } else {
                    console.log("Nothing to remove");
                  }

                  setFiles(files);
                  setDraftStatus('Saving ...');
                  delayedCallback('editorfile', files);
                }}
              />
            )}
            
            {files.length > 0 &&
              files.map((file) => (
                <>
                  {file.id && (
                    <div key={file.id} className="flex min-h-12 mx-10 mt-2">
                      <UnpureCreateFileList
                        file={file}
                        onAddNewFile={(newFile: CreationReportFileSystemObject) => {
                          addNewFile(newFile)
                        }}
                        onRemoveFile={(newFile: CreationReportFileSystemObject) => {
                          console.log("HOla delete")
                          console.log(newFile)
                          const indexToRemove: number = files.findIndex(x => x.id === newFile.id);

                          if(indexToRemove != -1) {
                            files.splice(indexToRemove, 1); 
                          } else {
                            console.log("Nothing to remove");
                          }

                          setFiles(files);
                          setDraftStatus('Saving ...');
                          delayedCallback('editorfile', files);
                        }}
                        // setFileToRender={(file: string[]) => {
                        //   setFileToRender(file);
                        //   setReadmeContent(file?.text);
                        // }}
                      />
                    </div>
                  )}
                </>
              ))}
          </div>
        </div>
        <div className="basis-4/6">
          <PureTopTabs tabs={tabs} onChangeTab={onChangeTab} currentTab={currentTab} />
          <div className="mt-10">
            {currentTab === 'Write' && <UnpureMarkdownEditor setContent={setReadmeContentDelay} newContent={readmeContent} />}
            {currentTab === 'Preview' && (
              <div className="border-gray-400 ring-gray-400 p-3 border rounded-md shadow-sm ">
                <KysoMarkdownRenderer source={readmeContent} />
              </div>
            )}
          </div>
          <div className="mt-5 text-right">
            <a href={cancelHref}>
              <button
                type="reset"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </a>
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
  );
};

CreateReport.layout = KysoApplicationLayout;

export default CreateReport;
