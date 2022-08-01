type UnPureReportCreateTitleProps = {
  title: string | '';
  setTitle: (newTitle: string) => void;
  draftStatus: string | 'saved';
};

const UnPureReportCreateTitle = (props: UnPureReportCreateTitleProps) => {
  const { title = null, setTitle, draftStatus } = props;

  return (
    <>
      <div className="md:grid md:grid-cols-3 md:gap-10">
        <div className="md:col-span-2 inline-flex">
          <textarea
            value={title || ''}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            // onBlur={() => {
            //   setStop(true);
            // }}
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
          <span className="text-sm w-10 ml-3 font-medium text-gray-400 group-hover:text-gray-600"> v: 1 </span>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-1">{draftStatus && <h2 className="ml-10 text-gray-500">{draftStatus}</h2>}</div>
      </div>
    </>
  );
};

export default UnPureReportCreateTitle;
