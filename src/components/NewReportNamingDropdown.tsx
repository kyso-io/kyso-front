/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import classNames from '@/helpers/class-names';
import { CreationReportFileSystemObject } from '@/model/creation-report-file';
import { Menu, Transition } from '@headlessui/react';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
import type { ElementType } from 'react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';
import { Helper } from '../helpers/Helper';
import ToasterNotification from './ToasterNotification';

type INewReportNamingDropdown = {
  label: string;
  icon: ElementType;
  isFolder?: boolean;
  parent?: CreationReportFileSystemObject | null;
  showLabel?: boolean;
  value?: string;
  className?: string;
  okButtonLabel?: string;
  cancelButtonLabel?: string;
  onCreate: (newName: CreationReportFileSystemObject) => void;
  files: CreationReportFileSystemObject[];
};

const NewReportNamingDropdown = (props: INewReportNamingDropdown) => {
  const { label, icon: NewIcon, onCreate, isFolder, parent, showLabel, value, files } = props;
  const [newName, setNewName] = useState(value || '');
  const inputRef: any = useRef<any>(null);
  const refMenuButton = useRef<HTMLButtonElement>(null);
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
  const [errorMessageInput, setErrorMessageInput] = useState<string>('');

  const handleCreation = (e: any): void => {
    if (!newName) {
      setMessageToaster('Please enter a name');
      setShowToaster(true);
      e.preventDefault();
      return;
    }
    const formattedName: string = newName.trim().toLowerCase();
    if (Helper.FORBIDDEN_FILES.includes(formattedName)) {
      setErrorMessageInput(`${formattedName} is a self-generated configuration file`);
      e.preventDefault();
      return;
    }
    if (formattedName.includes(' ')) {
      setErrorMessageInput('Spaces are not allowed');
      e.preventDefault();
      return;
    }
    if (formattedName.includes('/')) {
      setErrorMessageInput('Slashes are not allowed');
      e.preventDefault();
      return;
    }
    if (formattedName.includes('\\')) {
      setErrorMessageInput('Backslashes are not allowed');
      e.preventDefault();
      return;
    }
    if (formattedName.startsWith('.')) {
      setErrorMessageInput('File names cannot start with a dot');
      e.preventDefault();
      return;
    }
    if (formattedName.endsWith('.')) {
      setErrorMessageInput('File names cannot end with a dot');
      e.preventDefault();
      return;
    }
    if (formattedName.length > 50) {
      setErrorMessageInput('File names cannot be longer than 50 characters');
      e.preventDefault();
      return;
    }

    const parentId: string | null = parent ? parent.id : null;

    if (parentId) {
      const existingItem: CreationReportFileSystemObject | undefined = files.find(
        (item: CreationReportFileSystemObject) => item.parentId === parentId && item.name.toLowerCase() === formattedName.toLowerCase(),
      );
      if (existingItem) {
        setErrorMessageInput('A file with this name already exists');
        e.preventDefault();
        return;
      }
    } else {
      const existingItem: CreationReportFileSystemObject | undefined = files.find((item: CreationReportFileSystemObject) => item.name.toLowerCase() === formattedName.toLowerCase());
      if (existingItem) {
        setErrorMessageInput('A file with this name already exists');
        e.preventDefault();
        return;
      }
    }

    const fileType: string = formattedName.split('.').length > 1 ? formattedName.split('.').pop()! : 'file';
    const fileObject: CreationReportFileSystemObject = new CreationReportFileSystemObject(v4(), formattedName, formattedName, isFolder ? 'folder' : fileType, '', parentId);
    onCreate(fileObject);
    setNewName('');
    setMessageToaster('');
    setShowToaster(false);
  };

  return (
    <React.Fragment>
      <Menu>
        {({ open }) => {
          useEffect(() => {
            if (open) {
              setTimeout(() => {
                if (inputRef?.current) {
                  inputRef.current.focus();
                }
              }, 200);
            }
          }, [open]);
          return (
            <div className={props.className}>
              <Menu.Button
                ref={refMenuButton}
                className="w-full flex items-center p-3 py-2 rounded mr-1 border-gray-300 text-sm text-gray-700 hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <NewIcon className={classNames(`h-5 w-5 text-gray-600`, showLabel ? `mr-4` : ``)} aria-hidden="true" />
                {showLabel && label}
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
                <Menu.Items className="z-50 origin-top-right absolute  mt-2 w-80 sm:rounded-lg shadow-lg bg-white border focus:outline-none">
                  <div className="p-4">
                    <div>
                      <div className="w-full sm:max-w-s">
                        <p className="block text-sm font-medium text-gray-700">{label}</p>
                        <div className="relative mt-1">
                          <input
                            placeholder={value}
                            value={newName}
                            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            onChange={(event) => {
                              const name: string = event.target.value || '';
                              setErrorMessageInput('');
                              setNewName(name);
                              setMessageToaster('');
                              setShowToaster(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCreation(e);
                              }
                              if (e.code === 'Space') {
                                setNewName(`${e.target.value} `);
                                e.preventDefault(); // prevent menu close on keyboard select
                              }
                            }}
                            ref={inputRef}
                          />
                        </div>
                        {errorMessageInput && <p className="text-red-500 my-2">{errorMessageInput}</p>}
                      </div>
                      <div className="w-full sm:max-w-xs mt-2 text-right">
                        <Menu.Button
                          type="reset"
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => {}}
                        >
                          {props.cancelButtonLabel ? props.cancelButtonLabel : 'Cancel'}
                        </Menu.Button>
                        <Menu.Button
                          className={`mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                            newName.length > 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'text-slate-200	bg-slate-500'
                          }`}
                          disabled={!(newName.length > 0)}
                          onClick={handleCreation}
                        >
                          {props.okButtonLabel ? props.okButtonLabel : 'Create'}
                        </Menu.Button>
                      </div>
                    </div>
                  </div>
                </Menu.Items>
              </Transition>
            </div>
          );
        }}
      </Menu>
      <ToasterNotification show={showToaster} setShow={setShowToaster} icon={<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />} message={messageToaster} />
    </React.Fragment>
  );
};

export default NewReportNamingDropdown;
