import { CreationReportFileSystemObject } from '@/model/creation-report-file';
import type { FilesystemItem } from '@/model/filesystem-item.model';
import UnPureNewReportNamingDropdown from '@/unpure-components/UnPureNewReportNamingDropdown';
import { Menu, Transition } from '@headlessui/react';
import { DocumentAddIcon, DocumentIcon, UploadIcon, FolderAddIcon } from '@heroicons/react/outline';
import { DotsVerticalIcon, FolderIcon, FolderOpenIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid';
import type { ChangeEvent } from 'react';
import React, { Fragment, useState } from 'react';
import classNames from '@/helpers/class-names';
import { setLocalStorageItem } from '@/helpers/set-local-storage-item';

interface FilesystemEntryProps {
  item: FilesystemItem;
  onAddNewFile: (newFile: CreationReportFileSystemObject) => void;
  onRemoveFile: (newfile: CreationReportFileSystemObject) => void;
  onSelectedFile?: (selectedFile: FilesystemItem) => void;
  selectedFileId: string;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
  });
};

const FilesystemEntry = (props: FilesystemEntryProps) => {
  const { onRemoveFile, onAddNewFile, onSelectedFile, selectedFileId } = props;
  const [open, setOpen] = useState(false);

  const appliedPadding = props.item.level * 15;

  const hasChildren = props.item.children && props.item.children.length > 0;

  const fileType = props.item.file.type;

  let NewIcon = DocumentIcon;

  if (fileType === 'folder') {
    NewIcon = FolderIcon;
  }

  const onChangeUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    const newFiles = Array.from(e.target.files);
    newFiles.forEach(async (file) => {
      const base64 = await blobToBase64(file);
      console.log({ base64 });
      setLocalStorageItem(file.name, base64);

      const newFile = new CreationReportFileSystemObject(file.name, `${props.item.file.path}/${file.name}`, file.name, 'file', '', props.item.file.id);

      onAddNewFile(newFile);
    });
  };

  return (
    <>
      <div className={classNames('inline-flex items-center w-full hover:bg-gray-50', selectedFileId === props.item.file.id ? 'bg-gray-100' : '')} style={{ paddingLeft: `${appliedPadding}px` }}>
        <button
          onClick={() => {
            if (onSelectedFile) {
              onSelectedFile(props.item);
            }
          }}
          className={classNames('w-full flex-1 inline-flex items-center ')}
        >
          <div className="flex-1 inline-flex items-center">
            {hasChildren ? <FolderOpenIcon className="mr-1 h-5 w-5 text-gray-400" aria-hidden="true" /> : <NewIcon className="mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />}

            <div>{props.item.file.name}</div>
          </div>
        </button>
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="border-none inline-flex justify-center w-full rounded p-2 text-sm font-medium text-gray-700 hover:bg-gray-200" onClick={() => setOpen(!open)}>
            <DotsVerticalIcon className="-m-1 h-5 w-5 text-gray-400" aria-hidden="true" />
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
                    <UnPureNewReportNamingDropdown
                      label="New file"
                      showLabel={true}
                      icon={DocumentAddIcon}
                      parent={props.item.file}
                      onCreate={(newFile: CreationReportFileSystemObject) => {
                        if (newFile) {
                          newFile.path = `${props.item.file.path}/${newFile.name}`;

                          onAddNewFile(newFile);
                          setOpen(false);
                        }
                      }}
                    />

                    <UnPureNewReportNamingDropdown
                      label="New folder"
                      showLabel={true}
                      isFolder={true}
                      icon={FolderAddIcon}
                      parent={props.item.file}
                      onCreate={(newFile: CreationReportFileSystemObject) => {
                        if (newFile) {
                          newFile.path = `${props.item.file.path}/${newFile.name}`;

                          onAddNewFile(newFile);
                          setOpen(false);
                        }
                      }}
                    />

                    <label
                      htmlFor={`upload-${props.item.file.id}`}
                      className={classNames('hover:cursor-pointer text-gray-700 hover:bg-gray-100', 'group flex items-center px-4 py-2 text-sm text-gray-400 group-hover:text-gray-500')}
                    >
                      <UploadIcon className="h-5 w-5 mr-3 text-gray-600" aria-hidden="true" />
                      Upload
                      <input
                        style={{ display: 'none' }}
                        className="p-2 h-5 w-5 opacity-0 transition cursor-pointer rounded mr-1 form-control absolute ease-in-out"
                        id={`upload-${props.item.file.id}`}
                        type="file"
                        multiple
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeUploadFile(e)}
                      />
                    </label>
                  </>
                )}
                <button
                  className={classNames('w-full hover:cursor-pointer text-gray-700 hover:bg-gray-100', 'group flex items-center px-4 py-2 text-sm text-gray-400 group-hover:text-gray-500')}
                  onClick={() => {
                    onAddNewFile(props.item.file);
                  }}
                >
                  <PencilAltIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                  Rename
                </button>

                <button
                  className={classNames('w-full hover:cursor-pointer text-gray-700 hover:bg-gray-100', 'group flex items-center px-4 py-2 text-sm text-gray-400 group-hover:text-gray-500')}
                  onClick={() => {
                    onRemoveFile(props.item.file);
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
      {props.item.children.map((item: FilesystemItem) => (
        <FilesystemEntry
          selectedFileId={selectedFileId}
          key={item.file.id}
          item={item}
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