import KysoTopBar from '@/layouts/KysoTopBar';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import UnpureMain from '@/wrappers/UnpureMain';
import PureUpvoteButton from '@/wrappers/PureUpvoteButton';
import UnpureShareButton from '@/wrappers/UnpureShareButton';
import UnpureReportActionDropdown from '@/wrappers/UnpureReportActionDropdown';
import PureReportHeader from '@/components/PureReportHeader';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { toggleUserStarReportAction, updateReportPreviewPictureAction } from '@kyso-io/kyso-store';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { useEffect, useState } from 'react';
import { PureSpinner } from '@/components/PureSpinner';

const Index = () => {
  useRedirectIfNoJWT();
  const dispatch = useAppDispatch();
  const report = useCommonReportData();

  const [isBusy, setBusy] = useState(false);
  const [newTags, setTags] = useState(report?.tags);

  const [authors, setAuthors] = useState([]);
  const [newDescription, setDescription] = useState(report?.description);
  const [newTitle, setTitle] = useState(report?.title);

  const [previewPicture, setPreviewPicture] = useState(report?.preview_picture);

  const [previewFile, setPreviewFile] = useState(null);

  console.log(newTags, setPreviewFile);

  useEffect(() => {
    setTitle(report?.title);
    setDescription(report?.description);
    setPreviewPicture(report?.preview_picture);
    setTags(report?.tags);
    setAuthors([]);
  }, [report]);

  const onSubmitMetadata = async () => {
    setBusy(true);
    if (previewFile) {
      const result = await dispatch(
        updateReportPreviewPictureAction({
          reportId: report.id as string,
          file: previewFile,
        }),
      );

      if (!result.payload) {
        // Error
        setBusy(false);
        return;
      }
    }

    // const result = await dispatch(
    //   updateReportAction({
    //     reportId: report.id as string,
    //     data: {
    //       title: newTitle,
    //       description: newDescription,
    //       tags: newTags == null ? [] : newTags,
    //       author_emails: authors,
    //     },
    //   })
    // );

    // if (!result.payload) {
    //   // Error
    //   setBusy(false);
    //   return;
    // }

    setBusy(false);
  };

  return (
    <>
      <UnpureMain>
        <div className="flex flex-row space-x-10 ">
          <div className="flex flex-col h-screen w-[450px] space-y-6 truncate">{/* <UnpureTree /> */}</div>
          <div className="flex flex-col h-screen w-full space-y-6 pt-6 ">
            <div className="flex justify-between min-h-[104px]">
              <PureReportHeader report={report} authors={authors} />
              <div className="flex items-center space-x-4">
                {report?.id && (
                  <PureUpvoteButton
                    report={report}
                    upvoteReport={() => {
                      dispatch(toggleUserStarReportAction(report.id as string));
                    }}
                  />
                )}
                {report?.id && <UnpureShareButton id={report!.id} />}
                <UnpureReportActionDropdown />
              </div>
            </div>

            <form className="flex space-x-4 xl:max-w-xl sm:w-full space-y-8 divide-y divide-gray-200">
              <div className="w-full">
                <div className="prose">
                  <h1>Settings</h1>
                </div>

                <div className="bg-white sm rounded-b">
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => {
                            setBusy(false);
                            setTitle(e.target.value);
                          }}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-6">
                      <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <div className="mt-1">
                        <textarea
                          rows={3}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                          value={newDescription}
                          onChange={(e) => {
                            setDescription(e.target.value);
                          }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Write a few sentences about yourself.</p>
                    </div>

                    <div className="sm:col-span-6">
                      <div className="mt-1">
                        <div className="sm:col-span-6">
                          <label htmlFor="cover-photo" className="block text-sm font-medium text-gray-700">
                            Set preview image
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <div className="flex justify-center text-sm text-gray-600">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                >
                                  <span>Upload a file</span>
                                  <input
                                    id="file-upload"
                                    // onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    // if (event.target.files && event.target.files.length > 0) {
                                    // const file = event.target.files[0];
                                    // setPreviewFile(file);
                                    // setPreviewPicture(window.URL.createObjectURL(file));
                                    // }
                                    // }}
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                  />
                                </label>
                              </div>
                              <p className="pl-1">{previewPicture?.toString()}</p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                        Tags
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="about"
                          name="about"
                          rows={3}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                          defaultValue={''}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Write a few sentences about yourself.</p>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                        Authors
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="about"
                          name="about"
                          rows={3}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                          defaultValue={''}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Write a few sentences about yourself.</p>
                    </div>

                    <div className="pt-5 pb-44 sm:col-span-6">
                      <div className="flex justify-end">
                        {/* <button
                          type="button"
                          onClick={() => {
                            setBusy(false);
                          }}
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button> */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setBusy(true);
                            onSubmitMetadata();
                          }}
                          type="submit"
                          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {isBusy ? <PureSpinner size={5} /> : null}
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </UnpureMain>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
