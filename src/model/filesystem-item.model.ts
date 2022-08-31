import type { CreationReportFileSystemObject } from './creation-report-file';

export class FilesystemItem {
  public file: CreationReportFileSystemObject;

  public children: FilesystemItem[];

  public level: number;

  public main: boolean;

  constructor(file: CreationReportFileSystemObject, children: FilesystemItem[], level: number, main?: boolean) {
    this.file = file;
    this.children = children;
    this.level = level;

    if (main) {
      this.main = main;
    } else {
      this.main = false;
    }
  }

  public hasChildren(): boolean {
    return !!(this.children && this.children.length > 0);
  }

  public static from(object: CreationReportFileSystemObject): FilesystemItem {
    return new FilesystemItem(object, [], object.path.split('/').length, object.main ? object.main : false);
  }

  public static fromArray(object: CreationReportFileSystemObject[]): FilesystemItem[] {
    return object.map((x: CreationReportFileSystemObject) => FilesystemItem.from(x));
  }
}
