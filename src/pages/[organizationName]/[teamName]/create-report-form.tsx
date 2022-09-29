/* eslint-disable @typescript-eslint/no-explicit-any */
import MemberFilterSelector from '@/components/MemberFilterSelector';
import PureKysoButton from '@/components/PureKysoButton';
import { PureSpinner } from '@/components/PureSpinner';
import TagsFilterSelector from '@/components/TagsFilterSelector';
import checkPermissions from '@/helpers/check-permissions';
import classNames from '@/helpers/class-names';
import { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import slugify from '@/helpers/slugify';
import { useChannelMembers } from '@/hooks/use-channel-members';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { BreadcrumbItem } from '@/model/breadcrum-item.model';
import type { CommonData } from '@/types/common-data';
import { KysoButton } from '@/types/kyso-button.enum';
import { Menu, Transition } from '@headlessui/react';
import { ArrowRightIcon, ExclamationCircleIcon, InformationCircleIcon, SelectorIcon } from '@heroicons/react/solid';
import type { KysoConfigFile, KysoSetting, NormalizedResponseDTO, ReportDTO, Tag, TeamMember } from '@kyso-io/kyso-model';
import { KysoSettingsEnum, ReportPermissionsEnum, ReportType } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import 'easymde/dist/easymde.min.css';
import FormData from 'form-data';
import JSZip from 'jszip';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';
import type { ChangeEvent } from 'react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import ToasterNotification from '../../../components/ToasterNotification';
import { checkJwt } from '../../../helpers/check-jwt';
import { Helper } from '../../../helpers/Helper';
import { TailwindColor } from '../../../tailwind/enum/tailwind-color.enum';

const token: string | null = getLocalStorageItem('jwt');

interface Props {
  commonData: CommonData;
}

const CreateReport = ({ commonData }: Props) => {
  useRedirectIfNoJWT();
  const router = useRouter();
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);
  const inputRef = useRef<any>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState<boolean>(false);
  const [hasAnythingCached, setHasAnythingCached] = useState(false);
  const [description, setDescription] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [selectedTags, setTags] = useState([]);
  const channelMembers = useChannelMembers({ commonData });
  const [selectedPeople, setSelectedPeople] = useState<TeamMember[]>(channelMembers);
  const [allowedTags, setAllowedTags] = useState<string[]>([]);
  const hasPermissionCreateReport = useMemo(() => checkPermissions(commonData, ReportPermissionsEnum.CREATE), [commonData]);
  const [files, setFiles] = useState<File[]>([]);
  const [mainFile, setMainFile] = useState<string | null>(null);
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);

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
          new BreadcrumbItem(team.display_name, `${router.basePath}/${commonData.organization?.sluglified_name}/${team.name}/create-report-form`, commonData.team?.sluglified_name === team.name),
        );
      });
  }

  useEffect(() => {
    if (channelMembers) {
      const currentUser = channelMembers.filter((x) => x.id === commonData.user?.id)[0];

      if (currentUser && !selectedPeople) {
        setSelectedPeople([currentUser]);
      }
    }
  }, [channelMembers]);

  const cleanStorage = () => {
    removeLocalStorageItem('formTitle');
    removeLocalStorageItem('formDescription');
    removeLocalStorageItem('formSelectedPeople');
    removeLocalStorageItem('formTags');
    removeLocalStorageItem('formFileValues');
    removeLocalStorageItem('formFile');
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
    if (commonData.organization) {
      filterTags();
    }
  }, [commonData.organization, commonData.team]);

  const setTitleDelay = (_title: string) => {
    setTitle(_title);
    setDraftStatus('Saving ...');
    delayedCallback('formTitle', _title);
    setShowToaster(false);
    setMessageToaster('');
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
    setShowToaster(false);
    if (!title || title.trim().length === 0) {
      setMessageToaster('Title is required.');
      setShowToaster(true);
      return;
    }
    if (!commonData.team) {
      setMessageToaster('Please select a channel.');
      setShowToaster(true);
      return;
    }
    if (files.length === 0) {
      setMessageToaster('Please select at least one file.');
      setShowToaster(true);
      return;
    }
    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setMessageToaster('Please verify the captcha');
      setShowToaster(true);
      setTimeout(() => {
        setShowToaster(false);
        sessionStorage.setItem('redirectUrl', `/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/create-report-form`);
        router.push('/captcha');
      }, 2000);
      return;
    }
    setBusy(true);
    const api: Api = new Api(token);
    api.setOrganizationSlug(commonData.organization!.sluglified_name);
    api.setTeamSlug(commonData.team.sluglified_name);
    try {
      const exists: boolean = await api.reportExists(commonData.team.id as string, slugify(title));
      if (exists) {
        setMessageToaster('Report with this name already exists. Change the title.');
        setShowToaster(true);
        setBusy(false);
        return;
      }
    } catch (er: any) {
      setMessageToaster(er.response.data.message);
      setShowToaster(true);
      setBusy(false);
      return;
    }
    const zip = new JSZip();
    const kysoConfigFile: KysoConfigFile = {
      main: mainFile || files[0]!.name,
      title,
      description,
      organization: commonData.organization!.sluglified_name,
      team: commonData.team.sluglified_name,
      tags: selectedTags,
      type: ReportType.Markdown,
      authors: selectedPeople.map((person) => person.email),
    };
    const blobKysoConfigFile: Blob = new Blob([JSON.stringify(kysoConfigFile, null, 2)], { type: 'plain/text' });
    zip.file('kyso.json', blobKysoConfigFile, { createFolders: true });
    for (const file of files) {
      zip.file(file.name, file);
    }
    const blobZip = await zip.generateAsync({ type: 'blob' });
    const formData = new FormData();
    formData.append('file', blobZip);
    setMessageToaster('Uploading report. Please wait ...');
    setShowToaster(true);
    try {
      const { data: newReport }: NormalizedResponseDTO<ReportDTO> = await api.createUiReport(formData);
      cleanStorage();
      setShowToaster(false);
      window.location.href = `/${newReport.organization_sluglified_name}/${newReport.team_sluglified_name}/${newReport.name}`;
    } catch (err: any) {
      setShowToaster(err.response.data.message);
    }
    setBusy(false);
  };

  const onUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    const newFiles: File[] = [];
    for (const file of event.target.files) {
      const index: number = files.findIndex((f: File) => f.name === file.name);
      if (index === -1) {
        newFiles.push(file);
      }
    }
    setFiles([...files, ...newFiles]);
  };

  if (userIsLogged === null) {
    return null;
  }

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
                className="p-0 focus:shadow-sm 0 block w-full border-white border-0 rounded-md text-3xl font-medium focus:text-gray-500 text-gray-900"
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
                className="p-0 focus:shadow-sm 0  block  w-full h-full focus:w-full  border-white border-0 text-gray-500 sm:text-sm rounded-md"
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
                    setShowToaster(false);
                  } else {
                    setMessageToaster('At least one author is required');
                    setShowToaster(true);
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
      <div className="flex flex-row items-center">
        <div className="w-1/6"></div>
        <div className="w-4/6">
          <div className="px-4 sm:px-6 lg:px-8 my-4">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-xl font-semibold text-gray-900">Files</h1>
                <p className="mt-2 text-sm text-gray-700">list of files that make up the report.</p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                  type="button"
                  onClick={() => inputRef.current.click()}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 sm:w-auto"
                >
                  Add files
                </button>
                <input ref={inputRef} multiple type="file" style={{ display: 'none' }} onChange={onUploadFile} />
              </div>
            </div>
            <div className="mt-8 flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Name
                          </th>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Size
                          </th>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {files.length === 0 ? (
                          <tr className="text-center">
                            <td colSpan={3} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              No files selected
                            </td>
                          </tr>
                        ) : (
                          files.map((file: File, index: number) => (
                            <tr key={file.name}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{file.name}</td>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{Helper.parseFileSize(file.size)}</td>
                              <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                {file.name === mainFile ? (
                                  <button
                                    onClick={() => setMainFile(null)}
                                    className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 mr-4"
                                  >
                                    Remove as main
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setMainFile(file.name)}
                                    className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 mr-4"
                                  >
                                    Set as main
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    const fs: File[] = [...files];
                                    fs.splice(index, 1);
                                    setFiles(fs);
                                  }}
                                  className="inline-flex items-center rounded border border-red-300 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 mr-4"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="flex flex-row items-center space-x-2">
              <div className="mr-2 mt-2">
                <PureKysoButton type={!hasPermissionCreateReport ? KysoButton.PRIMARY_DISABLED : KysoButton.PRIMARY} onClick={handleSubmit} className="ml-2">
                  {busy && <PureSpinner size={5} />}
                  Post <ArrowRightIcon className="ml-2 w-4 h-4" />
                </PureKysoButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToasterNotification
        show={showToaster}
        setShow={setShowToaster}
        icon={busy ? <InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" /> : <ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />}
        message={messageToaster}
        backgroundColor={TailwindColor.SLATE_50}
      />
    </div>
  );
};

CreateReport.layout = KysoApplicationLayout;

export default CreateReport;
