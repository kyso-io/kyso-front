import programmingLanguages from './programming-languages.json';

export class FileTypesHelper {
  public static getExtension = (name: string): string | undefined => {
    return name.split('.').pop();
  };

  public static getBrowser() {
    if ((navigator.userAgent.indexOf('Opera') || navigator.userAgent.indexOf('OPR')) !== -1) {
      return 'opera.svg';
    }
    if (navigator.userAgent.indexOf('Chrome') !== -1) {
      return 'chrome.svg';
    }
    if (navigator.userAgent.indexOf('Safari') !== -1) {
      return 'safari.svg';
    }
    if (navigator.userAgent.indexOf('Firefox') !== -1) {
      return 'firefox.svg';
      /* eslint-disable @typescript-eslint/no-explicit-any */
    }
    if (navigator.userAgent.indexOf('MSIE') !== -1 || (!!document as any).documentMode === true) {
      return 'edge.svg';
    }
    return 'browser.svg';
  }

  public static isImage = (name: string) => {
    return (
      name != null &&
      (name.toLowerCase().endsWith('.png') || name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg') || name.toLowerCase().endsWith('.gif') || name.toLowerCase().endsWith('.svg'))
    );
  };

  public static isYAML = (name: string) => {
    return name.toLowerCase().endsWith('.yml') || name.toLowerCase().endsWith('.yaml');
  };

  public static isMarkdown = (name: string) => {
    return name.toLowerCase().endsWith('.md');
  };

  public static isJavascript = (name: string) => {
    return name.toLowerCase().endsWith('.js') || name.toLowerCase().endsWith('.jsx');
  };

  public static isTypescript = (name: string) => {
    return name.toLowerCase().endsWith('.ts') || name.toLowerCase().endsWith('.tsx');
  };

  public static isHTML = (name: string) => {
    return name.toLowerCase().endsWith('.html') || name.toLowerCase().endsWith('.htm');
  };

  public static isPython = (name: string) => {
    return name.toLowerCase().endsWith('.py') || name.toLowerCase().endsWith('.pip');
  };

  public static isR = (name: string) => {
    return name.toLowerCase().endsWith('.r');
  };

  public static isJSON = (name: string) => {
    return name.toLowerCase().endsWith('.json');
  };

  public static isTextBasedFiled = (name: string) => {
    return (
      name != null && (name.toLowerCase().endsWith('.txt') || FileTypesHelper.isYAML(name) || FileTypesHelper.isJSON(name) || FileTypesHelper.isMarkdown(name) || name.toLowerCase().endsWith('.cfg'))
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

  public static isPowerpoint = (name: string) => {
    return name.toLowerCase().endsWith('.pptx') || name.toLowerCase().endsWith('.ppt');
  };

  public static isExcel = (name: string) => {
    return name.toLowerCase().endsWith('.xlsx') || name.toLowerCase().endsWith('.xls');
  };

  public static isWord = (name: string) => {
    return name.toLowerCase().endsWith('.docx') || name.toLowerCase().endsWith('.doc');
  };

  public static isOffice365 = (name: string) => {
    return FileTypesHelper.isPowerpoint(name) || FileTypesHelper.isExcel(name) || FileTypesHelper.isWord(name);
  };

  public static isPDF = (name: string) => {
    return name.toLowerCase().endsWith('.pdf');
  };

  public static isGoogleDocs = (name: string) => {
    return (
      name.toLowerCase().endsWith('.rtf') ||
      FileTypesHelper.isPDF(name) ||
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
