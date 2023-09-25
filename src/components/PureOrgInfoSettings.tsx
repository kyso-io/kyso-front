import classNames from '@/helpers/class-names';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import React, { useRef, useState } from 'react';
import { PureSpinner } from './PureSpinner';

// const team = [
//   {
//     name: 'Calvin Hawkins',
//     email: 'calvin.hawkins@example.com',
//     imageUrl: 'https://images.unsplash.com/photo-1513910367299-bce8d8a0ebf6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
//   },
//   {
//     name: 'Bessie Richards',
//     email: 'bessie.richards@example.com',
//     imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
//   },
//   {
//     name: 'Floyd Black',
//     email: 'floyd.black@example.com',
//     imageUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
//   },
// ];

type Props = {
  isBusy: boolean;
  onCreateOrganization: (orgName: string, bio: string, link: string, location: string, file: File | null) => void;
  setError: (arg: string) => void;
  error: string | null;
};

const PureOrgInfoSettings = ({ isBusy, onCreateOrganization, setError, error }: Props) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const ref = useRef<any>(null);
  const [orgName, setOrgName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [urlLocalFile, setUrlLocalFile] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const onChangeInputFile = (e: any) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUrlLocalFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <>
      <main className="mx-auto max-w-lg px-4 pt-10 pb-12 lg:pb-16">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-medium leading-6 text-gray-900">Create a new organization</h1>
            <p className="mt-3 text-sm text-gray-500">Let’s get started by filling in the information below to create your new organization.</p>
          </div>

          <div className="pt-3">
            <p className="text-sm font-medium text-gray-700 mt-3" aria-hidden="true">
              Photo
            </p>
            <div className="mt-1">
              <div className="flex items-center">
                <div className="inline-block h-24 w-24 shrink-0 overflow-hidden rounded-full mr-5" aria-hidden="true">
                  {urlLocalFile === null && <FontAwesomeIcon style={{ height: '100px', color: '#bbb' }} icon={faCamera} />}
                  {urlLocalFile !== null && <img className="h-full w-full rounded-full" src={urlLocalFile} alt="" />}
                </div>
                {urlLocalFile !== null && (
                  <button
                    disabled={isBusy}
                    onClick={() => {
                      setFile(null);
                      setUrlLocalFile(null);
                    }}
                    className="rounded-md border border-red-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-red-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Remove
                  </button>
                )}
                <div className="ml-5">
                  <div className="group relative flex items-center justify-center ">
                    <label htmlFor="org-photo" className="pointer-events-none relative text-sm font-medium leading-4 text-gray-700">
                      <button
                        disabled={isBusy}
                        onClick={() => ref.current.click()}
                        className="rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        {urlLocalFile !== null ? 'Change' : 'Select'}
                      </button>
                      <span className="sr-only"> org photo</span>
                    </label>

                    <input
                      ref={ref}
                      id="org-photo"
                      name="org-photo"
                      type="file"
                      accept="image/*"
                      onClick={(event: any) => {
                        event.target.value = null;
                      }}
                      onChange={onChangeInputFile}
                      className="absolute h-full w-full cursor-pointer rounded-md border-gray-300 opacity-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="location"
                id="location"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                value={orgName}
                onChange={(e) => {
                  setError('');
                  setOrgName(e.target.value);
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="bio"
                name="bio"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700">
              Link
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="link"
                id="link"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                value={link}
                onChange={(e) => {
                  setError('');
                  setLink(e.target.value);
                }}
              />
            </div>
          </div>
          <div>
            <label htmlFor="org-name" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="org-name"
                id="org-name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                value={location}
                onChange={(e) => {
                  setError('');
                  setLocation(e.target.value);
                }}
              />
            </div>
          </div>
          {/* <div className="space-y-2">
              <div className="space-y-1">
                <label htmlFor="add-team-members" className="block text-l font-medium text-gray-900 pt-6">
                  Add Team Members
                </label>
                <p id="add-team-members-helper" className="sr-only">
                  Search by email address
                </p>
                <div className="flex">
                  <div className="grow">
                    <input
                      type="text"
                      name="add-team-members"
                      id="add-team-members"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                      placeholder="Email address"
                      aria-describedby="add-team-members-helper"
                    />
                  </div>
                  <span className="ml-3">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                    >
                      <PlusIcon className="-ml-2 mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                      <span>Add</span>
                    </button>
                  </span>
                </div>
              </div>

              <div className="border-b border-gray-200">
                <ul role="list" className="divide-y divide-gray-200">
                  {team.map((person) => (
                    <li key={person.email} className="flex py-4">
                      <img className="h-10 w-10 rounded-full" src={person.imageUrl} alt="" />
                      <div className="ml-3 flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{person.name}</span>
                        <span className="text-sm text-gray-500">{person.email}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div> */}

          <div className="text-red-500 text-sm text-left pr-3">{error}</div>
          <div className="flex justify-end pt-5 items-center">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              className={classNames(
                error ? 'opacity-75 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900',
                'ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white k-bg-primary ',
              )}
              onClick={() => onCreateOrganization(bio, orgName, link, location, file)}
            >
              {!isBusy && <React.Fragment>Create organization</React.Fragment>}
              {isBusy && (
                <React.Fragment>
                  <PureSpinner size={5} /> Creating organization
                </React.Fragment>
              )}
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default PureOrgInfoSettings;
