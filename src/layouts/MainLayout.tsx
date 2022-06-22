import type { LayoutProps } from '@/types/pageWithLayout';

const MainLayout: LayoutProps = ({ children }: any) => {
  return (
    <div>
      Main:
      {children}
    </div>
  );
};
export default MainLayout;
