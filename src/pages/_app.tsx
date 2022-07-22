import '../styles/globals.css';

import { store } from '@kyso-io/kyso-store';
import type { AppProps } from 'next/app';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import type { PageWithLayoutType } from '../types/pageWithLayout';

type AppLayoutProps = AppProps & {
  Component: PageWithLayoutType;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  pageProps: any;
};
function MyApp({ Component, pageProps }: AppLayoutProps) {
  const Layout = Component.layout || ((children: ReactElement) => <>{children}</>);
  return (
    <Provider store={store}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
}
export default MyApp;
