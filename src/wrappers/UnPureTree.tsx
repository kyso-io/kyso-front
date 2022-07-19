import UnpureTreeItem from './UnpureTreeItem';

type IUnPureTreeProps = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  tree: any;
  prefix: string;
};

const UnPureTree = (props: IUnPureTreeProps) => {
  const { tree, prefix } = props;
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {tree?.map((item: any) => (
        <UnpureTreeItem key={item.path} treeItem={item} prefix={prefix} />
      ))}
    </>
  );
};

export default UnPureTree;
