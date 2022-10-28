/* eslint-disable @typescript-eslint/no-explicit-any */
import ErrorNotification from '@/components/ErrorNotification';
import Filesystem from '@/components/Filesystem';
import MemberFilterSelector from '@/components/MemberFilterSelector';
import NewReportNamingDropdown from '@/components/NewReportNamingDropdown';
import PureKysoButton from '@/components/PureKysoButton';
import { PureSpinner } from '@/components/PureSpinner';
import RenderBase64Image from '@/components/renderers/RenderBase64Image';
import RenderCode from '@/components/renderers/RenderCode';
import RenderError from '@/components/renderers/RenderError';
import TagsFilterSelector from '@/components/TagsFilterSelector';
import classNames from '@/helpers/class-names';
import { FileTypesHelper } from '@/helpers/FileTypesHelper';
import { getSessionStorageItem, removeSessionStorageItem, setSessionStorageItem } from '@/helpers/isomorphic-session-storage';
import slugify from '@/helpers/slugify';
import { useChannelMembers } from '@/hooks/use-channel-members';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import { CreationReportFileSystemObject } from '@/model/creation-report-file';
import { FilesystemItem } from '@/model/filesystem-item.model';
import type { CommonData } from '@/types/common-data';
import { KysoButton } from '@/types/kyso-button.enum';
import { Menu, Transition } from '@headlessui/react';
import { ArrowRightIcon, DocumentAddIcon, ExclamationCircleIcon, FolderAddIcon, SelectorIcon, UploadIcon } from '@heroicons/react/solid';
import type { KysoConfigFile, KysoSetting, NormalizedResponseDTO, ReportDTO, Tag, UserDTO } from '@kyso-io/kyso-model';
import { KysoSettingsEnum, ReportPermissionsEnum, ReportType, TeamMember, TeamMembershipOriginEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import 'easymde/dist/easymde.min.css';
import FormData from 'form-data';
import JSZip from 'jszip';
import debounce from 'lodash.debounce';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import type { ChangeEvent } from 'react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import CaptchaModal from '../../../components/CaptchaModal';
import ToasterNotification from '../../../components/ToasterNotification';
import { checkJwt } from '../../../helpers/check-jwt';
import { HelperPermissions } from '../../../helpers/check-permissions';
import { Helper } from '../../../helpers/Helper';

const SimpleMdeReact = dynamic(() => import('react-simplemde-editor'), { ssr: false });

const token: string | null = getSessionStorageItem('jwt');

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
  setUser: (user: UserDTO) => void;
}

const CreateReport = ({ commonData, setUser }: Props) => {
  const router = useRouter();
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);
  const [showCaptchaModal, setShowCaptchaModal] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
  const [showToaster, setShowToaster] = useState<boolean>(false);

  useEffect(() => {
    const result: boolean = checkJwt();
    setUserIsLogged(result);
    const getData = async () => {
      try {
        const api: Api = new Api();
        const resultKysoSetting: NormalizedResponseDTO<KysoSetting[]> = await api.getPublicSettings();
        const index: number = resultKysoSetting.data.findIndex((item: KysoSetting) => item.key === KysoSettingsEnum.HCAPTCHA_ENABLED);
        if (index !== -1) {
          setCaptchaIsEnabled(resultKysoSetting.data[index]!.value === 'true');
        }
      } catch (errorHttp: any) {
        console.error(errorHttp.response.data);
      }
    };
    getData();
  }, []);

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

  const hasPermissionCreateReport: boolean | null = useMemo(() => {
    if (!commonData.permissions) {
      return null;
    }
    return HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.CREATE);
  }, [commonData.permissions, commonData.organization, commonData.team]);

  const cleanStorage = () => {
    removeSessionStorageItem('formTitle');
    removeSessionStorageItem('formDescription');
    removeSessionStorageItem('formSelectedPeople');
    removeSessionStorageItem('formTags');
    removeSessionStorageItem('formFileValues');
    removeSessionStorageItem('formFile');
    for (const file of files) {
      removeSessionStorageItem(file.id);
    }
  };

  const filterTags = async (query?: string) => {
    const api: Api = new Api(commonData.token);
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
    if (!commonData.token || !commonData.organization) {
      return;
    }
    filterTags();
  }, [commonData.token, commonData.organization, commonData.team]);

  useEffect(() => {
    if (!commonData.user) {
      return;
    }
    if (getSessionStorageItem('formTitle')) {
      setTitle(JSON.parse(getSessionStorageItem('formTitle')!));
      setHasAnythingCached(true);
    }
    if (getSessionStorageItem('formDescription')) {
      setDescription(JSON.parse(getSessionStorageItem('formDescription')!));
      setHasAnythingCached(true);
    }
    if (getSessionStorageItem('formSelectedPeople')) {
      setSelectedPeople(JSON.parse(getSessionStorageItem('formSelectedPeople')!));
      setHasAnythingCached(true);
    } else {
      // Put current user as author
      setSelectedPeople([
        new TeamMember(
          commonData.user?.id!,
          commonData.user?.display_name!,
          commonData.user?.username!,
          [],
          '',
          commonData.user?.avatar_url!,
          commonData.user?.email!,
          TeamMembershipOriginEnum.ORGANIZATION,
        ),
      ]);
    }
    if (getSessionStorageItem('formTags')) {
      setTags(JSON.parse(getSessionStorageItem('formTags')!));
      setHasAnythingCached(true);
    }

    if (getSessionStorageItem('formFile')) {
      setFiles(JSON.parse(getSessionStorageItem('formFile')!));
      setHasAnythingCached(true);
    }
  }, [commonData.user]);

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
    const fs: CreationReportFileSystemObject[] = [...files];
    const existingFileIndex = fs.findIndex((x) => x.id === newFile.id);
    if (existingFileIndex === -1) {
      // Does not exist, so it's a new file
      fs.push(newFile);
    } else {
      // Already exists, so we just need to change the name
      fs[existingFileIndex]!.name = newFile.name;
      fs[existingFileIndex]!.path = newFile.path;
      fs[existingFileIndex]!.type = newFile.type;
    }
    setFiles(fs);
    setDraftStatus('Saving ...');
    delayedCallback('formFile', fs);
  };

  const delayedCallback = debounce(async (key, value) => {
    setSessionStorageItem(key, JSON.stringify(value));
    setHasAnythingCached(true);
    setDraftStatus('All changes saved in local storage. Max memory 5MB. Go to upload page to create a bigger report.');
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

    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowCaptchaModal(true);
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
      channel: commonData.team.sluglified_name,
      tags: selectedTags,
      type: ReportType.Markdown,
      authors: selectedPeople.map((person) => person.email),
    };
    delete (kysoConfigFile as any).team;

    const blobKysoConfigFile: Blob = new Blob([JSON.stringify(kysoConfigFile, null, 2)], { type: 'plain/text' });
    zip.file('kyso.json', blobKysoConfigFile, { createFolders: true });
    let numFiles = 0;
    for (const file of files) {
      const fileContent: string | null = getSessionStorageItem(file.id);
      if (file.type === 'folder') {
        zip.folder(file.path);
      } else {
        let blob: Blob;
        if (fileContent) {
          blob = await (await fetch(fileContent!)).blob();
        } else {
          blob = new Blob([''], { type: 'plain/text' });
        }
        zip.file(file.path, blob, { createFolders: true });
        numFiles += 1;
      }
    }
    if (numFiles === 0) {
      setBusy(false);
      setError('You need to add at least one file.');
      return;
    }
    const blobZip: Blob = await zip.generateAsync({ type: 'blob' });
    const formData: FormData = new FormData();
    formData.append('file', blobZip);
    try {
      const { data: newReport }: NormalizedResponseDTO<ReportDTO> = await api.createUiReport(formData);
      cleanStorage();
      for (const file of files) {
        removeSessionStorageItem(file.id);
      }
      setBusy(false);
      window.location.href = `/${newReport.organization_sluglified_name}/${newReport.team_sluglified_name}/${newReport.name}`;
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
    const newFiles: File[] = Array.from(event.target.files);
    const ignoredFiles: string[] = [];
    for (const file of newFiles) {
      if (Helper.FORBIDDEN_FILES.includes(file.name.toLowerCase())) {
        ignoredFiles.push(file.name);
      } else {
        try {
          setError(null);
          const base64 = await blobToBase64(file);
          setSessionStorageItem(file.name, base64);
          const newFile = new CreationReportFileSystemObject(file.name, `${parent ? `${parent.file.path}/` : ''}${file.name}`, file.name, 'file', '', parent ? parent?.file.id : undefined);
          addNewFile(newFile);
        } catch (err) {
          setError('Report exceeds 5mb limit.');
        }
      }
    }
    if (ignoredFiles.length > 0) {
      setMessageToaster(ignoredFiles.length === 1 ? `File ${ignoredFiles[0]} is not allowed.` : `Files ${ignoredFiles.join(', ')} are not allowed.`);
      setShowToaster(true);
    }
  };

  useEffect(() => {
    const go = async (asText: boolean) => {
      const base64 = getSessionStorageItem(selectedFile?.file.id);
      if (!base64) {
        return setSelectedFileValue('');
      }

      if (asText) {
        const text = await (await fetch(base64)).text();
        return setSelectedFileValue(text);
      }
      return setSelectedFileValue(base64);
    };

    if (FileTypesHelper.isImage(selectedFile.file.name)) {
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
    setSessionStorageItem(fileId, `data:text/plain;base64,${btoa(value)}`);
    setHasAnythingCached(true);
    setDraftStatus('saved');
  }, []);

  const onCloseCaptchaModal = async (refreshUser: boolean) => {
    setShowCaptchaModal(false);
    if (refreshUser) {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
      setUser(result.data);
    }
  };

  if (userIsLogged === null) {
    return null;
  }

  if (hasPermissionCreateReport === null) {
    return null;
  }

  let createLinkForm = `/${commonData.organization?.sluglified_name}/create-report-form`;
  if (commonData.team) {
    createLinkForm = `/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/create-report-form`;
  }

  return userIsLogged ? (
    hasPermissionCreateReport ? (
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
              {draftStatus !== 'saved' && <h6 className="pt-2 text-gray-500 text-xs">{draftStatus}</h6>}
              {draftStatus === 'saved' && (
                <h6 className="pt-2 text-gray-500 text-xs">
                  All changes saved in local storage.
                  <a className="text-indigo-700 hover:text-indigo-900" href={createLinkForm}>
                    {` `}Upload more than 5MB here.
                  </a>
                </h6>
              )}

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
                    files={files}
                  />
                  <NewReportNamingDropdown
                    label="Create new folder"
                    icon={FolderAddIcon}
                    isFolder={true}
                    onCreate={(n: CreationReportFileSystemObject) => {
                      addNewFile(n);
                    }}
                    files={files}
                  />
                  <div>
                    <label
                      htmlFor="formFileLg"
                      className="text-left p-1 hover:cursor-pointer hover:bg-gray-100 rounded text-sm font-medium block form-label relative items-center focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <UploadIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                      <input
                        style={{ display: 'none' }}
                        className="p-2 h-5 w-5 opacity-0 transition cursor-pointer rounded mr-1 form-control absolute ease-in-out"
                        id="formFileLg"
                        type="file"
                        multiple
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          onUploadFile(e);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="min-h-12 border-b w-full">
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
                      removeSessionStorageItem(fileToRemove.id);
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
          </div>
          <div className="w-4/6">
            {FileTypesHelper.isTextBasedFiled(selectedFile.file.name) && (
              <>
                <SimpleMdeReact key="editor" options={editorOptions} value={selectedFileValue} onChange={(value) => handleEditorChange(selectedFile?.file.id!, value)} />
              </>
            )}

            {FileTypesHelper.isImage(selectedFile.file.name) && (
              <div className="pl-10">
                <RenderBase64Image base64={selectedFileValue} alt={selectedFile.file.name} />
              </div>
            )}

            {FileTypesHelper.isJupyterNotebook(selectedFile.file.name) && (
              <>
                <RenderError message="Jupyter notebooks can only be displayed once the report is created." />
              </>
            )}

            {FileTypesHelper.isCode(selectedFile.file.name) && (
              <>
                <RenderCode code={selectedFileValue} showFileNumbers={true} />
              </>
            )}

            {FileTypesHelper.isOnlyOffice(selectedFile.file.name) && (
              <>
                <RenderError message="Microsoft Office content only can be displayed when the report is created." />
              </>
            )}

            {FileTypesHelper.isGoogleDocs(selectedFile.file.name) && (
              <>
                <RenderError message={`Files of type ${FileTypesHelper.getExtension(selectedFile.file.name)} only can be displayed when the report is created`} />
              </>
            )}

            {!FileTypesHelper.isSupported(selectedFile.file.name) && (
              <>
                <RenderError message={`This file can't be rendered while you create a report. Did you miss to set the extension of the file?`} />
              </>
            )}

            <div>{error && <ErrorNotification message={error} />}</div>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <div className="w-1/6"></div>
          <div className="w-4/6">
            <div className="flex justify-end">
              <div className="flex flex-row items-center space-x-2">
                <div className="mr-2 mt-2">
                  <PureKysoButton
                    type={!hasPermissionCreateReport ? KysoButton.PRIMARY_DISABLED : KysoButton.PRIMARY}
                    onClick={handleSubmit}
                    className="ml-2"
                    /* disabled={!hasPermissionCreateReport} */
                  >
                    {busy && <PureSpinner size={5} />}
                    Post <ArrowRightIcon className="ml-2 w-4 h-4" />
                  </PureKysoButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToasterNotification show={showToaster} setShow={setShowToaster} icon={<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />} message={messageToaster} />
        {commonData.user && <CaptchaModal user={commonData.user!} open={showCaptchaModal} onClose={onCloseCaptchaModal} />}
      </div>
    ) : (
      <div className="flex flex-row space-x-8 p-2">
        <div className="w-2/12"></div>
        <div className="rounded-md bg-yellow-50 p-4 mt-8">
          <div className="flex">
            <div className="shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Forbidden resource</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You don&apos;t have permissions to create reports. Come back to
                  <a href={commonData.team ? `/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}` : `/${commonData.organization?.sluglified_name}`} className="font-bold">
                    {' '}
                    {commonData.team ? commonData.team?.display_name : commonData.organization?.display_name}{' '}
                  </a>
                  page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  ) : (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-2/12"></div>
      <div className="rounded-md bg-yellow-50 p-4 mt-8">
        <div className="flex">
          <div className="shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Forbidden resource</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                You don&apos;t have permissions to create reports. Come back to
                <a href={commonData.team ? `/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}` : `/${commonData.organization?.sluglified_name}`} className="font-bold">
                  {' '}
                  {commonData.team ? commonData.team?.display_name : commonData.organization?.display_name}{' '}
                </a>
                page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CreateReport.layout = KysoApplicationLayout;

export default CreateReport;
