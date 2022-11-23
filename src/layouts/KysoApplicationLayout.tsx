/* eslint-disable @typescript-eslint/no-explicit-any */
import PureKysoApplicationLayout from '@/components/PureKysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import type { LayoutProps } from '@/types/pageWithLayout';
import type { ReportData } from '@/types/report-data';
import type { NormalizedResponseDTO, Organization, Team, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { Api, logoutAction, setOrganizationAuthAction, setTeamAuthAction, setTokenAuthAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { checkJwt } from '../helpers/check-jwt';
import { getCommonData } from '../helpers/get-common-data';
import { getReport } from '../helpers/get-report';
import { Helper } from '../helpers/Helper';
import { getLocalStorageItem } from '../helpers/isomorphic-local-storage';
import { useAppDispatch } from '../hooks/redux-hooks';
import type { KeyValue } from '../model/key-value.model';

type IUnpureKysoApplicationLayoutProps = {
  children: ReactElement;
};

const KysoApplicationLayout: LayoutProps = ({ children }: IUnpureKysoApplicationLayoutProps) => {
  const router = useRouter();
  const [theme, setTheme] = useState<string | null>(null);
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

  const userNavigation = [
    { name: 'My profile', href: `${router.basePath}/user/${commonData?.user?.username}`, newTab: false },
    {
      name: 'Settings',
      href: `/user/${commonData.user?.username}/settings`,
      newTab: false,
    },
    { name: 'Feedback', href: `${router.basePath}/feedback`, newTab: false },
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
        sessionStorage.clear();
        await dispatch(logoutAction());
        router.replace(`/login`);
      },
    },
  ];

  useEffect(() => {
    checkJwt();
    const getTheme = async () => {
      const publicKeys: KeyValue[] = await Helper.getKysoPublicSettings();
      const keyValue: KeyValue | undefined = publicKeys.find((x) => x.key === KysoSettingsEnum.THEME);
      if (keyValue && keyValue.value) {
        setTheme(keyValue.value);
      }
    };
    const getData = async () => {
      const token: string | null = getLocalStorageItem('jwt');
      // TODO: remove use of store in the near future
      dispatch(setTokenAuthAction(token));
      const api: Api = new Api(token);
      let permissions: TokenPermissions | null = null;
      let user: UserDTO | null = null;
      if (token) {
        api.setToken(token);
        try {
          const responseUserDto: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
          user = responseUserDto.data;
          const response: NormalizedResponseDTO<TokenPermissions> = await api.getUserPermissions(user!.username);
          permissions = response.data;
        } catch (e) {}
      } else {
        try {
          const response: NormalizedResponseDTO<TokenPermissions> = await api.getPublicPermissions();
          permissions = response.data;
        } catch (e) {}
      }
      setCommonData({ ...commonData, user, permissions, token });
    };
    getData();
    getTheme();
  }, []);

  useEffect(() => {
    if (!commonData.permissions) {
      return;
    }
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
      const cd: { organization: Organization | null; team: Team | null; errorOrganization: string | null; errorTeam: string | null } = await getCommonData({
        token: commonData.token,
        permissions: commonData.permissions!,
        user: commonData.user!,
        organizationName: organizationName as string,
        teamName: teamName as string,
      });
      setCommonData({ ...commonData, ...cd });
      let version: number = 0;
      if (router.query.version && !Number.isNaN(router.query.version as any)) {
        version = parseInt(router.query.version as string, 10);
      }
      if (router.query.reportName) {
        const getReportData = async () => {
          const data: ReportData = await getReport({
            token: commonData.token,
            team: cd.team,
            reportName: router.query.reportName as string,
            version,
          });
          setReportData(data);
        };
        getReportData();
      }
    };
    getData();
  }, [commonData.permissions, router?.isReady, router.query?.organizationName, router.query?.teamName, router.query?.reportName, router.query?.version]);

  const setUser = (user: UserDTO): void => {
    setCommonData({
      ...commonData!,
      user,
    });
  };

  return (
    <React.Fragment>
      <PureKysoApplicationLayout commonData={commonData} report={reportData ? reportData.report : null} basePath={router.basePath} userNavigation={userNavigation}>
        {React.cloneElement(children, { commonData, reportData, setReportData, setUser })}
      </PureKysoApplicationLayout>
      {theme && <link rel="stylesheet" href={`/pub/themes/${theme}/styles.css`}></link>}
    </React.Fragment>
  );
};
export default KysoApplicationLayout;
