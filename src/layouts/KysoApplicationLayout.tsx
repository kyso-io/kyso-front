/* eslint-disable @typescript-eslint/no-explicit-any */
import PureKysoApplicationLayout from '@/components/PureKysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import type { LayoutProps } from '@/types/pageWithLayout';
import type { ReportData } from '@/types/report-data';
import type { NormalizedResponseDTO, Organization, Team, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';
import { Api, logoutAction, setOrganizationAuthAction, setTeamAuthAction, setTokenAuthAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { checkJwt } from '@/helpers/check-jwt';
import { getCommonData } from '@/helpers/get-common-data';
import { getReport } from '@/helpers/get-report';
import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import { useAppDispatch } from '@/hooks/redux-hooks';
import ToasterNotification from '@/components/ToasterNotification';
import { ToasterIcons } from '@/enums/toaster-icons';
import { TailwindColor } from '@/tailwind/enum/tailwind-color.enum';

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
  const [toasterMessage, setToasterMessage] = useState<string>('');
  const [toasterIcon, setToasterIcon] = useState<JSX.Element>(ToasterIcons.INFO);
  const [toasterVisible, setToasterVisible] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const userNavigation = [
    { name: 'My profile', href: `${router.basePath}/user/${commonData?.user?.username}`, newTab: false },
    {
      name: 'Settings',
      href: `/user/${commonData.user?.username}/settings`,
      newTab: false,
    },
    { name: 'Get started', href: `${router.basePath}/overview`, newTab: false },
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
        } catch (e) {
          localStorage.removeItem('jwt');
          localStorage.removeItem('shownVerifiedAlert');
          sessionStorage.clear();
          await dispatch(logoutAction());
          router.replace(`/login`);
        }
        try {
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
    const username: string | undefined = router.query.username as string | undefined;
    const getData = async () => {
      if (!organizationName && !teamName && !commonData.token) {
        if (commonData.permissions!.organizations!.length === 0) {
          // No public organizations available
          router.replace(`/login`);
          return;
        }
        if (username) {
          return;
        }
        if (router.pathname !== '/search') {
          // Redirect user to the first public organization available on permissions
          router.replace(`/${commonData.permissions!.organizations![0]!.name}`);
          return;
        }
      }
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

  const showToaster = (message: string, icon: JSX.Element) => {
    setToasterMessage(message);
    setToasterIcon(icon);
    setToasterVisible(true);
  };

  const hideToaster = () => {
    setToasterVisible(false);
    setToasterIcon(ToasterIcons.INFO);
    setToasterMessage('');
  };

  return (
    <PureKysoApplicationLayout commonData={commonData} report={reportData ? reportData.report : null} basePath={router.basePath} userNavigation={userNavigation}>
      <>
        {React.cloneElement(children, { commonData, reportData, setReportData, setUser, showToaster, hideToaster })}
        <ToasterNotification show={toasterVisible} setShow={setToasterVisible} icon={toasterIcon} message={toasterMessage} backgroundColor={TailwindColor.SLATE_50} />
      </>
    </PureKysoApplicationLayout>
  );
};
export default KysoApplicationLayout;

export interface IKysoApplicationLayoutProps {
  commonData: CommonData;
  reportData: ReportData | null;
  setReportData: React.Dispatch<React.SetStateAction<ReportData | null>>;
  setUser: (user: UserDTO) => void;
  showToaster: (message: string, icon: JSX.Element) => void;
  hideToaster: () => void;
}
