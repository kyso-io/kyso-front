import type { CreationReportFileSystemObject } from '@/model/creation-report-file';
import { FilesystemItem } from '@/model/filesystem-item.model';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import FilesystemEntry from './FilesystemEntry';

interface Props {
  files: CreationReportFileSystemObject[];
  onAddNewFile?: (newFile: CreationReportFileSystemObject) => void;
  onRemoveFile?: (newfile: CreationReportFileSystemObject) => void;
  onSetAsMainFile?: (newfile: FilesystemItem) => void;
  onSelectedFile?: (selectedFile: FilesystemItem) => void;
  onUploadFile: (event: ChangeEvent<HTMLInputElement>, parent: FilesystemItem) => void;
  selectedFileId: string;
  showToaster: (message: string, icon: JSX.Element) => void;
  hideToaster: () => void;
}

const Filesystem = (props: Props) => {
  const [items, setItems] = useState<FilesystemItem[]>([]);

  useEffect(() => {
    if (!props.files) {
      setItems([]);
      return;
    }
    const addChildren = (parentId: string | null, level: number, tree: FilesystemItem[]) => {
      const children: CreationReportFileSystemObject[] = props.files.filter((x: CreationReportFileSystemObject) => x.parentId === parentId);
      for (const child of children) {
        const filesystemItem: FilesystemItem = new FilesystemItem(child, [], level, child.main || false);
        addChildren(child.id, level + 1, filesystemItem.children);
        tree.push(filesystemItem);
      }
    };
    const tree: FilesystemItem[] = [];
    addChildren(null, 1, tree);
    setItems(tree);
  }, [props.files]);

  return (
    <>
      {items.map((item: FilesystemItem) => (
        <FilesystemEntry
          onUploadFile={props.onUploadFile}
          selectedFileId={props.selectedFileId}
          key={item.file.id}
          item={item}
          onSetAsMainFile={(newFile: FilesystemItem) => {
            props.onSetAsMainFile!(newFile);
          }}
          onAddNewFile={(newFile: CreationReportFileSystemObject) => {
            props.onAddNewFile!(newFile);
          }}
          onRemoveFile={(newFile: CreationReportFileSystemObject) => {
            props.onRemoveFile!(newFile);
          }}
          onSelectedFile={(selectedItem: FilesystemItem) => {
            props.onSelectedFile!(selectedItem);
          }}
          files={props.files}
          showToaster={props.showToaster}
          hideToaster={props.hideToaster}
        />
      ))}
    </>
  );
};

export default Filesystem;
