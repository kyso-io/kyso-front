type IUnPureReportCreateTitleProps = {
  title: string | '';
  setTitle: (newTitle: string) => void;
  cleanCookies: () => void;
  draftStatus: string | 'saved';
};

const UnPureReportCreateTitle = (props: IUnPureReportCreateTitleProps) => {
  const { title = null, setTitle, draftStatus, cleanCookies } = props;

  return (
    <>
      <div className="md:grid md:grid-cols-3 md:gap-10">
        <div className="md:col-span-2 inline-flex">
          <textarea
            style={{
              height: '55px',
              border: 'none',
              resize: 'none',
              outline: 'none',
              overflow: 'auto',
              WebkitBoxShadow: 'none',
              boxShadow: 'none',
            }}
            value={title || ''}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            placeholder="Title"
            className="
            focus:shadow-sm
            focus:ring-indigo-500
            focus:border-indigo-500 
            block 
            w-full
            pr-2
            border-white
            border-0
            rounded-md
            text-3xl
            font-medium
            focus:text-gray-500
            text-gray-900
          "
          />
        </div>
        <div className="mt-5 md:mt-0 md:col-span-1">
          {draftStatus && <h6 className="ml-10 text-gray-500">{draftStatus}</h6>}
          {draftStatus === 'All changes saved in local storage' && (
            <button
              type="reset"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={cleanCookies}
            >
              Clean
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default UnPureReportCreateTitle;
