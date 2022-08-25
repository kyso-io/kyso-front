import { KeyValue } from '@/model/key-value.model';
import { fetchPublicKysoSettings, store } from '@kyso-io/kyso-store';
import slugify from 'slugify';

export class Helper {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  public static ListToKeyVal(data: any) {
    return data.reduce((prev: any, curr: any) => {
      prev[curr.id] = curr;
      return prev;
    }, {});
  }

  public static async getKysoPublicSettings(): Promise<KeyValue[]> {
    if (localStorage.getItem('kyso-settings')) {
      return JSON.parse(localStorage.getItem('kyso-settings') as string);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const publicSettings: any = await store.dispatch(fetchPublicKysoSettings());

    const publicKeys = publicSettings.payload.map((x: any) => {
      return new KeyValue(x.key, x.value);
    });

    localStorage.setItem('kyso-settings', JSON.stringify(publicKeys));

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

  public static isImage = (name: string) => {
    return (
      name != null &&
      (name.toLowerCase().endsWith('.png') || name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg') || name.toLowerCase().endsWith('.gif') || name.toLowerCase().endsWith('.svg'))
    );
  };

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
}
