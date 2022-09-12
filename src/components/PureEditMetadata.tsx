import type { ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import { Fragment, useState } from 'react';
// import { CopyToClipboard } from 'react-copy-to-clipboard';
import ManageUsers from '@/components/ManageUsers';
import { Dialog, Transition } from '@headlessui/react';
import type { CommonData } from '@/types/common-data';
import { LinkIcon, PlusIcon } from '@heroicons/react/solid';
// import PureNotification from '@/components/PureNotification';
import type { Member } from '../types/member';
import PureAvatarGroup from './PureAvatarGroup';

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
  const { isOpen, setOpen, report, authors, users, commonData, members, onUpdateRoleMember, onInviteNewUser, onRemoveUser } = props;

  const [title, setTitle] = useState(report.title || '');
  const [description, setDescription] = useState(report.description || '');
  // const [notification, setNotification] = useState('');
  // const [notificationType, setNotificationType] = useState('');
  // const [newAuthors, setAuthors] = useState(authors || []);
  // const [picture, setPicture] = useState([]);

  return (
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
                            {/* <p className="text-sm text-gray-500">Edit here how the report is display in .</p> */}
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

                        {/* Team members */}
                        <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Authors</h3>
                          </div>
                          <div className="sm:col-span-2">
                            <div className="flex space-x-2">
                              <PureAvatarGroup data={authors}></PureAvatarGroup>
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              >
                                <span className="sr-only">Add author</span>
                                <PlusIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Privacy */}
                        <fieldset className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                          <legend className="sr-only">Privacy</legend>
                          <div className="text-sm font-medium text-gray-900" aria-hidden="true">
                            Privacy
                          </div>
                          <div className="space-y-5 sm:col-span-2">
                            <ManageUsers
                              commonData={commonData}
                              members={members}
                              onInputChange={(query: string) => onRemoveUser(query)}
                              users={users}
                              showTeamRoles={true}
                              onUpdateRoleMember={onUpdateRoleMember}
                              onInviteNewUser={onInviteNewUser}
                              onRemoveUser={onRemoveUser}
                            />
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
                            <hr className="border-gray-200" />
                            <div className="space-between sm:space-between flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0">
                              <div className="flex-1">
                                {/* <div className="text-left">{notification && <PureNotification message={notification} type={notificationType} />}</div> */}
                                {/* <CopyToClipboard
                                text={`${baseUrl}/${slugify(
                                  ifNullReturnDefault(organizationName, "")
                                )}/${slugify(
                                  ifNullReturnDefault(teamName, "")
                                )}/${slugify(
                                  ifNullReturnDefault(reportName, "")
                                )}/share`}
                                onCopy={() =>{
                                  setNotificationType('success');
                                  setNotification('Copy on your clipboard');
                                > */}
                                <a href="#" className="group flex items-center space-x-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-900">
                                  <LinkIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-900" aria-hidden="true" />
                                  <span>Copy shareable link</span>
                                </a>
                                {/* </CopyToClipboard> */}
                              </div>
                              {/* <div>
                                <a href="#" className="group flex items-center space-x-2.5 text-sm text-gray-500 hover:text-gray-900">
                                  <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                                  <span>Learn more about sharing</span>
                                </a>
                              </div> */}
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
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
  );
};

export default PureEditMetadata;
