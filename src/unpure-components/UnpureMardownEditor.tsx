import { PhotographIcon, LinkIcon } from '@heroicons/react/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeading, faBold } from '@fortawesome/pro-light-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { faListOl, faListUl, faQuoteRight } from '@fortawesome/pro-solid-svg-icons';

const UnpureMarkdownEditor = () => {
  return (
    <div className="sm:col-span-6">
      <div className="bg-white block w-full border border-gray-200 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500">
        <textarea id="description" name="description" rows={20} className="bg-white block w-full border-0px border-white sm:text-sm " defaultValue={''} placeholder="Readme.md content" />
        <span className="relative z-0 inline-flex shadow-sm rounded-md ml-1">
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-3 py-2 rounded mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => console.log('faBold')}
          >
            <FontAwesomeIcon icon={faBold} color="#9ca3af" />
          </button>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-3 py-2 rounded mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => console.log('faHeading')}
          >
            <FontAwesomeIcon icon={faHeading} color="#9ca3af" />
          </button>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-3 py-2 rounded mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => console.log('w')}
          >
            <LinkIcon className="-m-1 h-5 w-5 text-gray-400" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="relative inline-flex items-center px-4 py-2 rounded-l-md mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <PhotographIcon className="-m-1 h-5 w-5 text-gray-400" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-3 py-2 rounded mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => console.log('faListUl')}
          >
            <FontAwesomeIcon icon={faListUl} color="#9ca3af" />
          </button>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-3 py-2 rounded mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => console.log('faListOl')}
          >
            <FontAwesomeIcon icon={faListOl} color="#9ca3af" />
          </button>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-3 py-2 rounded mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => console.log('faQuoteRight')}
          >
            <FontAwesomeIcon icon={faQuoteRight} color="#9ca3af" />
          </button>
        </span>
      </div>
    </div>
  );
};

export default UnpureMarkdownEditor;
