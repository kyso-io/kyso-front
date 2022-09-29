/* eslint-disable @typescript-eslint/no-explicit-any */
import PureKysoApplicationLayout from '@/components/PureKysoApplicationLayout';
import { Helper } from '@/helpers/Helper';
import type { CommonData } from '@/types/common-data';
import type { LayoutProps } from '@/types/pageWithLayout';
import type { ReportData } from '@/types/report-data';
import type { UserDTO } from '@kyso-io/kyso-model';
import { logoutAction, setOrganizationAuthAction, setTeamAuthAction, setTokenAuthAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { getCommonData } from '../helpers/get-common-data';
import { getReport } from '../helpers/get-report';
import { useAppDispatch } from '../hooks/redux-hooks';

type IUnpureKysoApplicationLayoutProps = {
  children: ReactElement;
};

const KysoApplicationLayout: LayoutProps = ({ children }: IUnpureKysoApplicationLayoutProps) => {
  const router = useRouter();
  const [commonData, setCommonData] = useState<CommonData>({
    permissions: null,
    token: null,
    organization: null,
    errorOrganization: null,
    team: null,
    errorTeam: null,
    user: null,
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const dispatch = useAppDispatch();

  let slugifiedName = '';
  if (commonData?.user && commonData?.user?.username) {
    slugifiedName = Helper.slugify(commonData?.user?.username);
  }

  const userNavigation = [
    { name: 'My profile', href: `${router.basePath}/user/${slugifiedName}`, newTab: false },
    {
      name: 'Settings',
      href: `/settings`,
      newTab: false,
    },
    { name: 'Feedback', href: `${router.basePath}/in/feedback`, newTab: false },
    {
      name: 'Documentation',
      href: `https://docs.kyso.io/`,
      newTab: true,
    },
    {
      name: 'Sign out',
      newTab: false,
      callback: async () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('shownVerifiedAlert');
        sessionStorage.setItem('redirectUrl', router.asPath);
        await dispatch(logoutAction());
        router.replace(`/login`);
      },
    },
  ];

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const organizationName: string | undefined = router.query.organizationName as string | undefined;
    if (organizationName) {
      dispatch(setOrganizationAuthAction(organizationName));
    }
    const teamName: string | undefined = router.query.teamName as string | undefined;
    if (teamName) {
      dispatch(setTeamAuthAction(teamName));
    }
    const getData = async () => {
      const cd: CommonData = await getCommonData({
        organizationName: organizationName as string,
        teamName: teamName as string,
      });
      // TODO: remove use of store in the near future
      dispatch(setTokenAuthAction(cd.token));
      setCommonData(cd);
      let version: number = 0;
      if (router.query.version && !Number.isNaN(router.query.version as any)) {
        version = parseInt(router.query.version as string, 10);
      }
      if (router.query.reportName) {
        const getReportData = async () => {
          const data: ReportData = await getReport({
            commonData: cd,
            reportName: router.query.reportName as string,
            version,
          });
          setReportData(data);
        };
        getReportData();
      }
    };
    getData();
  }, [router.asPath]);

  const setUser = (user: UserDTO): void => {
    setCommonData({
      ...commonData!,
      user,
    });
  };

  return (
    <PureKysoApplicationLayout commonData={commonData} report={reportData ? reportData.report : null} basePath={router.basePath} userNavigation={userNavigation}>
      {React.cloneElement(children, { commonData, reportData, setReportData, setUser })}
    </PureKysoApplicationLayout>
  );
};
export default KysoApplicationLayout;
