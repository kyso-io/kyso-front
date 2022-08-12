type UnPureReportCreateDescriptionProps = {
  description: string | '';
  setDescription: (newDescription: string) => void;
};

const UnPureReportCreateDescription = (props: UnPureReportCreateDescriptionProps) => {
  const { description, setDescription } = props;

  return (
    <>
      <div className="md:grid md:grid-cols-4 md:gap-6">
        <div className="md:col-span-3">
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
            value={description || ''}
            placeholder="Description"
            onChange={(e) => {
              // setBusy(false);
              setDescription(e.target.value);
            }}
            className="
                focus:shadow-sm
              focus:ring-indigo-500
              focus:border-indigo-500 
                block 
                w-full
                h-full
                pr-2
                focus:w-full 
              border-white
                border-0
              text-gray-500
                sm:text-sm
                rounded-md"
          />
        </div>
      </div>
    </>
  );
};

export default UnPureReportCreateDescription;
