import { CreationReportFileSystemObject } from '@/model/creation-report-file';
import { FilesystemItem } from '@/model/filesystem-item.model';
import UnPureNewReportNamingDropdown from '@/unpure-components/UnPureNewReportNamingDropdown';
import { Menu, Transition } from '@headlessui/react';
import { DocumentIcon, UploadIcon } from '@heroicons/react/outline';
import { DocumentAddIcon, DotsVerticalIcon, FolderAddIcon, FolderIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid';
import React, { Fragment } from 'react';
import classNames from '@/helpers/class-names';

interface FilesystemEntryProps {
  item: FilesystemItem;
  onAddNewFile: (newFile: CreationReportFileSystemObject) => void;
  onRemoveFile: (newfile: CreationReportFileSystemObject) => void;
}

const FilesystemEntry = (props: FilesystemEntryProps) => {   
  const { onRemoveFile, onAddNewFile } = props;

  const appliedPadding = props.item.level * 15;

  const fileType = props.item.file.type;

  let NewIcon = DocumentIcon;
  
  if (fileType === 'folder') {
    NewIcon = FolderIcon;
  }

  return (
    <>
      <div className='inline-flex items-center w-full' style={{paddingLeft: `${appliedPadding}px`}}>
        <button
          className="w-full flex-1 inline-flex items-center hover:text-gray-500"
          // onClick={() => setFileToRender(file)}
        >
          <div className="flex-1 inline-flex items-center">
            <NewIcon className="mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
            <h2>{props.item.file.name}</h2>
          </div>
        </button>
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex justify-center w-full px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
              <DotsVerticalIcon className="-m-1 h-5 w-5 text-gray-400" aria-hidden="true" />
            </Menu.Button>
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
            <Menu.Items className="z-50 origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ro-5 divide-y divide-gray-100 focus:outline-none">
              <div className="py-1">
                {fileType === 'folder' && (
                  <>
                    <UnPureNewReportNamingDropdown
                      label="New file"
                      showLabel={true}
                      icon={DocumentAddIcon}
                      parent={props.item.file}
                      onCreate={(newFile: CreationReportFileSystemObject ) => {
                        if(newFile) {
                          newFile.parentId = props.item.file.id;
                          newFile.path = `${props.item.file.path}/${newFile.name}`;
                          
                          onAddNewFile(newFile);
                        }
                      }}
                    />
                    
                    <UnPureNewReportNamingDropdown
                      label="New folder"
                      showLabel={true}
                      isFolder={true}
                      icon={FolderAddIcon}
                      parent={props.item.file}
                      onCreate={(newFile: CreationReportFileSystemObject ) => {
                        if(newFile) {
                          newFile.parentId = props.item.file.id;
                          newFile.path = `${props.item.file.path}/${newFile.name}`;
                          
                          onAddNewFile(newFile);
                        }
                      }}
                    />

                    <Menu.Item>
                      {({ active }) => (
                        <a onClick={() => console.log('Upload')} className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm')}>
                          <UploadIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                          Upload
                        </a>
                      )}
                    </Menu.Item>
                  </>
                )}
                <Menu.Item>
                  <button
                    className={'group flex items-center px-4 py-2 text-sm'}
                    onClick={() => {
                      onAddNewFile(props.item.file);
                    }}
                  >
                    <PencilAltIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                    Rename
                  </button>
                </Menu.Item>
                <Menu.Item>
                  <button
                    className={'group flex items-center px-4 py-2 text-sm'}
                    onClick={() => {
                      onRemoveFile(props.item.file);
                    }}
                  >
                    <TrashIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                    Delete
                  </button>
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      {props.item.children.map((item: FilesystemItem) => (
        <FilesystemEntry item={item} 
          onAddNewFile={() => {
            onAddNewFile!(item.file)
          }}
          onRemoveFile={() => {
            onRemoveFile!(item.file)
          }} 
        />
      ))}
    </>
  );
};

export default FilesystemEntry;
