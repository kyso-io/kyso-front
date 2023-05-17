export class SkeletonTemplates {
  public static IMAGE_PLACEHOLDER: JSX.Element = (
    <>
      <div role="status" className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 md:flex md:items-center">
        <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96 dark:bg-gray-700">
          <svg className="w-12 h-12 text-gray-200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 640 512">
            <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
          </svg>
        </div>
        <div className="w-full">
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );

  public static PORTRAIT_PLACEHOLDER: JSX.Element = (
    <>
      <div className="relative" data-headlessui-state="">
        <div>
          <button
            className="flex max-w-xs items-center rounded-full text-sm hover:text-gray-300"
            id="headlessui-menu-button-:r3:"
            type="button"
            aria-haspopup="menu"
            aria-expanded="false"
            data-headlessui-state=""
          >
            <span className="sr-only">Open user menu</span>
            <svg
              className="avatar-tooltip object-cover inline-block text-xs h-8 w-8 rounded-full ring-0 border transition duration-100 undefined"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  public static REPORT_DETAIL: JSX.Element = (
    <>
      <div role="status" className="p-4 border border-gray-200 rounded shadow animate-pulse md:p-6 dark:border-gray-700">
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2.5"></div>
        <div className="w-48 h-2 mb-10 bg-gray-200 rounded-full dark:bg-gray-700"></div>
        <div className="flex items-baseline mt-4 space-x-6">
          <div className="w-full bg-gray-200 rounded-t-lg h-72 dark:bg-gray-700"></div>
          <div className="w-full h-56 bg-gray-200 rounded-t-lg dark:bg-gray-700"></div>
          <div className="w-full bg-gray-200 rounded-t-lg h-72 dark:bg-gray-700"></div>
          <div className="w-full h-64 bg-gray-200 rounded-t-lg dark:bg-gray-700"></div>
          <div className="w-full bg-gray-200 rounded-t-lg h-80 dark:bg-gray-700"></div>
          <div className="w-full bg-gray-200 rounded-t-lg h-72 dark:bg-gray-700"></div>
          <div className="w-full bg-gray-200 rounded-t-lg h-80 dark:bg-gray-700"></div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );
}
