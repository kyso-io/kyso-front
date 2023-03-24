/* eslint no-new: "off" */
import { KeyValue } from '@/model/key-value.model';
import { TeamVisibilityEnum } from '@kyso-io/kyso-model';
import { fetchPublicKysoSettings, store } from '@kyso-io/kyso-store';
import slugify from 'slugify';
import { OrganizationSettingsTab } from '../enums/organization-settings-tab';

export class Helper {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  public static ListToKeyVal(data: any) {
    return data.reduce((prev: any, curr: any) => {
      prev[curr.id] = curr;
      return prev;
    }, {});
  }

  public static async getKysoPublicSettings(): Promise<KeyValue[]> {
    // Don't save it in the localStorage, because in re-deployments the values will dont change
    // and guide us to errors or missunderstoods. With the sessionStorage we retrieve that data once
    // in every new session, which I think is a good balance between being updated and don't overwhelm
    // the API

    // Don't save it man, just call to the fucking endpoint
    /* if (sessionStorage.getItem('kyso-settings')) {
      return JSON.parse(sessionStorage.getItem('kyso-settings') as string);
    } */

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const publicSettings: any = await store.dispatch(fetchPublicKysoSettings());

    const publicKeys = publicSettings.payload.map((x: any) => {
      return new KeyValue(x.key, x.value);
    });

    sessionStorage.setItem('kyso-settings', JSON.stringify(publicKeys));

    return publicKeys;
  }

  public static slugify(text: string): string {
    return slugify(text, {
      replacement: '-',
      lower: true,
      strict: true,
      trim: true,
    });
  }

  public static isEmail(email: string): boolean {
    if (!email) {
      return false;
    }
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  public static parseFileSizeStr = (fileSizeStr: string): number => {
    const units: string[] = ['b', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb'];
    const size: number = parseFloat(fileSizeStr);
    const unit: string = fileSizeStr.replace(/[^a-z]/gi, '').toLowerCase();
    const power: number = units.indexOf(unit);
    return Math.floor(size * 1024 ** power);
  };

  public static parseFileSize = (fileSize: number): string => {
    const units: string[] = ['b', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb'];
    let power: number = 0;
    while (fileSize > 1024) {
      fileSize /= 1024;
      power += 1;
    }
    return Math.round(fileSize * 100) / 100 + units[power]!;
  };

  public static ucFirst = (str: string): string => {
    return str && str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  };

  public static isValidUrl = (urlString: string): boolean => {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // validate fragment locator
    return !!urlPattern.test(urlString);
  };

  public static FORBIDDEN_FILES: string[] = ['kyso.json', 'kyso.yaml', 'kyso.yml'];

  public static isValidUrlWithProtocol = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  };

  public static logError = (message: string, exception?: unknown): void => {
    if (message && message !== '') {
      /* eslint-disable no-console */
      console.log(message);
    }

    if (exception) {
      /* eslint-disable no-console */
      console.error(exception);
    }
  };

  public static isBrowser = (): boolean => {
    return typeof window !== 'undefined' && window.document !== undefined;
  };

  public static arrayEquals = (a: any[], b: any[]): boolean => {
    const aIsArray: boolean = Array.isArray(a);
    const bIsArray: boolean = Array.isArray(b);
    if (aIsArray !== bIsArray) {
      return false;
    }
    if (!aIsArray && !bIsArray) {
      return false;
    }
    return a.length === b.length && a.every((val: any, index: number) => val === b[index]);
  };

  public static organizationSettingsTabs: { key: OrganizationSettingsTab; name: string }[] = [
    {
      key: OrganizationSettingsTab.Channels,
      name: 'Channels',
    },
    {
      key: OrganizationSettingsTab.Members,
      name: 'Members',
    },
    {
      key: OrganizationSettingsTab.Access,
      name: 'Access',
    },
    {
      key: OrganizationSettingsTab.Notifications,
      name: 'Notifications',
    },
  ];

  public static teamVisibilityValues: TeamVisibilityEnum[] = [TeamVisibilityEnum.PROTECTED, TeamVisibilityEnum.PRIVATE, TeamVisibilityEnum.PUBLIC];

  public static CHECK_JWT_TOKEN_MS = 3000;

  public static formatNumber = (x: number | null | undefined) => {
    if (x === null || x === undefined) {
      return 0;
    }
    const roundedNumber: number = Math.round((x + Number.EPSILON) * 100) / 100;
    return roundedNumber
      .toString()
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+\b)/g, '.');
  };

  public static roundTwoDecimals = (value: number): number => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  };

  public static getFileNameGivenExtension(extension: string): string {
    switch (extension) {
      case 'ipynb':
        return 'Jupyter Notebook';
      case 'py':
        return 'Python';
      case 'rmd':
        return 'R Markdown';
      case 'md':
        return 'Markdown';
      case 'html':
        return 'HTML';
      case 'csv':
        return 'CSV';
      case 'tsv':
        return 'TSV';
      case 'json':
        return 'JSON';
      case 'txt':
        return 'Text';
      case 'pdf':
        return 'PDF';
      case 'docx':
        return 'Word';
      case 'xlsx':
        return 'Excel';
      case 'pptx':
        return 'PowerPoint';
      case 'zip':
        return 'Zip';
      case 'gz':
        return 'Gzip';
      case 'tar':
        return 'Tar';
      case 'tgz':
        return 'Tgz';
      case 'bz2':
        return 'Bz2';
      case 'tbz2':
        return 'Tbz2';
      case 'xz':
        return 'Xz';
      case 'txz':
        return 'Txz';
      case '7z':
        return '7z';
      case 'rar':
        return 'Rar';
      case 'rtf':
        return 'RTF';
      case 'odt':
        return 'Open Document Text';
      case 'ods':
        return 'Open Document Spreadsheet';
      case 'odp':
        return 'Open Document Presentation';
      case 'odg':
        return 'Open Document Drawing';
      case 'odc':
        return 'Open Document Chart';
      case 'odf':
        return 'Open Document Formula';
      case 'odb':
        return 'Open Document Database';
      case 'odi':
        return 'Open Document Image';
      case 'odm':
        return 'Open Document Master Document';
      case 'ott':
        return 'Open Document Text Template';
      case 'ots':
        return 'Open Document Spreadsheet Template';
      case 'otp':
        return 'Open Document Presentation Template';
      case 'otg':
        return 'Open Document Drawing Template';
      case 'otc':
        return 'Open Document Chart Template';
      case 'otf':
        return 'Open Document Formula Template';
      case 'otb':
        return 'Open Document Database Template';
      case 'oti':
        return 'Open Document Image Template';
      case 'oth':
        return 'Open Document Web Page Template';
      case 'doc':
        return 'Word';
      case 'xls':
        return 'Excel';
      case 'ppt':
        return 'PowerPoint';
      case 'jpg':
        return 'JPG';
      case 'jpeg':
        return 'JPEG';
      case 'png':
        return 'PNG';
      case 'gif':
        return 'GIF';
      case 'bmp':
        return 'BMP';
      case 'tif':
        return 'TIF';
      case 'tiff':
        return 'TIFF';
      case 'svg':
        return 'SVG';
      case 'webp':
        return 'WebP';
      case 'ico':
        return 'ICO';
      case 'mp3':
        return 'MP3';
      case 'wav':
        return 'WAV';
      case 'ogg':
        return 'OGG';
      case 'mp4':
        return 'MP4';
      case 'mov':
        return 'MOV';
      case 'avi':
        return 'AVI';
      case 'wmv':
        return 'WMV';
      case 'flv':
        return 'FLV';
      case 'mkv':
        return 'MKV';
      case 'mpg':
        return 'MPG';
      case 'mpeg':
        return 'MPEG';
      case 'm4v':
        return 'M4V';
      case '3gp':
        return '3GP';
      case '3g2':
        return '3G2';
      case 'webm':
        return 'WebM';
      case 'swf':
        return 'SWF';
      case 'psd':
        return 'PSD';
      case 'ai':
        return 'AI';
      case 'eps':
        return 'EPS';
      case 'ps':
        return 'PS';
      case 'ttf':
        return 'TTF';
      case 'woff':
        return 'WOFF';
      case 'woff2':
        return 'WOFF2';
      case 'eot':
        return 'EOT';
      case 'sfnt':
        return 'SFNT';
      case 'css':
        return 'CSS';
      case 'js':
        return 'JavaScript';
      case 'jsx':
        return 'JSX';
      case 'ts':
        return 'TypeScript';
      case 'tsx':
        return 'TSX';
      case 'c':
        return 'C';
      case 'cpp':
        return 'C++';
      case 'cs':
        return 'C#';
      case 'h':
        return 'H';
      case 'java':
        return 'Java';
      case 'm':
        return 'Objective-C';
      case 'mm':
        return 'Objective-C++';
      case 'rb':
        return 'Ruby';
      case '':
        return 'Unknown';
      default:
        return extension;
    }
  }
}
