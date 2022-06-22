import '../styles/globals.css';

import type { AppProps } from 'next/app';
import type { ReactElement } from 'react';

import type { PageWithLayoutType } from '../types/pageWithLayout';

type AppLayoutProps = AppProps & {
  Component: PageWithLayoutType;
  pageProps: any;
};
function MyApp({ Component, pageProps }: AppLayoutProps) {
  const Layout =
    Component.layout || ((children: ReactElement) => <>{children}</>);
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
export default MyApp;
