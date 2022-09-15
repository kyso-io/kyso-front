/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LayoutProps } from '@/types/pageWithLayout';

import { Meta } from './Meta';

const NoLayout: LayoutProps = ({ children }: any) => {
  // @typescript-eslint/no-explicit-any
  return (
    <>
      <Meta title="Kyso" description="A place to share, organise and discover notebooks, markdown, mdx, static HTML sites, data apps, and more." />
      <div className="h-screen w-screen">{children}</div>
    </>
  );
};
export default NoLayout;
