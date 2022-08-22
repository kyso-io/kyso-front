import PureKysoApplicationLayout from '@/components/PureKysoApplicationLayout';
import { Helper } from '@/helpers/Helper';
import type { CommonData } from '@/types/common-data';
import type { LayoutProps } from '@/types/pageWithLayout';
import type { ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import { setTokenAuthAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getCommonData } from '../helpers/get-common-data';
import { getReport } from '../helpers/get-report';

type IUnpureKysoApplicationLayoutProps = {
  children: ReactElement;
};

const KysoApplicationLayout: LayoutProps = ({ children }: IUnpureKysoApplicationLayoutProps) => {
  const router = useRouter();
  const [commonData, setCommonData] = useState<CommonData | null>(null);
  const [reportData, setReportData] = useState<{ report: ReportDTO | null | undefined; authors: UserDTO[] } | null>(null);
  const dispatch = useDispatch();

  let slugifiedName = '';
  if (commonData?.user && commonData?.user?.display_name) {
    slugifiedName = Helper.slugify(commonData?.user?.display_name);
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

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const organizationName: string | undefined = router.query.organizationName as string | undefined;
    const teamName: string | undefined = router.query.teamName as string | undefined;
    const getData = async () => {
      const cd: CommonData = await getCommonData({
        organizationName: organizationName as string,
        teamName: teamName as string,
      });
      // TODO: remove use of store in the near future
      dispatch(setTokenAuthAction(cd.token));
      setCommonData(cd);
      if (router.query.reportName) {
        const getReportData = async () => {
          const data: { report: ReportDTO | null | undefined; authors: UserDTO[] } = await getReport({
            commonData: cd,
            reportName: router.query.reportName as string,
          });
          setReportData(data);
        };
        getReportData();
      }
    };
    getData();
  }, [router.asPath]);

  return (
    <React.Fragment>
      {commonData && router.isReady && (
        <PureKysoApplicationLayout commonData={commonData} report={reportData ? reportData.report : null} basePath={router.basePath} userNavigation={userNavigation}>
          {React.cloneElement(children, { commonData })}
        </PureKysoApplicationLayout>
      )}
    </React.Fragment>
  );
};
export default KysoApplicationLayout;
