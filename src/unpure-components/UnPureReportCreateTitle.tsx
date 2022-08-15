type IUnPureReportCreateTitleProps = {
  title: string | '';
  setTitle: (newTitle: string) => void;
  cleanCookies: () => void;
  draftStatus: string | 'saved';
};

const UnPureReportCreateTitle = (props: IUnPureReportCreateTitleProps) => {
  const { title = null, setTitle } = props;

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
      </div>
    </>
  );
};

export default UnPureReportCreateTitle;
