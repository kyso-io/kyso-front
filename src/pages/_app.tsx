import '../styles/globals.css';
import '../styles/styles.css';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { store } from '@kyso-io/kyso-store';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { Helper } from '@/helpers/Helper';
import type { KeyValue } from '@/model/key-value.model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { PageWithLayoutType } from '../types/pageWithLayout';

type AppLayoutProps = AppProps & {
  Component: PageWithLayoutType;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  pageProps: any;
};

function MyApp({ Component, pageProps }: AppLayoutProps) {
  // Added theme management
  const [theme, setTheme] = useState<string | null>(null);

  const Layout = Component.layout || ((children: ReactNode) => <>{children}</>);

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
    <ErrorBoundary>
      <Provider store={store}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>

      {theme && <link rel="stylesheet" href={`/pub/themes/${theme}/styles.css`}></link>}
    </ErrorBoundary>
  );
}
export default MyApp;
