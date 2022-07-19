import type { LayoutProps } from '@/types/pageWithLayout';

import { Meta } from './Meta';

/* eslint-disable @typescript-eslint/no-explicit-any */
const AdminLayout: LayoutProps = ({ children }: any) => {
  return (
    <>
      <Meta title="Next.js Boilerplate Presentation" description="Next js Boilerplate is the perfect starter code for your project. Build your React application with the Next.js framework." />
      <div>Admin: </div>
      <main>{children}</main>
    </>
  );
};
export default AdminLayout;
