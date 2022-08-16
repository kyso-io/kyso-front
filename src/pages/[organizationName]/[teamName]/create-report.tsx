import type { TeamMember, NormalizedResponseDTO, KysoConfigFile, ReportDTO } from '@kyso-io/kyso-model';
import { ReportType } from '@kyso-io/kyso-model';
import { useState, useEffect, useMemo, Fragment } from 'react';
import dynamic from 'next/dynamic';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { useRouter } from 'next/router';
import type { CommonData } from '@/hooks/use-common-data';
import { useChannelMembers } from '@/hooks/use-channel-members';
import { useCommonData } from '@/hooks/use-common-data';
import UnpureFileSystemToolbar from '@/unpure-components/UnpureCreateFile';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import debounce from 'lodash.debounce';
import JSZip from 'jszip';
import FormData from 'form-data';
/// import UnpureMarkdownEditor from '@/unpure-components/UnpureMardownEditor';
import { CreationReportFileSystemObject } from '@/model/creation-report-file';
import Filesystem from '@/components/Filesystem';
import { FilesystemItem } from '@/model/filesystem-item.model';

import 'easymde/dist/easymde.min.css';
import { PureSpinner } from '@/components/PureSpinner';
import { Api } from '@kyso-io/kyso-store';
import { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import checkPermissions from '@/helpers/check-permissions';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import classNames from '@/helpers/class-names';
import { Menu, Transition } from '@headlessui/react';
import { ArrowRightIcon, SelectorIcon } from '@heroicons/react/solid';
import MemberFilterSelector from '@/components/MemberFilterSelector';
import TagsFilterSelector from '@/components/TagsFilterSelector';

// import SimpleMDE from "react-simplemde-editor";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* const KysoMarkdownRenderer = dynamic<any>(() => import('@kyso-io/kyso-webcomponents').then((mod) => mod.KysoMarkdownRenderer), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center p-7 w-full">
      <PureSpinner />
    </div>
  ),
}); */

const token: string | null = getLocalStorageItem('jwt');

const CreateReport = () => {
  useRedirectIfNoJWT();
  const router = useRouter();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });

  const channelSelectorItems: BreadcrumbItem[] = [];

  if (commonData.permissions && commonData.permissions.teams) {
    commonData
      .permissions!.teams.filter((team) => team.organization_id === commonData.organization?.id)
      .forEach((team) => {
        channelSelectorItems.push(
          new BreadcrumbItem(team.display_name, `${router.basePath}/${commonData.organization?.sluglified_name}/${team.name}/create-report`, commonData.team?.sluglified_name === team.name),
        );
      });
  }

  const channelMembers = useChannelMembers({ commonData });

  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const [hasAnythingCached, setHasAnythingCached] = useState(false);
  const [description, setDescription] = useState('');
  const [draftStatus, setDraftStatus] = useState('');

  // const tabs = [{ name: 'Write' }, { name: 'Preview' }];
  // const [currentTab, onChangeTab] = useState('Write');

  const [selectedTags, setTags] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState<TeamMember[]>([]);
  const tags = ['plotly', 'multiqc', 'python', 'data-science', 'rstudio', 'genetics', 'physics'];

  const mainfile: CreationReportFileSystemObject[] = [new CreationReportFileSystemObject('Readme.md', 'Readme.md', 'Readme.md', 'file', '')];

  const [selectedFile, setSelectedFile] = useState<FilesystemItem>(new FilesystemItem(mainfile[0]!, [], 1));
  const [files, setFiles] = useState<CreationReportFileSystemObject[]>(mainfile);

  const hasPermissionCreateReport = useMemo(() => checkPermissions(commonData, 'KYSO_IO_CREATE_REPORT'), [commonData]);

  const cleanStorage = () => {
    removeLocalStorageItem('formTitle');
    removeLocalStorageItem('formDescription');
    removeLocalStorageItem('formSelectedPeople');
    removeLocalStorageItem('formTags');
    removeLocalStorageItem('formFileValues');
    removeLocalStorageItem('formFile');
    router.reload();
  };

  useEffect(() => {
    if (getLocalStorageItem('formTitle')) {
      setTitle(JSON.parse(getLocalStorageItem('formTitle')!));
      setHasAnythingCached(true);
    }
    if (getLocalStorageItem('formDescription')) {
      setDescription(JSON.parse(getLocalStorageItem('formDescription')!));
      setHasAnythingCached(true);
    }
    if (getLocalStorageItem('formSelectedPeople')) {
      setSelectedPeople(JSON.parse(getLocalStorageItem('formSelectedPeople')!));
      setHasAnythingCached(true);
    }
    if (getLocalStorageItem('formTags')) {
      setTags(JSON.parse(getLocalStorageItem('formTags')!));
      setHasAnythingCached(true);
    }

    if (getLocalStorageItem('formFile')) {
      setFiles(JSON.parse(getLocalStorageItem('formFile')!));
      setHasAnythingCached(true);
    }
  }, []);

  const setTitleDelay = (_title: string) => {
    setTitle(_title);
    setDraftStatus('Saving ...');
    delayedCallback('formTitle', _title);
  };

  const setDescriptionDelay = (_description: string) => {
    setDescription(_description);
    setDraftStatus('Saving ...');
    delayedCallback('formDescription', _description);
  };

  const setSelectedPeopleDelay = (newSelectedPeople: TeamMember[]) => {
    setSelectedPeople(newSelectedPeople as TeamMember[]);
    setDraftStatus('Saving ...');
    delayedCallback('formSelectedPeople', newSelectedPeople);
  };

  const setTagsDelay = (_newTags: string[]) => {
    // That's wrong, DOUBLE CHECK
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setTags(_newTags as any);
    setDraftStatus('Saving ...');
    delayedCallback('formTags', _newTags);
  };

  const addNewFile = (newFile: CreationReportFileSystemObject) => {
    files.push(newFile);

    setFiles([...files]);
    setDraftStatus('Saving ...');
    delayedCallback('formFile', files);
  };

  const delayedCallback = debounce(async (key, value) => {
    setLocalStorageItem(key, JSON.stringify(value));
    setDraftStatus('All changes saved in local storage');
  }, 1000);

  const KSimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

  const handleEditorChange = (fileId: string, value: string) => {
    setLocalStorageItem(fileId, value);
  };

  const retrieveSelectedFileContentFromCookies = (fileId: string): string => {
    return getLocalStorageItem(fileId) || '';
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);

    if (!title || title.trim().length === 0) {
      setError('Title is required.');
      return;
    }

    if (!commonData.team) {
      setError('Please select a channel.');
      return;
    }

    setBusy(true);

    const api: Api = new Api(token);

    // try {
    //   const exists: boolean = await api.reportExists(commonData.team.id as string, title);

    //   if (exists) {
    //     setError("Report with this name already exists.");
    //     setBusy(false);
    //     return;
    //   }
    // } catch (er: any) {
    //   setError(er.message);
    //   setBusy(false);
    //   return;
    // }

    const zip = new JSZip();
    const kysoConfigFile: KysoConfigFile = {
      main: '',
      title,
      description,
      organization: commonData.organization.sluglified_name,
      team: commonData.team.sluglified_name,
      tags,
      type: ReportType.Markdown,
      authors: selectedPeople.map((person) => person.email),
    };

    const blobKysoConfigFile: Blob = new Blob([JSON.stringify(kysoConfigFile, null, 2)], { type: 'plain/text' });
    zip.file('kyso.json', blobKysoConfigFile);
    for (const file of files) {
      zip.file(file.name, getLocalStorageItem(file.id) as string | Blob);
    }
    const blobZip = await zip.generateAsync({ type: 'blob' });
    const formData = new FormData();
    formData.append('file', blobZip);

    // Necessary to check permissions
    api.setOrganizationSlug(commonData.organization.sluglified_name);
    api.setTeamSlug(commonData.team.sluglified_name);
    const newReport: NormalizedResponseDTO<ReportDTO> = await api.createUiReport(formData);

    console.log(newReport);
  };

  return (
    <div>
      <div className="flex flex-row items-center">
        <div className="w-1/6"></div>
        <div className="w-4/6">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center justify-between">
              <div className="mr-2">posting into</div>
              <Menu as="div" className="relative w-fit inline-block text-left">
                <Menu.Button className="hover:bg-gray-100 border-y border p-2 flex items-center w-fit text-sm text-left font-medium text-gray-700 hover:outline-none rounded">
                  {commonData.team ? commonData.team.display_name : 'Select a channel'}
                  <div className="pl-2">
                    <SelectorIcon className="shrink-0 h-5 w-5 text-gray-700 group-hover:text-gray-500" aria-hidden="true" />
                  </div>
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className=" z-50 origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-slate-200 ring-opacity/5 divide-y divide-gray-100 focus:outline-none">
                    <div className="p-2">
                      <div>
                        <h3 className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" id="projects-headline">
                          Channels
                        </h3>
                        <div className="flex flex-col justify-start">
                          {channelSelectorItems &&
                            channelSelectorItems.map((item: BreadcrumbItem) => (
                              <a
                                key={item.href}
                                href={item.href}
                                className={classNames(
                                  item.current ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                  'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                                )}
                              >
                                {item.name}
                              </a>
                            ))}
                        </div>
                      </div>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row items-center space-x-2">
                <TagsFilterSelector label={'Add Tags'} initial={tags} selected={selectedTags} setSelected={(newTags: string[]) => setTagsDelay(newTags)} />

                <MemberFilterSelector
                  label={'Add authors'}
                  initial={channelMembers}
                  selected={selectedPeople}
                  setSelected={(newSelectedPeople: TeamMember[]) => setSelectedPeopleDelay(newSelectedPeople)}
                />

                {hasAnythingCached && (
                  <button
                    type="reset"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={cleanStorage}
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Post <ArrowRightIcon className="ml-2 w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-row justify-end mt-2">{draftStatus && <h6 className="text-gray-500 text-xs">{draftStatus}</h6>}</div>
              {/* <PureAvatar src={user?.avatar_url} title={user?.display_name} /> */}
              {/* <p className="mx-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">{user?.display_name}</p> */}
            </div>
          </div>

          {commonData.team && !hasPermissionCreateReport && <div className="ml-3 mb-2 text-xs text-red-500">Sorry, you do not have permission to post into this channel, please select another.</div>}

          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              <textarea
                style={{
                  height: '55px',
                  border: 'none',
                  resize: 'none',
                  outline: 'none',
                  overflow: 'auto',
                  WebkitBoxShadow: 'none',
                  boxShadow: 'none',
                }}
                value={title || ''}
                onChange={(e) => {
                  setTitleDelay(e.target.value);
                }}
                placeholder="Title"
                className="p-0 focus:shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-white border-0 rounded-md text-3xl font-medium focus:text-gray-500 text-gray-900"
              />
              <textarea
                style={{
                  height: '55px',
                  border: 'none',
                  resize: 'none',
                  outline: 'none',
                  overflow: 'auto',
                  WebkitBoxShadow: 'none',
                  boxShadow: 'none',
                }}
                value={description || ''}
                placeholder="Description"
                onChange={(e) => {
                  setDescriptionDelay(e.target.value);
                }}
                className="p-0 focus:shadow-sm focus:ring-indigo-500 focus:border-indigo-500  block  w-full h-full focus:w-full  border-white border-0 text-gray-500 sm:text-sm rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="w-1/6 px-2">
          <div className="text-sm rounded">
            <div className="flex min-h-12 border-b">
              <UnpureFileSystemToolbar
                onCreate={(newfile: CreationReportFileSystemObject) => {
                  addNewFile(newfile);
                }}
              />
            </div>
            {files && files.length > 0 && (
              <Filesystem
                files={files}
                selectedFileId={selectedFile.file.id}
                onAddNewFile={(newFile: CreationReportFileSystemObject) => {
                  addNewFile(newFile);
                }}
                onRemoveFile={(newFile: CreationReportFileSystemObject) => {
                  const newFiles = files.filter((x) => x.id !== newFile.id && x.parentId !== newFile.id);
                  setFiles(newFiles);
                  setDraftStatus('Saving ...');
                  delayedCallback('formFile', newFiles);
                }}
                onSelectedFile={(sFile: FilesystemItem) => {
                  setSelectedFile(sFile);
                }}
              />
            )}
          </div>
        </div>
        <div className="w-4/6">
          <KSimpleMDE
            value={retrieveSelectedFileContentFromCookies(selectedFile?.file.id!)}
            options={{
              autofocus: false,
              spellChecker: false,
              hideIcons: ['side-by-side', 'fullscreen'],
            }}
            onChange={(value) => handleEditorChange(selectedFile?.file.id!, value)}
          />
          <div className="text-right">
            {error}
            {busy && <PureSpinner size={5} />}
          </div>
        </div>
      </div>
    </div>
  );
};

CreateReport.layout = KysoApplicationLayout;

export default CreateReport;
