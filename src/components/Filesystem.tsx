import { CreationReportFileSystemObject } from '@/model/creation-report-file';
import { FilesystemItem } from '@/model/filesystem-item.model';
import React, { useEffect, useState } from 'react';
import FilesystemEntry from './FilesystemEntry';

interface Props {
  files: CreationReportFileSystemObject[];
  onAddNewFile?: (newFile: CreationReportFileSystemObject) => void;
  onRemoveFile?: (newfile: CreationReportFileSystemObject) => void;
}

const Filesystem = (props: Props) => {
  const [items, setItems] = useState<FilesystemItem[]>([]);

  useEffect(() => {
    if (props.files) {
      // Process all the files and mount the system
      // Process all the folders
      let allFolders = FilesystemItem.fromArray(props.files.filter(x => x.type === "folder"));

      if(allFolders.length > 0) {
        let maxLevel = Math.max(...allFolders.map(x => x.level));

        if(maxLevel === -Infinity) {
          maxLevel = 2;
        } else {
          maxLevel = maxLevel + 1;
        }

        do {
          console.log(`Processing files of level ${maxLevel}`)
          for(const processingItem of FilesystemItem.fromArray(props.files).filter(x => x.level === maxLevel)) {
            console.log(`Processing ${processingItem.file.name}`);

            // It's a children

            // Search its parent
            const parentFolder = allFolders.find(x => x.file.id === processingItem.file.parentId);
            
            // Search itself, because can be a folder with subfiles as well
            const itself = allFolders.find(x => x.file.id === processingItem.file.id);

            if(parentFolder) {
              console.log(`Founded parentFolder ${processingItem.file.parentId} - ${parentFolder.file.name}`);

              if(itself) {
                // If it's already, add it as children keeping all the changes
                parentFolder.children.push(itself);
              } else {
                // Add it as children
                parentFolder.children.push(processingItem)
              }
              
              // Remove the the parent
              allFolders = allFolders.filter(x => x.file.id !== processingItem.file.parentId)
              allFolders = allFolders.filter(x => x.file.id !== processingItem.file.id)
              
              allFolders.push(parentFolder!);
            } else {
              // If we are here is because the file have no parents.
              // That means, is in the root
              const itsAlready = allFolders.findIndex(x => x.file.id === processingItem.file.id);

              if(itsAlready === -1) {
                // It's not already, add it
                allFolders.push(processingItem);
              } // else, do nothing, it's already there
            }
          } 
          maxLevel = maxLevel - 1;
        } while(maxLevel >= 1);

        setItems(allFolders);
      }
    }
  }, [props.files]);
  
  return (
    <>
      {items.map((item: FilesystemItem) => (
        <FilesystemEntry item={item} 
          onAddNewFile={() => {
            props.onAddNewFile!(item.file)
          }}
          onRemoveFile={() => {
            props.onRemoveFile!(item.file)
          }} 
        />
      ))}
    </>
  );
};

export default Filesystem;
