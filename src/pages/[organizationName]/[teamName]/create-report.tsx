import checkPermissions from '@/helpers/check-permissions';
import classNames from '@/helpers/class-names';
import { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import { useChannelMembers } from '@/hooks/use-channel-members';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import { CreationReportFileSystemObject } from '@/model/creation-report-file';
import { FilesystemItem } from '@/model/filesystem-item.model';
import type { CommonData } from '@/types/common-data';
import type { Tag, KysoConfigFile, NormalizedResponseDTO, ReportDTO, TeamMember } from '@kyso-io/kyso-model';
import { ReportPermissionsEnum, ReportType } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import FormData from 'form-data';
import JSZip from 'jszip';
import debounce from 'lodash.debounce';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import type { ChangeEvent } from 'react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import ErrorNotification from '@/components/ErrorNotification';
import Filesystem from '@/components/Filesystem';
import MemberFilterSelector from '@/components/MemberFilterSelector';
import NewReportNamingDropdown from '@/components/NewReportNamingDropdown';
import { PureSpinner } from '@/components/PureSpinner';
import TagsFilterSelector from '@/components/TagsFilterSelector';
import slugify from '@/helpers/slugify';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { Menu, Transition } from '@headlessui/react';
import { ArrowRightIcon, DocumentAddIcon, FolderAddIcon, SelectorIcon, UploadIcon } from '@heroicons/react/solid';
import 'easymde/dist/easymde.min.css';
import PureKysoButton from '@/components/PureKysoButton';
import { KysoButton } from '@/types/kyso-button.enum';
import RenderBase64Image from '@/components/renderers/RenderBase64Image';
import { FileTypesHelper } from '@/helpers/FileTypesHelper';
import RenderCode from '@/components/renderers/RenderCode';

const SimpleMdeReact = dynamic(() => import('react-simplemde-editor'), { ssr: false });

const token: string | null = getLocalStorageItem('jwt');

const blobToBase64 = (blob: Blob): Promise<string> => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
  });
};

interface Props {
  commonData: CommonData;
}

const CreateReport = ({ commonData }: Props) => {
  useRedirectIfNoJWT();
  const router = useRouter();

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

  useEffect(() => {
    if (channelMembers) {
      const currentUser = channelMembers.filter((x) => x.id === commonData.user?.id)[0];

      if (currentUser && !selectedPeople) {
        setSelectedPeople([currentUser]);
      }
    }
  }, [channelMembers]);

  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const [hasAnythingCached, setHasAnythingCached] = useState(false);
  const [description, setDescription] = useState('');
  const [draftStatus, setDraftStatus] = useState('');

  const [selectedTags, setTags] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState<TeamMember[]>(channelMembers);
  const [allowedTags, setAllowedTags] = useState<string[]>([]);

  const mainfile: CreationReportFileSystemObject[] = [new CreationReportFileSystemObject('Readme.md', 'Readme.md', 'Readme.md', 'file', '', undefined, true)];

  const [selectedFile, setSelectedFile] = useState<FilesystemItem>(new FilesystemItem(mainfile[0]!, [], 1));
  const [files, setFiles] = useState<CreationReportFileSystemObject[]>(mainfile);

  const hasPermissionCreateReport = useMemo(() => checkPermissions(commonData, ReportPermissionsEnum.CREATE), [commonData]);

  const cleanStorage = () => {
    removeLocalStorageItem('formTitle');
    removeLocalStorageItem('formDescription');
    removeLocalStorageItem('formSelectedPeople');
    removeLocalStorageItem('formTags');
    removeLocalStorageItem('formFileValues');
    removeLocalStorageItem('formFile');
    for (const file of files) {
      removeLocalStorageItem(file.id);
    }
  };

  const filterTags = async (query?: string) => {
    const api: Api = new Api(token);
    api.setOrganizationSlug(commonData.organization!.sluglified_name);
    if (commonData.team) {
      api.setTeamSlug(commonData.team?.sluglified_name);
    }

    interface QueryInterface {
      filter?: {};
    }
    const queryObj: QueryInterface = {};
    if (query) {
      queryObj.filter = { search: query };
    }

    const result: NormalizedResponseDTO<Tag[]> = await api.getTags(queryObj);

    setAllowedTags(result.data.map((t) => t.name));
  };

  useEffect(() => {
    filterTags();
  }, [commonData.organization, commonData.team]);

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
    // Search for a file with the same ID --> THAT MEANS IS A RENAME
    const existingFileIndex = files.findIndex((x) => x.id === newFile.id);

    if (existingFileIndex < 0) {
      // Does not exist, so it's a new file
      files.push(newFile);
    } else {
      // Already exists, so we just need to change the name
      files[existingFileIndex]!.name = newFile.name;
      files[existingFileIndex]!.path = newFile.path;
      files[existingFileIndex]!.type = newFile.type;
    }

    setFiles([...files]);
    setDraftStatus('Saving ...');
    delayedCallback('formFile', files);
  };

  const delayedCallback = debounce(async (key, value) => {
    setLocalStorageItem(key, JSON.stringify(value));
    setHasAnythingCached(true);
    setDraftStatus('All changes saved in local storage');
  }, 1000);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e?: any) => {
    if (e) {
      e.preventDefault();
    }

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
    api.setOrganizationSlug(commonData.organization!.sluglified_name);
    api.setTeamSlug(commonData.team.sluglified_name);

    try {
      const exists: boolean = await api.reportExists(commonData.team.id as string, slugify(title));

      if (exists) {
        setError('Report with this name already exists.');
        setBusy(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (er: any) {
      setError(er.message);
      setBusy(false);
      return;
    }

    const mainIndex = files.findIndex((x) => x.main === true);
    let mainFile = 'Readme.md';

    if (mainIndex >= 0) {
      mainFile = files[mainIndex]!.path;
    }

    const zip = new JSZip();
    const kysoConfigFile: KysoConfigFile = {
      main: mainFile,
      title,
      description,
      organization: commonData.organization!.sluglified_name,
      team: commonData.team.sluglified_name,
      tags: selectedTags,
      type: ReportType.Markdown,
      authors: selectedPeople.map((person) => person.email),
    };

    const blobKysoConfigFile: Blob = new Blob([JSON.stringify(kysoConfigFile, null, 2)], { type: 'plain/text' });
    zip.file('kyso.json', blobKysoConfigFile);
    for (const file of files) {
      const blob = await (await fetch(getLocalStorageItem(file.id) as string)).blob();
      zip.file(file.name, blob);
    }
    const blobZip = await zip.generateAsync({ type: 'blob' });
    const formData = new FormData();
    formData.append('file', blobZip);

    try {
      const { data: newReport }: NormalizedResponseDTO<ReportDTO> = await api.createUiReport(formData);

      cleanStorage();

      for (const file of files) {
        removeLocalStorageItem(file.id);
      }
      setBusy(false);
      router.push(`/${newReport.organization_sluglified_name}/${newReport.team_sluglified_name}/${newReport.name}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setBusy(false);
      setError(err.response.data.message);
    }
  };

  const onUploadFile = async (event: ChangeEvent<HTMLInputElement>, parent?: FilesystemItem) => {
    if (!event.target.files) {
      return;
    }
    const newFiles = Array.from(event.target.files);

    newFiles.forEach(async (file) => {
      try {
        setError(null);
        const base64 = await blobToBase64(file);
        setLocalStorageItem(file.name, base64);
        const newFile = new CreationReportFileSystemObject(file.name, `${parent ? `${parent.file.path}/` : ''}${file.name}`, file.name, 'file', '', parent ? parent?.file.id : undefined);
        addNewFile(newFile);
      } catch (err) {
        setError('Report exceeds 5mb limit.');
      }
    });
  };

  useEffect(() => {
    const go = async (asText: boolean) => {
      const base64 = getLocalStorageItem(selectedFile?.file.id);
      if (!base64) {
        return setSelectedFileValue('');
      }

      if (asText) {
        const text = await (await fetch(base64)).text();
        return setSelectedFileValue(text);
      }
      return setSelectedFileValue(base64);
    };

    if (FileTypesHelper.isImage(selectedFile.file.path)) {
      go(false);
    } else {
      go(true);
    }
  }, [selectedFile?.file.id]);

  const editorOptions = useMemo(() => {
    return {
      autofocus: false,
      spellChecker: false,
      hideIcons: ['side-by-side', 'fullscreen', 'preview'],
    };
  }, []);

  const [selectedFileValue, setSelectedFileValue] = useState('initial value');
  const handleEditorChange = useCallback((fileId: string, value: string) => {
    setSelectedFileValue(value);
    setLocalStorageItem(fileId, `data:text/plain;base64,${btoa(value)}`);
    setHasAnythingCached(true);
    setDraftStatus('All changes saved in local storage');
  }, []);

  return (
    <div className="p-4">
      <div className="flex flex-row items-center">
        <div className="w-1/6"></div>
        <div className="w-4/6">
          <div className="flex justify-end">
            <div className="flex flex-row items-center space-x-2">
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
          </div>
          <div className="w-full mb-4">
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
                  height: '38px',
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

          {commonData.team && !hasPermissionCreateReport && <div className="ml-3 mb-2 text-xs text-red-500">Sorry, you do not have permission to post into this channel, please select another.</div>}

          <div className="flex flex-row justify-between mb-2">
            <div className="flex flex-row items-center space-x-2">
              <MemberFilterSelector
                initial={channelMembers}
                selected={selectedPeople}
                setSelected={(newSelectedPeople: TeamMember[]) => {
                  if (newSelectedPeople.length > 0) {
                    setSelectedPeopleDelay(newSelectedPeople);
                  } else {
                    setError('At least one author is required');
                  }
                }}
                emptyMessage={commonData.team ? 'No authors' : 'First select a channel to add authors'}
              />

              <TagsFilterSelector
                filter={(query) => {
                  filterTags(query);
                }}
                onAddTags={(newTags) => {
                  const newAllowedTags = [...new Set([...allowedTags, ...newTags])];
                  setAllowedTags(newAllowedTags);
                }}
                initial={allowedTags}
                selected={selectedTags}
                setSelected={(newTags: string[]) => setTagsDelay(newTags)}
              />

              {selectedTags.map((tag) => (
                <div key={tag} className="text-xs rounded bg-slate-100 p-1">
                  {tag}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-row justify-end my-2">
            {draftStatus && <h6 className="pt-2 text-gray-500 text-xs">{draftStatus}</h6>}

            {hasAnythingCached && (
              <PureKysoButton
                type={KysoButton.SECONDARY}
                className="ml-2"
                onClick={() => {
                  cleanStorage();
                  router.reload();
                }}
              >
                Reset
              </PureKysoButton>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="w-1/6 px-2">
          <div className="text-sm rounded">
            <div className="flex min-h-12 border-b">
              <div className="inline-flex items-center justify-end w-full">
                <NewReportNamingDropdown
                  label="Create new file"
                  icon={DocumentAddIcon}
                  onCreate={(newFile: CreationReportFileSystemObject) => {
                    addNewFile(newFile);
                  }}
                />
                <NewReportNamingDropdown
                  label="Create new folder"
                  icon={FolderAddIcon}
                  isFolder={true}
                  onCreate={(n: CreationReportFileSystemObject) => {
                    addNewFile(n);
                  }}
                />
                <div>
                  <label
                    htmlFor="formFileLg"
                    className=" 
                    text-left p-1 hover:cursor-pointer hover:bg-gray-100
                    rounded text-sm font-medium
                    block
                    
                    form-label relative items-center  
                    focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <UploadIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                    <input
                      style={{ display: 'none' }}
                      className="p-2 h-5 w-5 opacity-0 transition cursor-pointer rounded mr-1 form-control absolute ease-in-out"
                      id="formFileLg"
                      type="file"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => onUploadFile(e)}
                    />
                  </label>
                </div>
              </div>
            </div>
            {files && files.length > 0 && (
              <Filesystem
                onUploadFile={onUploadFile}
                files={files}
                selectedFileId={selectedFile.file.id}
                onSetAsMainFile={(newFile: FilesystemItem) => {
                  const index = files.findIndex((x) => x.id === newFile.file.id);

                  if (index >= 0) {
                    // Create a new array putting all the mains to false
                    const newFiles = Array.from(
                      files.map((x) => {
                        x.main = false;
                        return x;
                      }),
                    );

                    // Set the new main
                    const newMainFile = files[index]!;
                    newMainFile.main = true;

                    setFiles(newFiles);
                    setDraftStatus('Saving ...');
                    delayedCallback('formFile', newFiles);
                  } else {
                    setError(`${newFile.file.path} no longer exists and can't be set as main`);
                  }
                }}
                onAddNewFile={(newFile: CreationReportFileSystemObject) => {
                  addNewFile(newFile);
                }}
                onRemoveFile={(fileToRemove: CreationReportFileSystemObject) => {
                  removeLocalStorageItem(fileToRemove.id);
                  const newFiles = files.filter((x) => x.id !== fileToRemove.id && x.parentId !== fileToRemove.id);
                  setFiles(newFiles);
                  setDraftStatus('Saving ...');
                  delayedCallback('formFile', newFiles);
                }}
                onSelectedFile={(sFile: FilesystemItem) => {
                  setSelectedFileValue('');
                  setSelectedFile(sFile);
                }}
              />
            )}
          </div>
        </div>
        <div className="w-4/6">
          {FileTypesHelper.isTextBasedFiled(selectedFile.file.path) && (
            <>
              <SimpleMdeReact key="editor" options={editorOptions} value={selectedFileValue} onChange={(value) => handleEditorChange(selectedFile?.file.id!, value)} />
            </>
          )}

          {FileTypesHelper.isImage(selectedFile.file.path) && (
            <div className="pl-10">
              <RenderBase64Image base64={selectedFileValue} alt={selectedFile.file.name} />
            </div>
          )}

          {FileTypesHelper.isJupyterNotebook(selectedFile.file.path) && (
            <>
              <button
                type="button"
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"></svg>

                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
                <span className="mt-2 block text-sm font-medium text-gray-900">Jupyter notebooks can only be displayed once the report is created.</span>
              </button>
            </>
          )}

          {FileTypesHelper.isCode(selectedFile.file.path) && (
            <>
              <RenderCode code={selectedFileValue} showFileNumbers={true} />
            </>
          )}

          {FileTypesHelper.isOffice365(selectedFile.file.path) && (
            <>
              <button
                type="button"
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"></svg>

                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
                <span className="mt-2 block text-sm font-medium text-gray-900">Microsoft Office content only can be displayed when the report is created.</span>
              </button>
            </>
          )}

          {FileTypesHelper.isGoogleDocs(selectedFile.file.path) && (
            <>
              <button
                type="button"
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"></svg>

                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Files of type {FileTypesHelper.getExtension(selectedFile.file.path)} only can be displayed when the report is created
                </span>
              </button>
            </>
          )}

          {!FileTypesHelper.isSupported(selectedFile.file.path) && (
            <>
              <button
                type="button"
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"></svg>

                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  This file can&apos;t be rendered while you create a report <br />
                  <br />
                  Did you miss to set the extension of the file?
                </span>
              </button>
            </>
          )}

          <div className="text-right">{error && <ErrorNotification message={error} />}</div>
        </div>
      </div>
      <div className="flex flex-row items-center">
        <div className="w-1/6"></div>
        <div className="w-4/6">
          <div className="flex justify-end">
            <div className="flex flex-row items-center space-x-2">
              <div className="mr-2">
                <PureKysoButton type={KysoButton.PRIMARY} onClick={handleSubmit} className="ml-2">
                  {busy && <PureSpinner size={5} />}
                  Post <ArrowRightIcon className="ml-2 w-4 h-4" />
                </PureKysoButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CreateReport.layout = KysoApplicationLayout;

export default CreateReport;
