/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReportDTO, UserDTO, NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { UpdateReportRequestDTO } from '@kyso-io/kyso-model';
import { Fragment, useState, useRef, useEffect } from 'react';
// import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toSvg } from 'jdenticon';
import { Dialog, Transition } from '@headlessui/react';
import type { CommonData } from '@/types/common-data';
import { InformationCircleIcon, PlusSmIcon as PlusSmIconSolid } from '@heroicons/react/solid';
// import PureNotification from '@/components/PureNotification';
// import { useRouter } from 'next/router';
import { Chips } from 'primereact/chips';
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // theme
import 'primereact/resources/primereact.min.css'; // core css
import 'primeicons/primeicons.css'; // icons
import { Api } from '@kyso-io/kyso-store';
import { TailwindColor } from '@/tailwind/enum/tailwind-color.enum';
import { useRouter } from 'next/router';
import ToasterNotification from './ToasterNotification';
import type { Member } from '../types/member';

interface IPureEditMetadata {
  report: ReportDTO;
  isOpen: boolean;
  setOpen: () => void;
  commonData: CommonData;
  members: Member[];
  users: UserDTO[];
  authors: UserDTO[];
  onInputChange: (query: string) => void;
  showTeamRoles: boolean;
  onUpdateRoleMember: (userId: string, organizationRole: string, teamRole?: string) => void;
  onInviteNewUser: (email: string, organizationRole: string, teamRole?: string) => void;
  onRemoveUser: (userId: string) => void;
}

const PureEditMetadata = (props: IPureEditMetadata) => {
  const { isOpen, setOpen, report, authors } = props;
  // const router = useRouter();
  const router = useRouter();
  const [title, setTitle] = useState(report.title || '');
  const [description, setDescription] = useState(report.description || '');
  const [tags, setTags] = useState(report.tags || []);
  // const [notification, setNotification] = useState('');
  // const [notificationType, setNotificationType] = useState('');
  const [newAuthors, setNewAuthors] = useState(authors.map((x) => x.email) || []);
  const [picture, setPicture] = useState<string>();

  useEffect(() => {
    if (report.preview_picture) {
      setPicture(report.preview_picture);
    } else {
      const svgString = toSvg(report.title, 400);
      setPicture(`data:image/svg+xml;charset=utf8,${encodeURIComponent(svgString)}`);
    }
  }, []);

  // const backgroundImage: string = report.preview_picture ? report.preview_picture : BACKGROUND_IMAGE;
  const imageInputFileRef = useRef<any>(null);
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');

  const updateReportMetadata = async () => {
    try {
      setShowToaster(true);
      setMessageToaster('Uploading image...');
      const api: Api = new Api(props.commonData.token);

      api.setOrganizationSlug(props.commonData.organization?.sluglified_name!);
      api.setTeamSlug(props.commonData.team?.sluglified_name!);

      const updateReportRequest: UpdateReportRequestDTO = new UpdateReportRequestDTO(title, description, report.show_code, report.show_output, report.main_file, tags, newAuthors);
      const response: NormalizedResponseDTO<ReportDTO> = await api.updateReport(props.report.id!, updateReportRequest);
      console.log(response.data);

      setMessageToaster('Report updated successfully!');
      setTimeout(() => {
        setShowToaster(false);
        router.reload();
      }, 1500);
    } catch (ex) {
      setMessageToaster('An error occurred updating the report. Please try again');
      setTimeout(() => {
        setShowToaster(false);
      }, 3000);
    }
  };

  const onChangeBackgroundImage = async (file: File) => {
    if (!file) {
      return;
    }

    try {
      setShowToaster(true);
      setMessageToaster('Uploading image...');
      const api: Api = new Api(props.commonData.token);
      api.setOrganizationSlug(props.commonData.organization?.sluglified_name!);
      api.setTeamSlug(props.commonData.team?.sluglified_name!);

      const response: NormalizedResponseDTO<ReportDTO> = await api.updateReportImage(props.report.id!, file);
      console.log(response.data);
      setPicture(response.data.preview_picture);

      setMessageToaster('Image uploaded successfully!');
      setTimeout(() => {
        setShowToaster(false);
      }, 3000);
    } catch (e) {
      setMessageToaster('An error occurred uploading the image. Please try again');
      setTimeout(() => {
        setShowToaster(false);
      }, 3000);
    }
  };

  return (
    <>
      <ToasterNotification
        show={showToaster}
        setShow={setShowToaster}
        message={messageToaster}
        backgroundColor={TailwindColor.SLATE_50}
        icon={<InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />}
      />

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <div className="fixed inset-0 opacity-30 bg-slate-700" />

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                    <form className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="bg-gray-50 px-4 py-6 sm:px-6">
                          <div className="flex items-start justify-between space-x-3">
                            <div className="space-y-1">
                              <Dialog.Title className="text-lg font-medium text-gray-900">Edit report metadata</Dialog.Title>
                            </div>
                            <div className="flex h-7 items-center">
                              <button type="button" className="text-gray-400 hover:text-gray-500" onClick={() => setOpen()}>
                                <span className="sr-only">Close panel</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                  <path
                                    fillRule="evenodd"
                                    d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Divider container */}
                        <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
                          <div className="pb-1 sm:pb-6">
                            <div>
                              {/* Preview picture */}
                              <div className="relative h-40 sm:h-56">
                                <img className="absolute h-full w-full object-cover opacity-70" src={picture} alt="preview picture" />
                                <div className="absolute top-5 right-5">
                                  <button
                                    type="button"
                                    onClick={() => imageInputFileRef.current.click()}
                                    className="inline-flex items-center p-1 border border-gray-200  rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    title="Change background image"
                                  >
                                    <PlusSmIconSolid className="h-5 w-5" aria-hidden="true" />
                                  </button>
                                  <input
                                    ref={imageInputFileRef}
                                    type="file"
                                    accept="image/*"
                                    onClick={(event: any) => {
                                      event.target.value = null;
                                    }}
                                    onChange={(e: any) => {
                                      if (e.target.files.length > 0) {
                                        onChangeBackgroundImage(e.target.files[0]);
                                      }
                                    }}
                                    style={{ display: 'none' }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Project name */}
                          <div className="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                            <div>
                              <label htmlFor="title" className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
                                Title
                              </label>
                            </div>
                            <div className="sm:col-span-2">
                              <input
                                type="text"
                                name="title"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          {/* Project description */}
                          <div className="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                            <div>
                              <label htmlFor="description" className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
                                Description
                              </label>
                            </div>
                            <div className="sm:col-span-2">
                              <textarea
                                id="description"
                                name="description"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                defaultValue={''}
                              />
                            </div>
                          </div>

                          {/* Authors */}
                          <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">Authors</h3>
                            </div>
                            <div className="sm:col-span-2">
                              <div className="flex space-x-2">
                                <Chips
                                  value={newAuthors}
                                  onChange={(e) => {
                                    setNewAuthors(e.value);
                                  }}
                                ></Chips>
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">Tags</h3>
                            </div>
                            <div className="sm:col-span-2">
                              <Chips
                                value={tags}
                                onChange={(e) => {
                                  setTags(e.value);
                                }}
                              ></Chips>
                            </div>
                          </div>

                          {/* Privacy */}
                          <fieldset style={{ display: 'none' }} className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                            <legend className="sr-only">Privacy</legend>
                            <div className="text-sm font-medium text-gray-900" aria-hidden="true">
                              Privacy
                            </div>
                            <div className="space-y-5 sm:col-span-2">
                              <div className="space-y-5 sm:mt-0">
                                <div className="relative flex items-start">
                                  <div className="absolute flex h-5 items-center">
                                    <input
                                      id="public-access"
                                      name="privacy"
                                      aria-describedby="public-access-description"
                                      type="radio"
                                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                      defaultChecked
                                    />
                                  </div>
                                  <div className="pl-7 text-sm">
                                    <label htmlFor="public-access" className="font-medium text-gray-900">
                                      Public access
                                    </label>
                                    <p id="public-access-description" className="text-gray-500">
                                      Everyone with the link will see this project
                                    </p>
                                  </div>
                                </div>
                                <div className="relative flex items-start">
                                  <div className="absolute flex h-5 items-center">
                                    <input
                                      id="restricted-access"
                                      name="privacy"
                                      aria-describedby="restricted-access-description"
                                      type="radio"
                                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                  </div>
                                  <div className="pl-7 text-sm">
                                    <label htmlFor="restricted-access" className="font-medium text-gray-900">
                                      Private to Project Members
                                    </label>
                                    <p id="restricted-access-description" className="text-gray-500">
                                      Only members of this project would be able to access
                                    </p>
                                  </div>
                                </div>
                                <div className="relative flex items-start">
                                  <div className="absolute flex h-5 items-center">
                                    <input
                                      id="private-access"
                                      name="privacy"
                                      aria-describedby="private-access-description"
                                      type="radio"
                                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                  </div>
                                  <div className="pl-7 text-sm">
                                    <label htmlFor="private-access" className="font-medium text-gray-900">
                                      Private to you
                                    </label>
                                    <p id="private-access-description" className="text-gray-500">
                                      You are the only one able to access this project
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => setOpen()}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => updateReportMetadata()}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default PureEditMetadata;
