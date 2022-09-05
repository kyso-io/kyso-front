import programmingLanguages from './programming-languages.json';

export class FileTypesHelper {
  public static getExtension = (name: string): string | undefined => {
    return name.split('.').pop();
  };

  public static isImage = (name: string) => {
    return (
      name != null &&
      (name.toLowerCase().endsWith('.png') || name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg') || name.toLowerCase().endsWith('.gif') || name.toLowerCase().endsWith('.svg'))
    );
  };

  public static isTextBasedFiled = (name: string) => {
    return (
      name != null &&
      (name.toLowerCase().endsWith('.txt') ||
        name.toLowerCase().endsWith('.md') ||
        name.toLowerCase().endsWith('.json') ||
        name.toLowerCase().endsWith('.yml') ||
        name.toLowerCase().endsWith('.yaml') ||
        name.toLowerCase().endsWith('.cfg'))
    );
  };

  public static isJupyterNotebook = (name: string) => {
    return name != null && name.toLowerCase().endsWith('.ipynb');
  };

  public static isCode = (name: string) => {
    if (!name) {
      return false;
    }

    const extensions: (string | undefined)[] = programmingLanguages.map((x) => x.extensions).flat();

    const isInExtensions: boolean = extensions.filter((x) => x === `.${FileTypesHelper.getExtension(name)}`).length > 0;

    return isInExtensions;
  };

  public static isOffice365 = (name: string) => {
    return (
      name.toLowerCase().endsWith('.pptx') ||
      name.toLowerCase().endsWith('.ppt') ||
      name.toLowerCase().endsWith('.xlsx') ||
      name.toLowerCase().endsWith('.xls') ||
      name.toLowerCase().endsWith('.docx') ||
      name.toLowerCase().endsWith('.doc')
    );
  };

  public static isGoogleDocs = (name: string) => {
    return (
      name.toLowerCase().endsWith('.rtf') ||
      name.toLowerCase().endsWith('.pdf') ||
      name.toLowerCase().endsWith('.webm') ||
      name.toLowerCase().endsWith('.mpeg4') ||
      name.toLowerCase().endsWith('.3gpp') ||
      name.toLowerCase().endsWith('.mov') ||
      name.toLowerCase().endsWith('.avi') ||
      name.toLowerCase().endsWith('.mpegps') ||
      name.toLowerCase().endsWith('.wmv') ||
      name.toLowerCase().endsWith('.flv') ||
      name.toLowerCase().endsWith('.pages') ||
      name.toLowerCase().endsWith('.ai') ||
      name.toLowerCase().endsWith('.psd') ||
      name.toLowerCase().endsWith('.tiff') ||
      name.toLowerCase().endsWith('.dxf') ||
      name.toLowerCase().endsWith('.svg') ||
      name.toLowerCase().endsWith('.eps') ||
      name.toLowerCase().endsWith('.ps') ||
      name.toLowerCase().endsWith('.ttf') ||
      name.toLowerCase().endsWith('.xps')
    );
  };

  public static isSupported = (name: string) => {
    return (
      (name != null && FileTypesHelper.isImage(name)) ||
      FileTypesHelper.isCode(name) ||
      FileTypesHelper.isTextBasedFiled(name) ||
      FileTypesHelper.isJupyterNotebook(name) ||
      FileTypesHelper.isOffice365(name) ||
      FileTypesHelper.isGoogleDocs(name)
    );
  };
}
