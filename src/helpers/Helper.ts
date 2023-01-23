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
    if (sessionStorage.getItem('kyso-settings')) {
      return JSON.parse(sessionStorage.getItem('kyso-settings') as string);
    }

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
}
