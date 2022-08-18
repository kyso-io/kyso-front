import PureKysoApplicationLayout from '@/components/PureKysoApplicationLayout';
import { Helper } from '@/helpers/Helper';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useReport } from '@/hooks/use-report';
import type { LayoutProps } from '@/types/pageWithLayout';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';

type IUnpureKysoApplicationLayoutProps = {
  children: ReactElement;
};

const KysoApplicationLayout: LayoutProps = ({ children }: IUnpureKysoApplicationLayoutProps) => {
  const router = useRouter();
  const commonData: CommonData = useCommonData();

  const [report] = useReport({
    commonData,
    reportName: router.query.reportName as string,
  });

  let slugifiedName = '';
  if (commonData?.user && commonData?.user?.username) {
    slugifiedName = Helper.slugify(commonData?.user?.username);
  }

  const userNavigation = [
    { name: 'My profile', href: `${router.basePath}/user/${slugifiedName}`, newTab: false },
    {
      name: 'Settings',
      href: `${router.basePath}/in/settings`,
      newTab: false,
    },
    { name: 'Feedback', href: `${router.basePath}/in/feedback`, newTab: false },
    {
      name: 'Documentation',
      href: `https://docs.kyso.io/`,
      newTab: true,
    },
    { name: 'Sign out', href: `${router.basePath}/logout`, newTab: false },
  ];

  return (
    <PureKysoApplicationLayout commonData={commonData} report={report} basePath={router.basePath} userNavigation={userNavigation}>
      {children}
    </PureKysoApplicationLayout>
  );
};
export default KysoApplicationLayout;
