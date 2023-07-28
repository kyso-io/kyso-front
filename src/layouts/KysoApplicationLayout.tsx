/* eslint-disable @typescript-eslint/no-explicit-any */
import CaptchaModal from '@/components/CaptchaModal';
import PureKysoApplicationLayout from '@/components/PureKysoApplicationLayout';
import ToasterNotification from '@/components/ToasterNotification';
import { ToasterIcons } from '@/enums/toaster-icons';
import { checkJwt } from '@/helpers/check-jwt';
import { getCommonData } from '@/helpers/get-common-data';
import { getReport } from '@/helpers/get-report';
import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { TailwindColor } from '@/tailwind/enum/tailwind-color.enum';
import type { CommonData } from '@/types/common-data';
import type { LayoutProps } from '@/types/pageWithLayout';
import type { ReportData } from '@/types/report-data';
import type { NormalizedResponseDTO, Organization, Team, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';
import { KysoSettingsEnum, WebSocketEvent } from '@kyso-io/kyso-model';
import { Api, logoutAction, setOrganizationAuthAction, setTeamAuthAction, setTokenAuthAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { Helper } from '../helpers/Helper';
import { websocket } from '../helpers/websocket';
import { usePublicSetting } from '../hooks/use-public-setting';

type IUnpureKysoApplicationLayoutProps = {
  children: ReactElement;
};

const KysoApplicationLayout: LayoutProps = ({ children }: IUnpureKysoApplicationLayoutProps) => {
  const router = useRouter();
  const [commonData, setCommonData] = useState<CommonData>({
    permissions: null,
    token: null,
    organization: null,
    httpCodeOrganization: null,
    errorOrganization: null,
    team: null,
    httpCodeTeam: null,
    errorTeam: null,
    user: null,
  });
  const hcaptchEnabledStr: any | null = usePublicSetting(KysoSettingsEnum.HCAPTCHA_ENABLED);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [toasterMessage, setToasterMessage] = useState<string>('');
  const [toasterIcon, setToasterIcon] = useState<JSX.Element>(ToasterIcons.INFO);
  const [toasterVisible, setToasterVisible] = useState<boolean>(false);
  const [isCaptchaEnabled, setIsCaptchaEnabled] = useState<boolean>(false);
  const [showCaptchaModal, setShowCaptchaModal] = useState<boolean>(false);
  const [isUserLogged, setIsUserLogged] = useState<boolean>(false);

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
        Helper.getKysoPublicSettings();
        websocket.disconnect();
        router.replace(`/login`);
      },
    },
  ];

  useEffect(() => {
    if (!websocket.isConnected || !commonData.token || !commonData.user) {
      return;
    }
    websocket.on(WebSocketEvent.REFRESH_PERMISSIONS, async () => {
      try {
        const api: Api = new Api(commonData.token);
        const response: NormalizedResponseDTO<TokenPermissions> = await api.getUserPermissions(commonData.user!.username);
        setCommonData({ ...commonData, permissions: response.data });
      } catch (e) {}
    });
    return () => {
      websocket.off(WebSocketEvent.REFRESH_PERMISSIONS);
    };
  }, [commonData.token, commonData.user]);

  useEffect(() => {
    const result: boolean = checkJwt();
    setIsUserLogged(result);
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
    if (!hcaptchEnabledStr) {
      return;
    }
    setIsCaptchaEnabled(hcaptchEnabledStr === 'true');
  }, [hcaptchEnabledStr]);

  useEffect(() => {
    // Early set report data to null to re-render as soon as possible
    if (!router.query.reportName) {
      setReportData(null);
    }

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
      const cd: { organization: Organization | null; team: Team | null; httpCodeOrganization: number | null; errorOrganization: string | null; httpCodeTeam: number | null; errorTeam: string | null } =
        await getCommonData({
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
      const getReportData = async () => {
        const data: ReportData | null = await getReport({
          token: commonData.token,
          team: cd.team,
          reportName: router.query.reportName as string,
          version,
        });
        setReportData(data);
      };
      getReportData();
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

  /**
   * Evaluates if the captcha configuration is enabled and if the user has resolved the captcha successfully.
   *
   * If not, shows the captcha modal
   *
   * @returns false if the user didn't resolved the captcha, true in the contrary
   */
  const isCurrentUserSolvedCaptcha = (): boolean => {
    if (isCaptchaEnabled && commonData.user && commonData.user.show_captcha) {
      setShowCaptchaModal(true);
      return false;
    }

    setShowCaptchaModal(false);
    return true;
  };

  /**
   * Checks if the user is verified. If not, shows a toaster remembering it.
   *
   * @returns true if is verified, false if not
   */
  const isCurrentUserVerified = (): boolean => {
    if (commonData.user && !commonData.user.email_verified) {
      showToaster(
        `Please <b>verify your email account</b> to be able to make changes on Kyso. <br/><br/>
        <a target="_blank" href="/user/${commonData.user.username}/settings/">
          <button type="button"
            class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900 ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white k-bg-primary">
            Send another verification mail
          </button>
        </a>`,
        ToasterIcons.INFO,
      );
      return false;
    }
    return true;
  };

  const onCloseCaptchaModal = async (refreshUser: boolean) => {
    setShowCaptchaModal(false);
    if (refreshUser) {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
      setUser(result.data);
    }
    hideToaster();
  };

  return (
    <PureKysoApplicationLayout commonData={commonData} report={reportData ? reportData.report : null} basePath={router.basePath} userNavigation={userNavigation}>
      <React.Fragment>
        {React.cloneElement(children, { commonData, reportData, setReportData, setUser, showToaster, hideToaster, isCurrentUserSolvedCaptcha, isCurrentUserVerified, isUserLogged, isCaptchaEnabled })}
        <ToasterNotification show={toasterVisible} setShow={setToasterVisible} icon={toasterIcon} message={toasterMessage} backgroundColor={TailwindColor.SLATE_50} />
        {commonData.user && <CaptchaModal user={commonData.user!} open={showCaptchaModal} onClose={onCloseCaptchaModal} />}
        {/* <Terminal /> */}
      </React.Fragment>
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
  isCurrentUserSolvedCaptcha: () => boolean;
  isCurrentUserVerified: () => boolean;
  isUserLogged: boolean;
  isCaptchaEnabled: boolean;
}
