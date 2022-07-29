import { DocumentAddIcon, FolderAddIcon, UploadIcon } from '@heroicons/react/outline';

const UnpureCreateFile = () => {
  return (
    <>
      <div className="inline-flex items-center w-full">
        <div className="flex-1">
          <h2>Files</h2>
        </div>
        <div>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-3 py-2 rounded mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => console.log('faBold')}
          >
            <DocumentAddIcon className="-m-1 h-5 w-5 text-gray-400" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-3 py-2 rounded mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => console.log('faBold')}
          >
            <UploadIcon className="-m-1 h-5 w-5 text-gray-400" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-3 py-2 rounded mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => console.log('faBold')}
          >
            <FolderAddIcon className="-m-1 h-5 w-5 text-gray-400" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
};
export default UnpureCreateFile;
