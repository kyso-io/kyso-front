import { useState } from 'react';
import { FolderIcon, DocumentIcon } from '@heroicons/react/outline';

type IUnpureCreateTemporalFile = {
  temporalFile: string[];
  onCreate: (newFile: string[]) => void;
  makeInputDisappear: (n: boolean) => void;
  name: string | '';
};

const UnpureCreateTemporalFile = (props: IUnpureCreateTemporalFile) => {
  const { temporalFile, makeInputDisappear, onCreate, name } = props;
  const [newName, onHanddleName] = useState(name);

  const FileType = temporalFile.type;
  const FileParentId = temporalFile.parentId;
  const FileParentText = temporalFile?.text;
  let NewIcon = DocumentIcon;
  if (FileType === 'folder') {
    NewIcon = FolderIcon;
  }

  return (
    <>
      <div className="inline-flex items-center w-full">
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
            <NewIcon className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="text"
            name="name"
            id="name"
            className="text-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 px-6 rounded-md"
            placeholder="Search on Kyso"
            onChange={(event) => {
              onHanddleName(event.target.value);
            }}
            defaultValue={newName}
            onBlur={() => makeInputDisappear(false)}
            onKeyUp={(e) => {
              if (!newName) {
                console.log('Error');
              }
              if (e.key === 'Enter') {
                onCreate({ id: newName, name: newName, type: FileType, parentId: FileParentId, text: FileParentText });
              }
            }}
          />
        </div>
      </div>
    </>
  );
};
export default UnpureCreateTemporalFile;
