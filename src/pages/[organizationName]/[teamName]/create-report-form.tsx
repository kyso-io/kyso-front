/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-continue */
import MemberFilterSelector from '@/components/MemberFilterSelector';
import PureKysoButton from '@/components/PureKysoButton';
import { PureSpinner } from '@/components/PureSpinner';
import TagsFilterSelector from '@/components/TagsFilterSelector';
import classNames from '@/helpers/class-names';
import { removeLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import slugify from '@/helpers/slugify';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import { KysoButton } from '@/types/kyso-button.enum';
import { Menu, Transition } from '@headlessui/react';
import { FolderAddIcon } from '@heroicons/react/outline';
import { ArrowRightIcon, ExclamationCircleIcon, InformationCircleIcon, SelectorIcon } from '@heroicons/react/solid';
import type { File as KysoFile, KysoSetting, NormalizedResponseDTO, ResourcePermissions, Tag, TeamMember, UserDTO } from '@kyso-io/kyso-model';
import { KysoConfigFile, KysoSettingsEnum, ReportDTO, ReportPermissionsEnum, ReportType } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import 'easymde/dist/easymde.min.css';
import FormData from 'form-data';
import JSZip from 'jszip';
import { useRouter } from 'next/router';
import type { ChangeEvent, ReactElement } from 'react';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import CaptchaModal from '../../../components/CaptchaModal';
import { ForbiddenCreateReport } from '../../../components/ForbiddenCreateReport';
import { RegisteredUsersAlert } from '../../../components/RegisteredUsersAlert';
import ToasterNotification from '../../../components/ToasterNotification';
import { checkJwt } from '../../../helpers/check-jwt';
import { HelperPermissions } from '../../../helpers/check-permissions';
import { Helper } from '../../../helpers/Helper';

interface TmpReportFile {
  id: string | null;
  name: string;
  size: number;
  main: boolean;
  file: File | null;
}

interface Props {
  commonData: CommonData;
  setUser: (user: UserDTO) => void;
}

const CreateReport = ({ commonData, setUser }: Props) => {
  const router = useRouter();
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
  const [toasterIcon, setIcon] = useState<ReactElement>(<InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />);
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);
  const inputRef = useRef<any>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState<boolean>(false);
  const [description, setDescription] = useState('');
  const [selectedTags, setTags] = useState<string[]>([]);
  const [channelMembers, setChannelMembers] = useState<TeamMember[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<TeamMember[]>(channelMembers);
  const [allowedTags, setAllowedTags] = useState<string[]>([]);
  const [openChannelDropdown, setOpenChannelDropdown] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState<ResourcePermissions | null>(null);
  const hasPermissionCreateReport: boolean = useMemo(() => {
    if (!commonData.permissions) {
      return false;
    }
    if (!commonData.organization) {
      return false;
    }
    const orgResourcePermissions: ResourcePermissions | undefined = commonData.permissions.organizations!.find(
      (resourcePermissions: ResourcePermissions) => resourcePermissions.id === commonData.organization!.id,
    );
    if (!orgResourcePermissions) {
      return false;
    }
    if (commonData.team) {
      return HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.CREATE);
    }
    const teamsResourcePermissions: ResourcePermissions[] = commonData.permissions.teams!.filter((resourcePermissions: ResourcePermissions) => {
      const copyCommonData: any = { ...commonData };
      copyCommonData.team = {
        id: resourcePermissions.id,
      };
      return HelperPermissions.checkPermissions(copyCommonData, ReportPermissionsEnum.CREATE);
    });
    if (teamsResourcePermissions.length > 0) {
      return true;
    }
    return HelperPermissions.checkPermissions(commonData, ReportPermissionsEnum.CREATE);
  }, [commonData.permissions, commonData.organization]);
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);
  const teamsResourcePermissions: ResourcePermissions[] = useMemo(() => {
    if (!commonData.organization) {
      return [];
    }
    if (!commonData.permissions || !commonData.permissions.teams) {
      return [];
    }
    return commonData.permissions.teams.filter((teamResourcePermissions: ResourcePermissions) => {
      const sameOrg: boolean = teamResourcePermissions.organization_id === commonData.organization!.id;
      const cd: any = { ...commonData, team: teamResourcePermissions };
      const hasPermissionInOrg: boolean = HelperPermissions.checkPermissions(cd, ReportPermissionsEnum.CREATE);
      return sameOrg && hasPermissionInOrg;
    });
  }, [commonData.permissions, commonData.organization]);
  const [report, setReport] = useState<ReportDTO>(ReportDTO.createEmpty());
  const [reportFiles, setReportFiles] = useState<KysoFile[]>([]);
  const [tmpReportFiles, setTmpReportFiles] = useState<TmpReportFile[]>([]);
  const [showCaptchaModal, setShowCaptchaModal] = useState<boolean>(false);
  const [waitForLogging, setWaitForLogging] = useState<boolean>(false);

  const isEdition = () => {
    return report.id !== null && report.id !== '';
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWaitForLogging(true);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

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
        Helper.logError(errorHttp.response.data, errorHttp);
      }
    };
    getData();

    if (report && commonData.user?.id) {
      report.author_ids = [commonData.user!.id];
    }
  }, []);

  useEffect(() => {
    if (!router.query.teamName) {
      return;
    }
    if (!commonData.organization) {
      return;
    }
    if (!commonData.permissions) {
      return;
    }
    if (!commonData.permissions.teams) {
      return;
    }
    const rtps: ResourcePermissions | undefined = commonData.permissions!.teams!.find(
      (resourcePermission: ResourcePermissions) => resourcePermission.organization_id === commonData.organization!.id && resourcePermission.name === router.query.teamName,
    );
    if (!rtps) {
      return;
    }
    setSelectedTeam(rtps);
  }, [router.query?.teamName, commonData.permissions, commonData.organization]);

  useEffect(() => {
    if (!commonData.token) {
      return;
    }
    if (!router.query.reportId) {
      return;
    }
    const getReport = async () => {
      try {
        const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name, commonData.team?.sluglified_name);
        const result: NormalizedResponseDTO<ReportDTO> = await api.getReportById(router.query.reportId as string);
        const r: ReportDTO = result.data;

        const resultFiles: NormalizedResponseDTO<KysoFile[]> = await api.getReportFiles(r.id!, r.last_version);
        setTitle(r.title);
        setDescription(r.description);
        setTags(r.tags);
        const tmpRF: TmpReportFile[] = [];
        for (const file of resultFiles.data) {
          if (Helper.FORBIDDEN_FILES.includes(file.name)) {
            continue;
          }
          tmpRF.push({
            id: file.id!,
            name: file.name,
            size: file.size,
            main: r.main_file_id === file.id,
            file: null,
          });
        }
        setTmpReportFiles(tmpRF);
        setReport(r);
        setReportFiles(resultFiles.data);
      } catch (e) {
        Helper.logError('Unexpected error', e);
      }
    };
    getReport();
  }, [commonData.token, router.query.reportId]);

  useEffect(() => {
    if (!selectedTeam) {
      setChannelMembers([]);
      return;
    }
    if (!commonData.token) {
      return;
    }
    const getChannelMembers = async () => {
      try {
        const api: Api = new Api(commonData.token, commonData.organization?.sluglified_name, selectedTeam.name);
        const result: NormalizedResponseDTO<TeamMember[]> = await api.getTeamAssignees(selectedTeam.id! as string);
        setChannelMembers(result.data);
      } catch (e) {}
    };
    getChannelMembers();
  }, [commonData?.token, selectedTeam]);

  useEffect(() => {
    if (router.query.reportId) {
      return;
    }
    if (!commonData.user) {
      return;
    }
    if (!channelMembers || channelMembers.length === 0) {
      return;
    }
    const currentUser: TeamMember | undefined = channelMembers.find((x: TeamMember) => x.id === commonData.user?.id);
    if (currentUser) {
      setSelectedPeople([currentUser]);
    }
  }, [router.query.reportId, channelMembers, commonData.user]);

  useEffect(() => {
    if (!report) {
      return;
    }
    if (!channelMembers || channelMembers.length === 0) {
      return;
    }
    const sp: TeamMember[] = [];

    for (const authorId of report.author_ids) {
      const author: TeamMember | undefined = channelMembers.find((x: TeamMember) => x.id === authorId);
      if (author) {
        sp.push(author);
      }
    }
    setSelectedPeople(sp);
  }, [report, channelMembers]);

  const cleanStorage = () => {
    removeLocalStorageItem('formTitle');
    removeLocalStorageItem('formDescription');
    removeLocalStorageItem('formSelectedPeople');
    removeLocalStorageItem('formTags');
    removeLocalStorageItem('formFileValues');
    removeLocalStorageItem('formFile');
  };

  const filterTags = async (query?: string) => {
    const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name);
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
    if (!commonData.token) {
      return;
    }
    if (!commonData.organization) {
      return;
    }
    filterTags();
  }, [commonData.token, commonData.organization, commonData.team]);

  const setTitleDelay = (_title: string) => {
    setTitle(_title);
    setShowToaster(false);
    setMessageToaster('');
  };

  const setDescriptionDelay = (_description: string) => {
    setDescription(_description);
  };

  const setSelectedPeopleDelay = (newSelectedPeople: TeamMember[]) => {
    setSelectedPeople(newSelectedPeople as TeamMember[]);
    setMessageToaster('');
  };

  const setTagsDelay = (newTgs: string[]) => {
    setTags(newTgs);
  };

  const createReport = async (e?: any) => {
    if (e) {
      e.preventDefault();
    }
    setShowToaster(false);
    if (!title || title.trim().length === 0) {
      setIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
      setMessageToaster('Title is required.');
      setShowToaster(true);
      return;
    }
    if (selectedTeam === null) {
      setIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
      setMessageToaster('Please select a channel.');
      setShowToaster(true);
      return;
    }
    if (tmpReportFiles.length === 0) {
      setIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
      setMessageToaster('Please upload at least one file.');
      setShowToaster(true);
      return;
    }
    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowCaptchaModal(true);
      return;
    }
    setBusy(true);
    const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, selectedTeam.name);
    try {
      const exists: boolean = await api.reportExists(selectedTeam.id, slugify(title));
      if (exists) {
        setIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
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
    const mainFile: TmpReportFile | undefined = tmpReportFiles.find((x: any) => x.main);
    const kysoConfigFile: KysoConfigFile = new KysoConfigFile(
      mainFile?.name || tmpReportFiles[0]!.name,
      title,
      description,
      commonData.organization!.sluglified_name,
      selectedTeam.name,
      selectedTags,
      ReportType.Markdown,
    );
    kysoConfigFile.authors = selectedPeople.map((person: TeamMember) => person.email);
    delete (kysoConfigFile as any).team;
    const blobKysoConfigFile: Blob = new Blob([JSON.stringify(kysoConfigFile, null, 2)], { type: 'plain/text' });
    const zip = new JSZip();
    zip.file('kyso.json', blobKysoConfigFile, { createFolders: true });
    for (const tmpReportFile of tmpReportFiles) {
      zip.file(tmpReportFile.name, tmpReportFile.file!);
    }
    const blobZip: Blob = await zip.generateAsync({ type: 'blob' });
    const resultKysoSettings: NormalizedResponseDTO<string> = await api.getSettingValue(KysoSettingsEnum.MAX_FILE_SIZE);
    const maxFileSize: number = Helper.parseFileSizeStr(resultKysoSettings.data);
    if (blobZip.size > maxFileSize) {
      setIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
      setMessageToaster(`You exceeded the maximum upload size permitted (${resultKysoSettings.data})`);
      setShowToaster(true);
      setBusy(false);
      return;
    }
    const formData: FormData = new FormData();
    formData.append('file', blobZip);
    setIcon(<InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />);
    setMessageToaster('Uploading report. Please wait ...');
    setShowToaster(true);
    try {
      const { data: newReport }: NormalizedResponseDTO<ReportDTO> = await api.createUiReport(formData);
      cleanStorage();
      setShowToaster(false);
      window.location.href = `/${newReport.organization_sluglified_name}/${newReport.team_sluglified_name}/${newReport.name}`;
      setMessageToaster('Report uploaded successfully.');
    } catch (err: any) {
      setShowToaster(err.response.data.message);
      setBusy(false);
    }
  };

  const updateReport = async (e?: any) => {
    if (e) {
      e.preventDefault();
    }
    setShowToaster(false);
    if (!title || title.trim().length === 0) {
      setIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
      setMessageToaster('Title is required.');
      setShowToaster(true);
      return;
    }
    if (selectedTeam === null) {
      setIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
      setMessageToaster('Please select a channel.');
      setShowToaster(true);
      return;
    }
    if (tmpReportFiles.length === 0) {
      setIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
      setMessageToaster('Please upload at least one file.');
      setShowToaster(true);
      return;
    }
    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowCaptchaModal(true);
      return;
    }
    setBusy(true);
    const unmodifiedFiles: string[] = [];
    const deletedFiles: string[] = [];
    let mainFile: TmpReportFile | null = null;

    for (const tmpReportFile of tmpReportFiles) {
      if (tmpReportFile.main) {
        mainFile = tmpReportFile;
      }
      const kysoFile: KysoFile | undefined = reportFiles.find((kf: KysoFile) => {
        return kf.id === tmpReportFile.id;
      });
      if (kysoFile) {
        unmodifiedFiles.push(kysoFile.id!);
      }
    }

    for (const kysoFile of reportFiles) {
      const tmpReportFile: TmpReportFile | undefined = tmpReportFiles.find((trf: TmpReportFile) => {
        return trf.id === kysoFile.id;
      });
      if (!tmpReportFile) {
        deletedFiles.push(kysoFile.id!);
      }
    }
    const kysoConfigFile: KysoConfigFile = new KysoConfigFile(
      mainFile !== null ? (mainFile as TmpReportFile).name : tmpReportFiles[0]!.name,
      title,
      description,
      commonData.organization!.sluglified_name,
      selectedTeam.name,
      selectedTags,
      ReportType.Markdown,
    );
    kysoConfigFile.authors = selectedPeople.map((person: TeamMember) => person.email);
    delete (kysoConfigFile as any).team;
    const blobKysoConfigFile: Blob = new Blob([JSON.stringify(kysoConfigFile, null, 2)], { type: 'plain/text' });
    const zip: JSZip = new JSZip();
    zip.file('kyso.json', blobKysoConfigFile, { createFolders: true });
    for (const tmpReportFile of tmpReportFiles) {
      if (tmpReportFile.id === null) {
        zip.file(tmpReportFile.name, tmpReportFile.file!);
      }
    }
    const blobZip: Blob = await zip.generateAsync({ type: 'blob' });
    const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, selectedTeam.name);
    const resultKysoSettings: NormalizedResponseDTO<string> = await api.getSettingValue(KysoSettingsEnum.MAX_FILE_SIZE);
    const maxFileSize: number = Helper.parseFileSizeStr(resultKysoSettings.data);
    if (blobZip.size > maxFileSize) {
      setIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
      setMessageToaster(`You exceeded the maximum upload size permitted (${resultKysoSettings.data})`);
      setShowToaster(true);
      setBusy(false);
      return;
    }

    const formData: FormData = new FormData();
    formData.append('file', blobZip);
    formData.append('version', report!.last_version.toString());
    formData.append('unmodifiedFiles', JSON.stringify(unmodifiedFiles));
    formData.append('deletedFiles', JSON.stringify(deletedFiles));
    setIcon(<InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />);
    setMessageToaster('Updating report. Please wait ...');
    setShowToaster(true);
    try {
      const responseUpdateReport: NormalizedResponseDTO<ReportDTO> = await api.updateUiReport(report!.id!, formData);
      cleanStorage();
      setShowToaster(false);
      const updatedReport: ReportDTO = responseUpdateReport.data;
      window.location.href = `/${updatedReport.organization_sluglified_name}/${updatedReport.team_sluglified_name}/${updatedReport.name}`;
      setMessageToaster('Report updated successfully.');
    } catch (err: any) {
      Helper.logError('Unexpected error', err);
      setShowToaster(err.response.data.message);
      setBusy(false);
    }
  };

  const onUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    const copyTmpReportFiles: TmpReportFile[] = [...tmpReportFiles];
    const ignoredFiles: string[] = [];
    for (const file of event.target.files) {
      if (Helper.FORBIDDEN_FILES.includes(file.name)) {
        ignoredFiles.push(file.name);
        continue;
      }
      const index: number = tmpReportFiles.findIndex((f: TmpReportFile) => f.name === file.name);
      if (index === -1) {
        copyTmpReportFiles.push({
          id: null,
          name: file.name,
          size: file.size,
          main: false,
          file,
        });
      } else {
        copyTmpReportFiles[index] = {
          id: null,
          name: file.name,
          size: file.size,
          main: copyTmpReportFiles[index]!.main,
          file,
        };
      }
    }
    if (copyTmpReportFiles.length > 0) {
      const hasMainFile: boolean = copyTmpReportFiles.some((f: TmpReportFile) => f.main);
      if (!hasMainFile) {
        copyTmpReportFiles[0]!.main = true;
      }
    }
    setTmpReportFiles(copyTmpReportFiles);
    if (ignoredFiles.length > 0) {
      setIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
      setMessageToaster(
        ignoredFiles.length === 1
          ? `${ignoredFiles[0]} is a self-generated configuration file. It is not possible to upload it.`
          : `The following files ${ignoredFiles.join(', ')} will not be uploaded. The system will generate a configuration file.`,
      );
      setShowToaster(true);
    }
  };

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

  return userIsLogged ? (
    hasPermissionCreateReport ? (
      <div className="p-4">
        <div className="flex flex-row items-center">
          <div className="w-1/6"></div>
          <div className="w-4/6">
            <div className="flex justify-end">
              <div className="flex flex-row items-center space-x-2">
                <div className="mr-2">Posting into</div>
                <Menu as="div" className="relative w-fit inline-block text-left">
                  <React.Fragment>
                    <Menu.Button
                      onClick={() => {
                        if (isEdition()) {
                          return;
                        }
                        setOpenChannelDropdown(!openChannelDropdown);
                      }}
                      className={clsx(
                        'border-y border p-2 flex items-center w-fit text-sm text-left font-medium text-gray-700 hover:outline-none rounded',
                        isEdition() ? 'bg-slate-300' : 'bg-white hover:bg-gray-100',
                      )}
                    >
                      {selectedTeam ? selectedTeam.display_name : 'Select a channel'}
                      <div className="pl-2">
                        <SelectorIcon className="shrink-0 h-5 w-5 text-gray-700 group-hover:text-gray-500" aria-hidden="true" />
                      </div>
                    </Menu.Button>
                    <Transition
                      show={openChannelDropdown}
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items
                        static
                        className={`z-50 origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg ring-1 ring-slate-200 ring-opacity/5 divide-y divide-gray-100 focus:outline-none`}
                      >
                        <div className="p-2">
                          <div>
                            <h3 className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" id="projects-headline">
                              Channels
                            </h3>
                            <div className="flex flex-col justify-start">
                              {teamsResourcePermissions.length === 0 && (
                                <Menu.Item disabled={isEdition()} key={`empty-channel-${Math.random()}`}>
                                  <span className={classNames('text-gray-600 hover:bg-gray-50 hover:text-gray-900', 'flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer')}>
                                    No channels available
                                  </span>
                                </Menu.Item>
                              )}
                              {teamsResourcePermissions.map((teamResourcePermissions: ResourcePermissions) => (
                                <Menu.Item disabled={isEdition()} key={teamResourcePermissions.id}>
                                  <span
                                    onClick={() => {
                                      setSelectedTeam(teamResourcePermissions);
                                      setShowToaster(false);
                                      setMessageToaster('');
                                      setSelectedPeople([]);

                                      if (report && report.author_ids && report.author_ids!.length === 0) {
                                        if (commonData.user?.id) {
                                          const copyReport: any = { ...report };
                                          copyReport.author_ids = [commonData.user!.id];
                                          setReport(copyReport);
                                        }
                                      }
                                      setOpenChannelDropdown(false);
                                    }}
                                    className={classNames(
                                      teamResourcePermissions.name === selectedTeam?.name ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                      'flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer',
                                    )}
                                  >
                                    {teamResourcePermissions.display_name}
                                  </span>
                                </Menu.Item>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </React.Fragment>
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
                  disabled={isEdition()}
                  onChange={(e) => setTitleDelay(e.target.value)}
                  placeholder="Title"
                  className={clsx('p-0 focus:shadow-sm 0 block w-full border-white border-0 rounded-md text-3xl font-medium focus:text-gray-500 text-gray-900')}
                />
                <textarea
                  style={{
                    border: 'none',
                    resize: 'none',
                    outline: 'none',
                    overflow: 'auto',
                    WebkitBoxShadow: 'none',
                    boxShadow: 'none',
                  }}
                  value={description || ''}
                  placeholder="Description"
                  onChange={(e) => setDescriptionDelay(e.target.value)}
                  rows={5}
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
                      setIcon(<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);
                      setMessageToaster('At least one author is required');
                      setShowToaster(true);
                    }
                  }}
                  emptyMessage={selectedTeam !== null ? 'No authors' : 'First select a channel to add authors'}
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
        <div className="flex flex-row items-center">
          <div className="w-1/6"></div>
          <div className="w-4/6">
            <div className="my-4">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-xl font-semibold text-gray-900">Files</h1>
                  <p className="mt-2 text-sm text-gray-700">list of files that make up the report.</p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                  <PureKysoButton type={busy ? KysoButton.PRIMARY_DISABLED : KysoButton.PRIMARY} disabled={busy} onClick={() => inputRef.current.click()}>
                    <div className="flex flex-row items-center">
                      <FolderAddIcon className="w-4 h-4 mr-2" />
                      <span>Add files</span>
                    </div>
                  </PureKysoButton>
                  <input
                    ref={inputRef}
                    multiple
                    type="file"
                    style={{ display: 'none' }}
                    onChange={onUploadFile}
                    onClick={(e: any) => {
                      e.target.value = null;
                    }}
                  />
                </div>
              </div>
              <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity/5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              Name
                            </th>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              Size
                            </th>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              Main file
                            </th>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {tmpReportFiles.length === 0 ? (
                            <tr className="text-center">
                              <td colSpan={4} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                No files selected
                              </td>
                            </tr>
                          ) : (
                            tmpReportFiles.map((tmpReportFile: TmpReportFile, index: number) => (
                              <tr key={tmpReportFile.name}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{tmpReportFile.name}</td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{Helper.parseFileSize(tmpReportFile.size)}</td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                  <input
                                    checked={tmpReportFile.main}
                                    onChange={() => {
                                      const newTmpReportFiles: TmpReportFile[] = [...tmpReportFiles];
                                      newTmpReportFiles.forEach((newTmpReportFile: TmpReportFile) => {
                                        newTmpReportFile.main = false;
                                      });
                                      newTmpReportFiles[index]!.main = true;
                                      setTmpReportFiles(newTmpReportFiles);
                                    }}
                                    name="main-file"
                                    type="radio"
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  ></input>
                                </td>
                                <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                  <button
                                    onClick={() => {
                                      const fs: TmpReportFile[] = [...tmpReportFiles];
                                      fs.splice(index, 1);
                                      if (tmpReportFile.main && fs.length > 0) {
                                        // The user removed the main, file, we set as main the first one
                                        fs[0]!.main = true;
                                      }
                                      setTmpReportFiles(fs);
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
                  <PureKysoButton
                    type={KysoButton.SECONDARY}
                    onClick={() => {
                      let url = `/${router.query.organizationName}`;
                      if (router.query.teamName) {
                        url += `/${router.query.teamName}`;
                      }
                      router.replace(url);
                    }}
                  >
                    <div className="flex flex-row items-center">Cancel</div>
                  </PureKysoButton>
                </div>
              </div>
              <div className="flex flex-row items-center space-x-2">
                <div className="mr-2 mt-2">
                  <PureKysoButton
                    type={!hasPermissionCreateReport ? KysoButton.PRIMARY_DISABLED : KysoButton.PRIMARY}
                    disabled={!hasPermissionCreateReport || busy}
                    onClick={() => {
                      if (isEdition()) {
                        updateReport();
                      } else {
                        createReport();
                      }
                    }}
                    className="ml-2"
                  >
                    <div className="flex flex-row items-center">
                      {busy && <PureSpinner size={5} />}
                      {isEdition() ? 'Update' : 'Post'} <ArrowRightIcon className="ml-2 w-4 h-4" />
                    </div>
                  </PureKysoButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToasterNotification
          show={showToaster}
          setShow={setShowToaster}
          // icon={busy ? <InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" /> : <ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />}
          icon={toasterIcon}
          message={messageToaster}
        />
        {commonData.user && <CaptchaModal user={commonData.user!} open={showCaptchaModal} onClose={onCloseCaptchaModal} />}
      </div>
    ) : (
      <ForbiddenCreateReport commonData={commonData} />
    )
  ) : (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-2/12"></div>
      <div className="w-8/12 flex flex-col space-y-8">{waitForLogging && <RegisteredUsersAlert />}</div>
    </div>
  );
};

CreateReport.layout = KysoApplicationLayout;

export default CreateReport;
