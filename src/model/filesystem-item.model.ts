import type { CreationReportFileSystemObject } from './creation-report-file';

export class FilesystemItem {
  public file: CreationReportFileSystemObject;

  public children: FilesystemItem[];

  public level: number;

  constructor(file: CreationReportFileSystemObject, children: FilesystemItem[], level: number) {
    this.file = file;
    this.children = children;
    this.level = level;
  }

  public hasChildren(): boolean {
    return !!(this.children && this.children.length > 0);
  }

  public static from(object: CreationReportFileSystemObject): FilesystemItem {
    return new FilesystemItem(object, [], object.path.split('/').length);
  }

  public static fromArray(object: CreationReportFileSystemObject[]): FilesystemItem[] {
    return object.map((x: CreationReportFileSystemObject) => FilesystemItem.from(x));
  }
}
