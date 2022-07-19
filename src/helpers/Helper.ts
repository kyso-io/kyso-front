import { KeyValue } from '@/model/key-value.model';
import { fetchPublicKysoSettings, store } from '@kyso-io/kyso-store';
import slugify from 'slugify';

export class Helper {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  public static ListToKeyVal(data: any) {
    return data.reduce((prev: any, curr: any) => {
      /* eslint-disable no-param-reassign */
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
}
