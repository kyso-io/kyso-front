import type { CreationReportFileSystemObject } from '@/model/creation-report-file';
import { FilesystemItem } from '@/model/filesystem-item.model';
import React, { useEffect, useState } from 'react';
import FilesystemEntry from './FilesystemEntry';

interface Props {
  files: CreationReportFileSystemObject[];
  onAddNewFile?: (newFile: CreationReportFileSystemObject) => void;
  onRemoveFile?: (newfile: CreationReportFileSystemObject) => void;
  onSelectedFile?: (selectedFile: FilesystemItem) => void;
}

const Filesystem = (props: Props) => {
  const [items, setItems] = useState<FilesystemItem[]>([]);

  useEffect(() => {
    if (props.files) {
      // Process all the files and mount the system
      // Process all the folders
      let allFolders = FilesystemItem.fromArray(props.files.filter((x) => x.type === 'folder'));

      if (allFolders.length > 0) {
        let maxLevel = Math.max(...allFolders.map((x) => x.level));

        if (maxLevel === -Infinity) {
          maxLevel = 2;
        } else {
          maxLevel += 1;
        }

        do {
          /* eslint-disable @typescript-eslint/no-loop-func */
          const itemsInLevel: FilesystemItem[] = FilesystemItem.fromArray(props.files).filter((x: FilesystemItem) => x.level === maxLevel);

          for (const processingItem of itemsInLevel) {
            // It's a children

            // Search its parent
            const parentFolder = allFolders.find((x: FilesystemItem) => x.file.id === processingItem.file.parentId);

            // Search itself, because can be a folder with subfiles as well
            const itself = allFolders.find((x: FilesystemItem) => x.file.id === processingItem.file.id);

            if (parentFolder) {
              if (itself) {
                // If it's already, add it as children keeping all the changes
                parentFolder.children.push(itself);
              } else {
                // Add it as children
                parentFolder.children.push(processingItem);
              }

              // Remove the the parent
              allFolders = allFolders.filter((x: FilesystemItem) => x.file.id !== processingItem.file.parentId);
              allFolders = allFolders.filter((x: FilesystemItem) => x.file.id !== processingItem.file.id);

              allFolders.push(parentFolder!);
            } else {
              // If we are here is because the file have no parents.
              // That means, is in the root
              const itsAlready = allFolders.findIndex((x: FilesystemItem) => x.file.id === processingItem.file.id);

              /* eslint-disable no-lonely-if */
              if (itsAlready === -1) {
                // It's not already, add it
                allFolders.push(processingItem);
              } // else, do nothing, it's already there
            }
          }
          maxLevel -= 1;
        } while (maxLevel >= 1);

        setItems(allFolders);
      } else {
        // There are no folders, only files. Special case
        if (props.files && props.files.length > 0) {
          setItems(FilesystemItem.fromArray(props.files));
        } else {
          setItems([]);
        }
      }
    }
  }, [props.files]);

  return (
    <>
      {items.map((item: FilesystemItem) => (
        <FilesystemEntry
          key={item.file.id}
          item={item}
          onAddNewFile={(newFile: CreationReportFileSystemObject) => {
            props.onAddNewFile!(newFile);
          }}
          onRemoveFile={(newFile: CreationReportFileSystemObject) => {
            props.onRemoveFile!(newFile);
          }}
          onSelectedFile={(selectedItem: FilesystemItem) => {
            props.onSelectedFile!(selectedItem);
          }}
        />
      ))}
    </>
  );
};

export default Filesystem;
