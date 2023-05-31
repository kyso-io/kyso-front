/* eslint-disable @typescript-eslint/no-explicit-any */
import { ToasterIcons } from '@/enums/toaster-icons';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import type { NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { checkJwt } from '../helpers/check-jwt';
import { usePublicSettings } from '../hooks/use-public-settings';

const DEFAULT_CAPTCHA_SITE_KEY = '22';

function isBrowser() {
  if (typeof window !== 'undefined') {
    return true;
  }
  return false;
}

const Index = ({ commonData, showToaster }: IKysoApplicationLayoutProps) => {
  const router = useRouter();
  const kysoSettingValues: (any | null)[] = usePublicSettings([KysoSettingsEnum.HCAPTCHA_ENABLED, KysoSettingsEnum.HCAPTCHA_SITE_KEY]);
  const { invitation, redirect } = router.query;
  const hCaptchaRef = useRef(null);
  const [captchaSiteKey, setCaptchaSiteKey] = useState<string>(DEFAULT_CAPTCHA_SITE_KEY);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [requesting, setRequesting] = useState<boolean>(false);
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);

  useEffect(() => {
    const result: boolean = checkJwt();
    setUserIsLogged(result);

    const alertMessage: string | null = sessionStorage.getItem('alertMessage');
    if (alertMessage) {
      showToaster(alertMessage, ToasterIcons.INFO);
      sessionStorage.removeItem('alertMessage');
    }
  }, []);

  useEffect(() => {
    if (userIsLogged === null) {
      return;
    }
    if (userIsLogged === false) {
      // An unautenticated user is trying to access
      router.replace('/');
    }
  }, [userIsLogged]);

  useEffect(() => {
    if (!commonData.user || !kysoSettingValues || kysoSettingValues.length < 2) {
      return;
    }
    const redirectUrl: string | null = sessionStorage.getItem('redirectUrl') || '/';
    if (!commonData.user!.show_captcha) {
      setTimeout(() => router.replace(redirectUrl), 500);
      return;
    }
    const captchaEnabled: boolean = kysoSettingValues[0] === null || kysoSettingValues[0] === 'true';
    if (!captchaEnabled) {
      if (commonData.user?.show_onboarding) {
        router.push('/overview');
        return;
      }
      if (isBrowser()) {
        sessionStorage.removeItem('redirectUrl');
      }
      setTimeout(() => router.replace(redirectUrl), 200);
      return;
    }
    if (!kysoSettingValues[1]) {
      /* eslint-disable no-alert */
      alert('Captcha is enabled but no site key is set. Please contact support.');
      return;
    }
    setCaptchaSiteKey(kysoSettingValues[1]);
  }, [commonData.user, kysoSettingValues]);

  const onSubmit = async () => {
    if (!captchaToken) {
      showToaster('Please verify that you are not a robot solving this captcha', ToasterIcons.INFO);
      return;
    }
    setRequesting(true);
    const api: Api = new Api(commonData.token);

    const response: NormalizedResponseDTO<boolean> = await api.verifyCaptcha(captchaToken);
    if (response?.data) {
      const redirectUrl: string | null = sessionStorage.getItem('redirectUrl') || (redirect as string) || '/';

      const showOnboarding = commonData.user?.show_onboarding ? commonData.user?.show_onboarding : false;

      if (isBrowser()) {
        sessionStorage.removeItem('redirectUrl');
      }
      setTimeout(() => {
        // If there is an invitation or a redirect url, that's the priority.
        if (invitation) {
          router.replace(invitation as string);
          return;
        }

        if (redirectUrl) {
          router.replace(redirectUrl);
          return;
        }

        if (showOnboarding) {
          router.replace('/overview');
        }
      }, 200);
    } else {
      showToaster('Please verify that you are not a robot.', ToasterIcons.INFO);
    }
    setRequesting(false);
  };

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-1/6"></div>
      <div className="w-4/6">
        <div className="mt-4">
          <HCaptcha ref={hCaptchaRef} sitekey={captchaSiteKey} onVerify={setCaptchaToken} />
          {captchaSiteKey && captchaSiteKey !== DEFAULT_CAPTCHA_SITE_KEY && (
            <button
              onClick={onSubmit}
              disabled={!captchaToken || requesting}
              type="button"
              className={clsx(
                'mt-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                (!captchaToken || requesting) && 'opacity-50 cursor-not-allowed',
              )}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
