import { DocumentAddIcon, FolderAddIcon, UploadIcon } from '@heroicons/react/outline';
import UnPureNewReportNamingDropdown from './UnPureNewReportNamingDropdown';

type IUnpureCreateFile = {
  onCreate?: (newfile: string[]) => void;
};

const UnpureCreateFile = (props: IUnpureCreateFile) => {
  const { onCreate = () => {} } = props;
  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const inputFile = useRef<HTMLInputElement>(null);

  // const onButtonClick = () => {
  //   // `current` points to the mounted file input element
  //   inputFile.current && inputFile.current.click();
  // };

  const onChangeUploadFile = (e) => {
    console.log('droppedFiles', e.target.files);

    // let noDuplicateFiles = droppedFiles;
    // let newFiles = [];
    // if (files) {
    //   newFiles = files.concat(droppedFiles);
    // }
    // if (files) {
    //   noDuplicateFiles = removeDuplicatesByKey(newFiles, "name");
    // }
    // setFiles(noDuplicateFiles);
  };

  return (
    <>
      <div className="inline-flex items-center w-full">
        <div className="flex-1">
          <h2>Files</h2>
        </div>
        <div>
          <UnPureNewReportNamingDropdown
            label="Create new file"
            NewIcon={DocumentAddIcon}
            onCreate={(n: string) => {
              onCreate({ id: n, name: n, type: 'file', parentId: null, text: null });
            }}
          />
          <UnPureNewReportNamingDropdown
            label="Create new folder"
            NewIcon={FolderAddIcon}
            onCreate={(n: string) => {
              onCreate({ id: n, name: n, type: 'folder', parentId: null, text: null });
            }}
          />
          <div className="relative inline-block text-left px-3 py-2">
            <label
              htmlFor="formFileLg"
              className=" 
                inline-flex mb-2 -ml-px  rounded mr-1 bg-white text-sm font-medium
                form-label relative items-center hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <UploadIcon className="-m-1 h-5 w-5 text-gray-400" aria-hidden="true" />
              <input
                style={{ display: 'none' }}
                className="-m-1 h-5 w-5 opacity-0 transition cursor-pointer  rounded mr-1 form-control absolute ease-in-out"
                id="formFileLg"
                type="file"
                directory=""
                webkitdirectory="webkitDirectory"
                multiple
                onChange={(e) => onChangeUploadFile(e)}
              />
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
export default UnpureCreateFile;
