import '../styles/globals.css';
import '../styles/styles.css';

import ErrorBoundary from '@/components/ErrorBoundary';
import { Helper } from '@/helpers/Helper';
import type { KeyValue } from '@/model/key-value.model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { store } from '@kyso-io/kyso-store';
import type { AppProps } from 'next/app';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { getLocalStorageItem } from '../helpers/isomorphic-local-storage';
import { websocket } from '../helpers/websocket';
import { EventProvider } from '../hooks/use-event';
import type { PageWithLayoutType } from '../types/pageWithLayout';

type AppLayoutProps = AppProps & {
  Component: PageWithLayoutType;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  pageProps: any;
};

function MyApp({ Component, pageProps }: AppLayoutProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [theme, setTheme] = useState<string | null>(null);

  const Layout = Component.layout || ((children: ReactNode) => <>{children}</>);

  useEffect(() => {
    const getTheme = async () => {
      const publicKeys: KeyValue[] = await Helper.getKysoPublicSettings();
      const keyValue: KeyValue | undefined = publicKeys.find((x) => x.key === KysoSettingsEnum.THEME);
      if (keyValue && keyValue.value) {
        setTheme(keyValue.value);
      }
      setMounted(true);
    };
    getTheme();
  }, []);

  useEffect(() => {
    const token: string | null = getLocalStorageItem('jwt');
    if (!token) {
      return () => {};
    }
    websocket.connect(token);
    return () => {
      websocket.disconnect();
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <EventProvider>
      <ErrorBoundary>
        <Provider store={store}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </Provider>
        {theme && <link rel="stylesheet" href={`/pub/themes/${theme}/styles.css`}></link>}
      </ErrorBoundary>
    </EventProvider>
  );
}
export default MyApp;
