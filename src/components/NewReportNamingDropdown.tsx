import { useState, Fragment } from 'react';
import type { ElementType } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { CreationReportFileSystemObject } from '@/model/creation-report-file';
import { v4 } from 'uuid';
import classNames from '@/helpers/class-names';

type INewReportNamingDropdown = {
  label: string;
  icon: ElementType;
  isFolder?: boolean;
  parent?: CreationReportFileSystemObject;
  showLabel?: boolean;
  value?: string;
  className?: string;
  okButtonLabel?: string;
  cancelButtonLabel?: string;
  onCreate: (newName: CreationReportFileSystemObject) => void;
};

const handleCreation = (newName: string, isFolder: boolean, onCreate: (newName: CreationReportFileSystemObject) => void, parent?: CreationReportFileSystemObject): void => {
  if (!newName) {
    console.error('newName property was not provided');
    return;
  }

  const fileType: string = newName.split('.').length > 1 ? newName.split('.').pop()! : 'file';

  const fileObject = new CreationReportFileSystemObject(v4(), newName, newName, isFolder ? 'folder' : fileType, '', parent?.id);

  onCreate(fileObject);
};

// Don't know why eslint complains here...
/* eslint-disable  @typescript-eslint/no-explicit-any */
const NewReportNamingDropdown = (props: INewReportNamingDropdown) => {
  const { label, icon: NewIcon, onCreate, isFolder, parent, showLabel } = props;
  const [newName, onHandleName] = useState('');
  let computedIsFolder = false;
  const defaultInputRef: any = null;

  // eslint-disable-next-line @typescript-eslint/naming-convention, unused-imports/no-unused-vars
  const [_inputRef, setInputRef] = useState(defaultInputRef);

  if (isFolder) {
    computedIsFolder = true;
  }

  return (
    <Menu as="div" className={props.className}>
      <Menu.Button className="w-full flex items-center p-3 py-2 rounded mr-1 border-gray-300 text-sm text-gray-700 hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500">
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
                    placeholder={props.value}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    onChange={(event) => {
                      onHandleName(event.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreation(newName, computedIsFolder, onCreate, parent);
                      }
                    }}
                    ref={(input: HTMLInputElement) => {
                      setInputRef(input);
                      if (input) {
                        input.focus();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="w-full sm:max-w-xs mt-6 text-right">
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
                  onClick={() => {
                    handleCreation(newName, computedIsFolder, onCreate, parent);
                  }}
                >
                  {props.okButtonLabel ? props.okButtonLabel : 'Create'}
                </Menu.Button>
              </div>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NewReportNamingDropdown;
