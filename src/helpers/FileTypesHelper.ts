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

  public static isSVS = (name: string) => {
    return name.toLowerCase().endsWith('.svs');
  };

  public static isAdoc = (name: string) => {
    return name.toLowerCase().endsWith('.adoc') || name.toLowerCase().endsWith('.asciidoc') || name.toLowerCase().endsWith('.asc');
  };

  public static isImage = (name: string) => {
    return name != null && (name.toLowerCase().endsWith('.png') || name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg') || name.toLowerCase().endsWith('.gif'));
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

  public static isPlainTextFile = (name: string) => {
    return name != null && (name.toLowerCase().endsWith('.txt') || name.toLowerCase().endsWith('.cfg'));
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

    return isInExtensions || FileTypesHelper.isYAML(name) || FileTypesHelper.isJSON(name);
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

  public static isOnlyOffice = (name: string) => {
    return (
      FileTypesHelper.isPowerpoint(name) ||
      FileTypesHelper.isExcel(name) ||
      FileTypesHelper.isWord(name) ||
      FileTypesHelper.isPDF(name) ||
      // More word-related
      name.toLowerCase().endsWith('.docm') ||
      name.toLowerCase().endsWith('.dot') ||
      name.toLowerCase().endsWith('.dotx') ||
      name.toLowerCase().endsWith('.dotm') ||
      name.toLowerCase().endsWith('.odt') ||
      name.toLowerCase().endsWith('.fodt') ||
      name.toLowerCase().endsWith('.ott') ||
      name.toLowerCase().endsWith('.rtf') ||
      name.toLowerCase().endsWith('.djvu') ||
      name.toLowerCase().endsWith('.fb2') ||
      name.toLowerCase().endsWith('.epub') ||
      name.toLowerCase().endsWith('.xps') ||
      name.toLowerCase().endsWith('.oxps') ||
      // More powerpoint-related
      name.toLowerCase().endsWith('.pps') ||
      name.toLowerCase().endsWith('.ppsx') ||
      name.toLowerCase().endsWith('.ppsm') ||
      name.toLowerCase().endsWith('.pptm') ||
      name.toLowerCase().endsWith('.pot') ||
      name.toLowerCase().endsWith('.potx') ||
      name.toLowerCase().endsWith('.potm') ||
      name.toLowerCase().endsWith('.odp') ||
      name.toLowerCase().endsWith('.fodp') ||
      name.toLowerCase().endsWith('.otp') ||
      // More excel-related
      name.toLowerCase().endsWith('.xlsm') ||
      name.toLowerCase().endsWith('.xlsb') ||
      name.toLowerCase().endsWith('.xlt') ||
      name.toLowerCase().endsWith('.xltx') ||
      name.toLowerCase().endsWith('.ods') ||
      name.toLowerCase().endsWith('.fods') ||
      name.toLowerCase().endsWith('.ots') ||
      name.toLowerCase().endsWith('.csv')
    );
  };

  public static isTsv = (name: string) => {
    return name.toLowerCase().endsWith('.tsv');
  };

  public static isCsv = (name: string) => {
    return name.toLowerCase().endsWith('.csv');
  };

  public static isPDF = (name: string) => {
    return name.toLowerCase().endsWith('.pdf');
  };

  public static isGoogleDocs = (name: string) => {
    return (
      name.toLowerCase().endsWith('.rtf') ||
      name.toLowerCase().endsWith('.mpegps') ||
      name.toLowerCase().endsWith('.wmv') ||
      name.toLowerCase().endsWith('.pages') ||
      name.toLowerCase().endsWith('.ai') ||
      name.toLowerCase().endsWith('.psd') ||
      name.toLowerCase().endsWith('.tiff') ||
      name.toLowerCase().endsWith('.dxf') ||
      name.toLowerCase().endsWith('.eps') ||
      name.toLowerCase().endsWith('.ps') ||
      name.toLowerCase().endsWith('.ttf') ||
      name.toLowerCase().endsWith('.xps')
    );
  };

  public static isVideo = (name: string) => {
    return (
      name.toLowerCase().endsWith('.webm') ||
      name.toLowerCase().endsWith('.mpeg4') ||
      name.toLowerCase().endsWith('.3gpp') ||
      name.toLowerCase().endsWith('.mov') ||
      name.toLowerCase().endsWith('.avi') ||
      name.toLowerCase().endsWith('.mpegps') ||
      name.toLowerCase().endsWith('.wmv') ||
      name.toLowerCase().endsWith('.mp4') ||
      name.toLowerCase().endsWith('.ogg') ||
      name.toLowerCase().endsWith('.flv')
    );
  };

  public static isSupported = (name: string) => {
    return (
      (name != null && FileTypesHelper.isImage(name)) ||
      FileTypesHelper.isCode(name) ||
      FileTypesHelper.isPlainTextFile(name) ||
      FileTypesHelper.isJupyterNotebook(name) ||
      FileTypesHelper.isOnlyOffice(name) ||
      FileTypesHelper.isGoogleDocs(name) ||
      FileTypesHelper.isSVS(name)
    );
  };
}
