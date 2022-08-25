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

  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const [hasAnythingCached, setHasAnythingCached] = useState(false);
  const [description, setDescription] = useState('');
  const [draftStatus, setDraftStatus] = useState('');

  const [selectedTags, setTags] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState<TeamMember[]>(channelMembers);
  const [allowedTags, setAllowedTags] = useState<string[]>([]);

  const mainfile: CreationReportFileSystemObject[] = [new CreationReportFileSystemObject('Readme.md', 'Readme.md', 'Readme.md', 'file', '')];

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
    files.push(newFile);

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

    const zip = new JSZip();
    const kysoConfigFile: KysoConfigFile = {
      main: 'Readme.md',
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
    const go = async () => {
      const base64 = getLocalStorageItem(selectedFile?.file.id);
      if (!base64) {
        return setSelectedFileValue('');
      }
      const text = await (await fetch(base64)).text();
      return setSelectedFileValue(text);
    };
    go();
  }, [selectedFile?.file.id]);

  const editorOptions = useMemo(() => {
    return {
      autofocus: false,
      spellChecker: false,
      hideIcons: ['side-by-side', 'fullscreen'],
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
          <div className="flex flex-row items-center justify-between">
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
              {title && slugify(title)}
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
            <div className="flex flex-col">
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
                {hasAnythingCached && (
                  <button
                    type="reset"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                      cleanStorage();
                      router.reload();
                    }}
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {busy && <PureSpinner size={5} />}
                  Post <ArrowRightIcon className="ml-2 w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-row justify-end mt-2">{draftStatus && <h6 className="text-gray-500 text-xs">{draftStatus}</h6>}</div>
            </div>
          </div>

          {commonData.team && !hasPermissionCreateReport && <div className="ml-3 mb-2 text-xs text-red-500">Sorry, you do not have permission to post into this channel, please select another.</div>}

          <div className="flex flex-row justify-between mb-2">
            <div className="flex flex-row items-center space-x-2">
              <MemberFilterSelector
                initial={channelMembers}
                selected={selectedPeople}
                setSelected={(newSelectedPeople: TeamMember[]) => setSelectedPeopleDelay(newSelectedPeople)}
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
        </div>
      </div>
      <div className="flex flex-row">
        <div className="w-1/6 px-2">
          <div className="text-sm rounded">
            <div className="flex min-h-12 border-b">
              <div className="inline-flex items-center justify-end w-full">
                <NewReportNamingDropdown
                  label="Create new markdown file"
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
                  setSelectedFile(sFile);
                }}
              />
            )}
          </div>
        </div>
        <div className="w-4/6">
          <SimpleMdeReact key="editor" options={editorOptions} value={selectedFileValue} onChange={(value) => handleEditorChange(selectedFile?.file.id!, value)} />
          <div className="text-right">{error && <ErrorNotification message={error} />}</div>
        </div>
      </div>
    </div>
  );
};

CreateReport.layout = KysoApplicationLayout;

export default CreateReport;
