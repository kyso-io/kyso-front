import { useRouter } from "next/router";

type IUnPureTreeItemProps = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  treeItem: any;
  prefix: string;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const UnPureTreeItem = (props: IUnPureTreeItemProps) => {
  const { treeItem, prefix } = props;
  const router = useRouter();

  let url = `${prefix}`;

  if (router.query.path && router.query.path !== treeItem.path) {
    url += `?path=${router.query.path}/${treeItem.path.split("/").reverse()[0]}`;
  } else {
    url += `?path=${treeItem.path}`;
  }
  if (treeItem.version && !Number.isNaN(treeItem.version)) {
    url += `&version=${treeItem.version}`;
  }

  return (
    <>
      <div className="text-xs">
        <a href={url} className={classNames("group flex items-center px-3 text-sm font-medium text-gray-600 rounded-md", "hover:text-gray-900", "font-normal hover:bg-neutral-50")}>
          {treeItem.path}
        </a>
      </div>
    </>
  );
};

export default UnPureTreeItem;
