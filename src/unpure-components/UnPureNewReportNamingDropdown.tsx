import { useState, Fragment } from 'react';
import type { ElementType } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { CreationReportFileSystemObject } from '@/model/creation-report-file';
import { v4 } from 'uuid';

type IUnPureNewReportNamingDropdown = {
  label: string;
  icon: ElementType;
  isFolder?: boolean;
  parent?: CreationReportFileSystemObject;  
  showLabel?: boolean;
  onCreate: (newName: CreationReportFileSystemObject) => void;
};

const UnPureNewReportNamingDropdown = (props: IUnPureNewReportNamingDropdown) => {
  const { label, icon: NewIcon, onCreate, isFolder, parentId, showLabel } = props;
  const [newName, onHandleName] = useState('');
  let computedIsFolder = false;
  
  if(isFolder) {
    computedIsFolder = true;
  }
  
  return (
    <>
      <Menu as="div" className="z-50 relative inline-block text-left">
        <div>
          {!showLabel && (<>
            <Menu.Button className="-ml-px relative inline-flex items-center px-3 py-2 rounded mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
              <NewIcon className="-m-1 h-5 w-5 text-gray-400" aria-hidden="true" />
            </Menu.Button>
          </>)}
          
          {showLabel && (<>
            <Menu.Button>
              <div className={'group flex items-center px-4 py-2 text-sm'}>
                <NewIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                {label}
              </div>
            </Menu.Button>
          </>)}
         </div> 

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="origin-top-right absolute  mt-2 w-80 sm:rounded-lg shadow-lg bg-white border focus:outline-none ">
            <div className="py-1">
              <div className="px-4 py-5 sm:p-6">
                <div className="w-full sm:max-w-s">
                  <p className="block text-sm font-medium text-gray-700">{label}</p>
                  <div className="relative mt-1">
                    <input
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                      onChange={(event) => {
                        onHandleName(event.target.value);
                      }}
                    />
                  </div>
                </div>
                <div className="w-full sm:max-w-xs mt-6 text-right">
                  <Menu.Button
                    type="reset"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </Menu.Button>
                  <Menu.Button
                    className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      if (!newName) {
                        console.log('Error');
                      }

                      const fileType = newName.split(".").length > 1 ? newName.split(".").pop()! : "unknown";

                      const fileObject = new CreationReportFileSystemObject(
                        v4(),
                        newName,
                        newName,
                        computedIsFolder ? "folder" : fileType,
                        "", 
                        parentId
                      )

                      onCreate(fileObject);
                    }}
                  >
                    Create
                  </Menu.Button>
                </div>
              </div>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      {/* transition see Unpure dropdown */}
    </>
  );
};

export default UnPureNewReportNamingDropdown;
