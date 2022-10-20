import type { CreationReportFileSystemObject } from '@/model/creation-report-file';
import { FilesystemItem } from '@/model/filesystem-item.model';
import PureNotification from '@/components/PureNotification';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import FilesystemEntry from './FilesystemEntry';

interface Props {
  files: CreationReportFileSystemObject[];
  onAddNewFile?: (newFile: CreationReportFileSystemObject) => void;
  onRemoveFile?: (newfile: CreationReportFileSystemObject) => void;
  onSetAsMainFile?: (newfile: FilesystemItem) => void;
  onSelectedFile?: (selectedFile: FilesystemItem) => void;
  onUploadFile: (event: ChangeEvent<HTMLInputElement>, parent: FilesystemItem) => void;
  selectedFileId: string;
}

const Filesystem = (props: Props) => {
  const [items, setItems] = useState<FilesystemItem[]>([]);

  const [notificationType, setNotificationType] = useState<string>('');
  const [notificationMessage, setNotificationMessage] = useState<string>('');

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
  const delayedCallback = debounce(async () => {
    setNotificationMessage('');
    setNotificationType('');
  }, 1500);

  return (
    <>
      <div className="text-left">{notificationMessage && <PureNotification message={notificationMessage} type={notificationType} />}</div>
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
            if (item.file.id === 'Readme.md') {
              setNotificationMessage('Reame.md file cannot be deleted. Reports must have one.');
              setNotificationType('warning');
              delayedCallback();
              return;
            }
            props.onRemoveFile!(newFile);
          }}
          onSelectedFile={(selectedItem: FilesystemItem) => {
            props.onSelectedFile!(selectedItem);
          }}
          files={props.files}
        />
      ))}
    </>
  );
};

export default Filesystem;
