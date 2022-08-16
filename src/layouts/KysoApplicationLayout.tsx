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
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });

  const [report] = useReport({
    commonData,
    reportName: router.query.reportName as string,
  });

  let slugifiedName = '';
  if (commonData?.user && commonData?.user?.display_name) {
    slugifiedName = Helper.slugify(commonData?.user?.display_name);
  }
  const userNavigation = [
    { name: 'Your Profile', href: `${router.basePath}/user/${slugifiedName}` },
    {
      name: 'Your settings',
      href: `${router.basePath}/in/settings`,
    },
    { name: 'Sign out', href: `${router.basePath}/logout` },
  ];

  return (
    <PureKysoApplicationLayout commonData={commonData} report={report} basePath={router.basePath} userNavigation={userNavigation}>
      {children}
    </PureKysoApplicationLayout>
  );
};
export default KysoApplicationLayout;
