interface Props {
  tags: string[];
}

const PureTagGroup = (props: Props) => {
  return (
    <div>
      {props.tags.map((tag: string, indexTag: number) => (
        <div key={indexTag} className="text-xs inline-flex items-center font-bold leading-sm mr-1 mb-1 px-3 py-1 bg-blue-200 text-blue-700 rounded-full">
          {tag}
        </div>
      ))}
    </div>
  );
};

export default PureTagGroup;
