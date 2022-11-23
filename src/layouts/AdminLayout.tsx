/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LayoutProps } from '@/types/pageWithLayout';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { useEffect, useState } from 'react';
import { Helper } from '../helpers/Helper';
import type { KeyValue } from '../model/key-value.model';

import { Meta } from './Meta';

const AdminLayout: LayoutProps = ({ children }: any) => {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const getTheme = async () => {
      const publicKeys: KeyValue[] = await Helper.getKysoPublicSettings();
      const keyValue: KeyValue | undefined = publicKeys.find((x) => x.key === KysoSettingsEnum.THEME);
      if (keyValue && keyValue.value) {
        setTheme(keyValue.value);
      }
    };
    getTheme();
  }, []);

  return (
    <>
      <Meta title="Kyso" description="A place to share, organise and discover notebooks, markdown, mdx, static HTML sites, data apps, and more." />
      <div>Admin: </div>
      <main>{children}</main>
      {theme && <link rel="stylesheet" href={`/pub/themes/${theme}/styles.css`}></link>}
    </>
  );
};
export default AdminLayout;
