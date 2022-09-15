import type { LayoutProps } from '@/types/pageWithLayout';

import { Meta } from './Meta';

/* eslint-disable @typescript-eslint/no-explicit-any */
const AdminLayout: LayoutProps = ({ children }: any) => {
  return (
    <>
      <Meta title="Kyso" description="A place to share, organise and discover notebooks, markdown, mdx, static HTML sites, data apps, and more." />
      <div>Admin: </div>
      <main>{children}</main>
    </>
  );
};
export default AdminLayout;
