import { setLocalStorageItem } from '@/helpers/set-local-storage-item';
import { CreationReportFileSystemObject } from '@/model/creation-report-file';
import { DocumentAddIcon, FolderAddIcon, UploadIcon } from '@heroicons/react/outline';
import type { ChangeEvent } from 'react';
import UnPureNewReportNamingDropdown from './UnPureNewReportNamingDropdown';

type IUnpureCreateFile = {
  onCreate?: (newFile: CreationReportFileSystemObject) => void;
};

const UnpureFileSystemToolbar = (props: IUnpureCreateFile) => {
  const { onCreate = () => {} } = props;

  const onChangeUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    const newFiles = Array.from(e.target.files);
    newFiles.forEach(async (file) => {
      setLocalStorageItem(file.name, await file.text());
      onCreate(new CreationReportFileSystemObject(file.name, file.name, file.name, 'file', ''));
    });
  };

  return (
    <>
      <div className="inline-flex items-center justify-end w-full">
        <UnPureNewReportNamingDropdown
          label="Create new markdown file"
          icon={DocumentAddIcon}
          onCreate={(newFile: CreationReportFileSystemObject) => {
            onCreate(newFile);
          }}
        />
        <UnPureNewReportNamingDropdown
          label="Create new folder"
          icon={FolderAddIcon}
          isFolder={true}
          onCreate={(n: CreationReportFileSystemObject) => {
            onCreate(n);
          }}
        />
        <div>
          <label
            htmlFor="formFileLg"
            className=" 
              text-left p-1 hover:cursor-pointer hover:bg-gray-100
              rounded text-sm font-medium
              block
              
              form-label relative items-center  
              focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <UploadIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
            <input
              style={{ display: 'none' }}
              className="p-2 h-5 w-5 opacity-0 transition cursor-pointer rounded mr-1 form-control absolute ease-in-out"
              id="formFileLg"
              type="file"
              multiple
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeUploadFile(e)}
            />
          </label>
        </div>
      </div>
    </>
  );
};
export default UnpureFileSystemToolbar;
