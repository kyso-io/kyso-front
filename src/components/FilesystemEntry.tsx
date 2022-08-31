import type { CreationReportFileSystemObject } from '@/model/creation-report-file';
import type { FilesystemItem } from '@/model/filesystem-item.model';
import NewReportNamingDropdown from '@/components/NewReportNamingDropdown';
import { Menu, Transition } from '@headlessui/react';
import { DocumentAddIcon, DocumentIcon, UploadIcon, FolderAddIcon } from '@heroicons/react/outline';
import { DotsVerticalIcon, FolderIcon, FolderOpenIcon, PencilAltIcon, StarIcon, TrashIcon } from '@heroicons/react/solid';
import type { ChangeEvent } from 'react';
import React, { Fragment, useState } from 'react';
import classNames from '@/helpers/class-names';

interface FilesystemEntryProps {
  item: FilesystemItem;
  onAddNewFile: (newFile: CreationReportFileSystemObject) => void;
  onRemoveFile: (newfile: CreationReportFileSystemObject) => void;
  onSetAsMainFile?: (newMainFile: FilesystemItem) => void;
  onSelectedFile?: (selectedFile: FilesystemItem) => void;
  onUploadFile: (event: ChangeEvent<HTMLInputElement>, parent: FilesystemItem) => void;
  selectedFileId: string;
}

const FilesystemEntry = (props: FilesystemEntryProps) => {
  const { onRemoveFile, item, onAddNewFile, onUploadFile, onSelectedFile, selectedFileId } = props;
  const [open, setOpen] = useState(false);

  const appliedPadding = item.level * 15;

  const hasChildren = item.children && item.children.length > 0;

  const fileType = item.file.type;

  let NewIcon = DocumentIcon;

  if (fileType === 'folder') {
    NewIcon = FolderIcon;
  }

  return (
    <>
      <div className={classNames('inline-flex items-center w-full hover:bg-gray-50', selectedFileId === item.file.id ? 'bg-gray-100' : '')} style={{ paddingLeft: `${appliedPadding}px` }}>
        <button
          onClick={() => {
            if (onSelectedFile) {
              onSelectedFile(item);
            }
          }}
          className={classNames('w-full flex-1 inline-flex items-center ')}
        >
          <div className="flex-1 inline-flex items-center">
            {hasChildren ? <FolderOpenIcon className="mr-1 h-5 w-5 text-gray-400" aria-hidden="true" /> : <NewIcon className="mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />}

            <div>
              {item.file.name} {item.main ? <StarIcon style={{ width: '18px', display: 'initial' }} aria-hidden="true" /> : ''}
            </div>
          </div>
        </button>
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="border-none inline-flex justify-center w-full rounded p-2 text-sm font-medium text-gray-700 hover:bg-gray-200" onClick={() => setOpen(!open)}>
            <DotsVerticalIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Menu.Button>

          <Transition
            as={Fragment}
            // show={open}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className={`z-20 origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-0  border ro-5 divide-y divide-gray-100 focus:outline-none `}>
              <div className="py-1">
                {fileType === 'folder' && (
                  <>
                    <NewReportNamingDropdown
                      label="New file"
                      showLabel={true}
                      icon={DocumentAddIcon}
                      parent={item.file}
                      onCreate={(newFile: CreationReportFileSystemObject) => {
                        if (newFile) {
                          newFile.path = `${item.file.path}/${newFile.name}`;

                          onAddNewFile(newFile);
                          setOpen(false);
                        }
                      }}
                    />

                    <NewReportNamingDropdown
                      label="New folder"
                      showLabel={true}
                      isFolder={true}
                      icon={FolderAddIcon}
                      parent={item.file}
                      onCreate={(newFile: CreationReportFileSystemObject) => {
                        if (newFile) {
                          newFile.path = `${item.file.path}/${newFile.name}`;

                          onAddNewFile(newFile);
                          setOpen(false);
                        }
                      }}
                    />

                    <label
                      htmlFor={`upload-${item.file.id}`}
                      className={classNames('hover:cursor-pointer text-gray-700 hover:bg-gray-100', 'group flex items-center px-4 py-2 text-sm text-gray-400 group-hover:text-gray-500')}
                    >
                      <UploadIcon className="h-5 w-5 mr-3 text-gray-600" aria-hidden="true" />
                      Upload
                      <input
                        style={{ display: 'none' }}
                        className="p-2 h-5 w-5 opacity-0 transition cursor-pointer rounded mr-1 form-control absolute ease-in-out"
                        id={`upload-${item.file.id}`}
                        type="file"
                        multiple
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onUploadFile(e, item)}
                      />
                    </label>
                  </>
                )}

                {fileType === 'file' && (
                  <button
                    className={classNames('w-full hover:cursor-pointer text-gray-700 hover:bg-gray-100', 'group flex items-center px-4 py-2 text-sm text-gray-400 group-hover:text-gray-500')}
                    onClick={() => {
                      if (props.onSetAsMainFile) {
                        props.onSetAsMainFile(item);
                      }
                    }}
                  >
                    <StarIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                    Set as main
                  </button>
                )}

                <NewReportNamingDropdown
                  label="Rename"
                  className="pl-1"
                  showLabel={true}
                  value={item.file.name}
                  icon={PencilAltIcon}
                  okButtonLabel="Rename"
                  onCreate={(newFile: CreationReportFileSystemObject) => {
                    if (newFile) {
                      item.file.name = newFile.name;
                      item.file.path = newFile.path;

                      onAddNewFile(item.file);
                    }
                  }}
                />

                <button
                  className={classNames('w-full hover:cursor-pointer text-gray-700 hover:bg-gray-100', 'group flex items-center px-4 py-2 text-sm text-gray-400 group-hover:text-gray-500')}
                  onClick={() => {
                    onRemoveFile(item.file);
                  }}
                >
                  <TrashIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      {item.children.map((fsItem: FilesystemItem) => (
        <FilesystemEntry
          onUploadFile={onUploadFile}
          selectedFileId={selectedFileId}
          key={fsItem.file.id}
          item={fsItem}
          onSetAsMainFile={(newFile: FilesystemItem) => {
            props.onSetAsMainFile!(newFile);
          }}
          onAddNewFile={(newFile: CreationReportFileSystemObject) => {
            props.onAddNewFile!(newFile);
          }}
          onRemoveFile={(newFile: CreationReportFileSystemObject) => {
            props.onRemoveFile!(newFile);
          }}
          onSelectedFile={(selectedItem: FilesystemItem) => {
            props.onSelectedFile!(selectedItem);
          }}
        />
      ))}
    </>
  );
};

export default FilesystemEntry;
