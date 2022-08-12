export class CreationReportFileSystemObject {
  public id: string;
  public path: string;
  public name: string;
  public type: string;
  public parentId: string | null;
  public text: string | null;
  
  constructor(id: string, path: string, name: string, type: string, text: string, parentId?: string) {
    this.id = id;
    this.name = name;
    this.path = path;
    this.type = type;
    this.text = text;

    if(parentId) {
      this.parentId = parentId;
    } else {
      this.parentId = null;
    }
  }
}