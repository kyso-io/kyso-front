type IPureNavigatorHeadingProps = {
  label: string;
  isStrong: boolean;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const PureNavigatorHeading = (props: IPureNavigatorHeadingProps) => {
  return (
    <div className="rounded-md flex items-center">
      <>
        <p className={classNames(props.isStrong ? 'text-gray-900 text-sm font-medium' : 'text-gray-700', 'block px-0 py-2 text-sm', 'font-medium')}>{props.label}</p>
      </>
    </div>
  );
};

export { PureNavigatorHeading };
