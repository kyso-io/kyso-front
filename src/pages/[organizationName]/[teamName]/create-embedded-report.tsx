/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-continue */
import MemberFilterSelector from '@/components/MemberFilterSelector';
import PureKysoButton from '@/components/PureKysoButton';
import { PureSpinner } from '@/components/PureSpinner';
import { SomethingHappened } from '@/components/SomethingHappened';
import TagsFilterSelector from '@/components/TagsFilterSelector';
import classNames from '@/helpers/class-names';
import { removeLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { KysoButton } from '@/types/kyso-button.enum';
import { Menu, Transition } from '@headlessui/react';
import { ArrowRightIcon, SelectorIcon } from '@heroicons/react/solid';
import type { NormalizedResponseDTO, ResourcePermissions, Tag, TeamMember } from '@kyso-io/kyso-model';
import { TeamVisibilityEnum, KysoConfigFile, ReportDTO, ReportPermissionsEnum, ReportType } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import 'easymde/dist/easymde.min.css';
import FormData from 'form-data';
import JSZip from 'jszip';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { RegisteredUsersAlert } from '@/components/RegisteredUsersAlert';
import { checkJwt } from '@/helpers/check-jwt';
import { HelperPermissions } from '@/helpers/check-permissions';
import { Helper } from '@/helpers/Helper';
import { ToasterIcons } from '@/enums/toaster-icons';

const CreateEmbeddedReport = ({ commonData, showToaster, hideToaster, isCurrentUserVerified, isCurrentUserSolvedCaptcha, isUserLogged }: IKysoApplicationLayoutProps) => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState<boolean>(false);
  const [description, setDescription] = useState('');
  const [selectedTags, setTags] = useState<string[]>([]);
  const [url, setUrl] = useState<string>('');
  const [protocol, setProtocol] = useState<string>('https://');
  const [channelMembers, setChannelMembers] = useState<TeamMember[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<TeamMember[]>(channelMembers);
  const [allowedTags, setAllowedTags] = useState<string[]>([]);
  const [openChannelDropdown, setOpenChannelDropdown] = useState<boolean>(false);
  const [openProtocolDropdown, setOpenProtocolDropdown] = useState<boolean>(false);
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
    if (!commonData.user) {
      return undefined;
    }
    const interval = setInterval(() => {
      const validJwt: boolean = checkJwt();
      if (!validJwt) {
        router.replace('/logout');
      }
    }, Helper.CHECK_JWT_TOKEN_MS);
    return () => clearInterval(interval);
  }, [commonData.user]);

  useEffect(() => {
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
    const api: Api = new Api(commonData.token);
    api.setOrganizationSlug(commonData.organization!.sluglified_name);
    if (commonData.team) {
      api.setTeamSlug(commonData.team?.sluglified_name);
    }
    const queryObj: any = {
      filter: {
        organization_id: commonData.organization!.id,
      },
    };
    if (commonData.team && commonData.team.visibility === TeamVisibilityEnum.PRIVATE) {
      queryObj.filter.team_id = commonData.team.id;
    }
    if (query) {
      queryObj.filter.search = query;
    }
    const result: NormalizedResponseDTO<Tag[]> = await api.getTags(queryObj);
    setAllowedTags(result.data.map((t: Tag) => t.name));
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
    hideToaster();
  };

  const setDescriptionDelay = (_description: string) => {
    setDescription(_description);
  };

  const setSelectedPeopleDelay = (newSelectedPeople: TeamMember[]) => {
    setSelectedPeople(newSelectedPeople as TeamMember[]);
    hideToaster();
  };

  const setTagsDelay = (newTgs: string[]) => {
    setTags(newTgs);
  };

  const getEmbeddedReportHTML = (htmlTitle: string, htmlUrl: string): string => {
    return `
      <!DOCTYPE html>
      <html lang="EN" xml:lang="en">
        <head>
          <meta charset="utf-8">
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono:400,500&amp;amp;display=swap">
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <title>${htmlTitle}</title>
          <script type="text/javascript"></script>
        </head>
        <body>
          <iframe title="${htmlTitle}" id="theframe" style="width: 100%; height: 950px; border: none;" sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups" src="${htmlUrl}"></iframe>
          <script type="text/javascript">
            function onInitIFrame() {
              try {
                const myIframe = document.getElementById('theframe');
                setTimeout(() => {
                    setHeight(myIframe.contentWindow.document.body.scrollHeight + 20px");
                }, 1500);
              } catch (ex) {
              }
            }
          </script>
        </body>
      </html>
    `;
  };

  const createReport = async (e?: any) => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    if (e) {
      e.preventDefault();
    }

    hideToaster();

    if (!title || title.trim().length === 0) {
      showToaster('Title is required', ToasterIcons.INFO);
      return;
    }
    if (selectedTeam === null) {
      showToaster('Please select a channel', ToasterIcons.INFO);
      return;
    }
    if (!url || url.trim().length === 0) {
      showToaster('URL is required', ToasterIcons.INFO);
      return;
    }
    if (!Helper.isValidUrlWithProtocol(protocol + url)) {
      showToaster('URL is not valid', ToasterIcons.INFO);
      return;
    }

    setBusy(true);
    const api: Api = new Api(commonData.token, commonData.organization!.sluglified_name, selectedTeam.name);
    try {
      const exists: boolean = await api.reportExists(selectedTeam.id, Helper.slugify(title));
      if (exists) {
        showToaster('A report with this name already exists. Please consider to change the title', ToasterIcons.INFO);
        setBusy(false);
        return;
      }
    } catch (er: any) {
      showToaster(er.response.data.message, ToasterIcons.ERROR);
      setBusy(false);
      return;
    }
    const kysoConfigFile: KysoConfigFile = new KysoConfigFile('index.html', title, description, commonData.organization!.sluglified_name, selectedTeam.name, selectedTags, ReportType.Markdown);
    kysoConfigFile.authors = selectedPeople.map((person: TeamMember) => person.email);
    kysoConfigFile.url = protocol + url;
    delete (kysoConfigFile as any).team;
    const zip = new JSZip();
    const blobKysoConfigFile: Blob = new Blob([JSON.stringify(kysoConfigFile, null, 2)], { type: 'plain/text' });
    zip.file('kyso.json', blobKysoConfigFile);
    const blobIndexHtml: Blob = new Blob([getEmbeddedReportHTML(title, protocol + url)], { type: 'plain/text' });
    zip.file('index.html', blobIndexHtml);
    const blobZip: Blob = await zip.generateAsync({ type: 'blob' });
    const formData: FormData = new FormData();
    formData.append('file', blobZip);

    showToaster('Uploading report. Please wait ...', ToasterIcons.INFO);

    try {
      const { data: newReport }: NormalizedResponseDTO<ReportDTO> = await api.createUiReport(formData);
      cleanStorage();
      window.location.href = `/${newReport.organization_sluglified_name}/${newReport.team_sluglified_name}/${newReport.name}`;

      showToaster('Report uploaded successfully', ToasterIcons.INFO);
    } catch (err: any) {
      showToaster(err.response.data.message, ToasterIcons.ERROR);
      setBusy(false);
    }
  };

  if (isUserLogged === null) {
    return null;
  }

  if (hasPermissionCreateReport === null) {
    return null;
  }

  return isUserLogged ? (
    hasPermissionCreateReport ? (
      <div className="p-4">
        <div className="flex flex-row items-center">
          <div className="w-1/6"></div>
          <div className="w-4/6">
            <div className="flex justify-end">
              <div className="flex flex-row items-center space-x-2">
                <div className="mr-2">Posting into</div>
                <Menu as="div" className="relative w-fit inline-block text-left bg-white">
                  <React.Fragment>
                    <Menu.Button
                      onClick={() => {
                        if (isEdition()) {
                          return;
                        }
                        setOpenChannelDropdown(!openChannelDropdown);
                      }}
                      className={clsx(
                        'border p-2 flex items-center w-fit text-sm text-left font-medium text-gray-700 hover:outline-none rounded',
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
                        className={`z-50 bg-white origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg ring-1 ring-slate-200 ring-opacity/5 divide-y divide-gray-100 focus:outline-none`}
                      >
                        <div className="p-2">
                          <div>
                            <h3 className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" id="projects-headline">
                              Channels
                            </h3>
                            <div className="flex flex-col justify-start">
                              {teamsResourcePermissions.length === 0 && (
                                <Menu.Item disabled={isEdition()} key={`empty-channel-${Math.random()}`}>
                                  <span
                                    className={classNames('text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900', 'flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer')}
                                  >
                                    No channels available
                                  </span>
                                </Menu.Item>
                              )}
                              {teamsResourcePermissions.map((teamResourcePermissions: ResourcePermissions) => (
                                <Menu.Item disabled={isEdition()} key={teamResourcePermissions.id}>
                                  <span
                                    onClick={() => {
                                      hideToaster();

                                      setSelectedTeam(teamResourcePermissions);
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
                                      teamResourcePermissions.name === selectedTeam?.name ? 'bg-gray-200 text-gray-900' : 'text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900',
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
                  className={clsx('p-0 focus:shadow-sm block w-full border-white border-0 rounded-md text-3xl font-medium focus:text-gray-500 text-gray-900')}
                />
                <div>
                  <Menu as="div" className="relative w-fit inline-block text-left mr-4" style={{ position: 'relative', bottom: '35px' }}>
                    <Menu.Button
                      className="hover:bg-gray-100 border p-2 flex items-center w-fit text-sm text-left font-medium text-gray-700 hover:outline-none rounded"
                      onClick={() => {
                        setOpenProtocolDropdown(!openProtocolDropdown);
                      }}
                    >
                      {protocol}
                      <div className="pl-2">
                        <SelectorIcon className="shrink-0 h-5 w-5 text-gray-700 group-hover:text-gray-500" aria-hidden="true" />
                      </div>
                    </Menu.Button>

                    <Transition
                      show={openProtocolDropdown}
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="bg-white z-50 origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-slate-200 ring-opacity/5 divide-y divide-gray-100 focus:outline-none">
                        <div className="p-2">
                          <div>
                            <div className="flex flex-col justify-start">
                              <a
                                key="https"
                                onClick={() => {
                                  setProtocol('https://');
                                  setOpenProtocolDropdown(false);
                                }}
                                className={classNames('text-gray-600 hover:bg-gray-50 hover:text-gray-900', 'flex items-center px-3 py-2 text-sm font-medium rounded-md')}
                              >
                                https://
                              </a>
                              <a
                                key="http"
                                onClick={() => {
                                  setProtocol('http://');
                                  setOpenProtocolDropdown(false);
                                }}
                                className={classNames('text-gray-600 hover:bg-gray-50 hover:text-gray-900', 'flex items-center px-3 py-2 text-sm font-medium rounded-md')}
                              >
                                http://
                              </a>
                            </div>
                          </div>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                  <div className="relative inline-block text-left" style={{ width: '85%' }}>
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
                      value={url || ''}
                      disabled={isEdition()}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Url"
                      className={clsx('p-0 focus:shadow-sm w-full block border-white border-0 rounded-md text-xl font-medium focus:text-gray-500 text-gray-900')}
                    />
                  </div>
                </div>
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
                  className="p-0 focus:shadow-sm block w-full h-full focus:w-full  border-white border-0 text-gray-500 sm:text-sm rounded-md"
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
                      hideToaster();
                    } else {
                      showToaster('At least one author is required', ToasterIcons.INFO);
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
            <div className="flex justify-end">
              <div className="flex flex-row items-center space-x-2">
                <div className="mr-2 mt-2">
                  <PureKysoButton
                    type={KysoButton.SECONDARY}
                    onClick={() => {
                      let redirectUrl = `/${router.query.organizationName}`;
                      if (router.query.teamName) {
                        redirectUrl += `/${router.query.teamName}`;
                      }
                      router.replace(redirectUrl);
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
                    onClick={() => createReport()}
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
      </div>
    ) : (
      <>
        <SomethingHappened title="Forbidden resource" description={`Sorry, but you don't have permissions to create reports`} asciiArt="ᕕ(⌐■_■)ᕗ"></SomethingHappened>
      </>
    )
  ) : (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-2/12"></div>
      <div className="w-8/12 flex flex-col space-y-8">{waitForLogging && <RegisteredUsersAlert />}</div>
    </div>
  );
};

CreateEmbeddedReport.layout = KysoApplicationLayout;

export default CreateEmbeddedReport;
