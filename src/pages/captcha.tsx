import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
import type { KysoSetting, NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import ToasterNotification from '../components/ToasterNotification';
import { checkJwt } from '../helpers/check-jwt';
import type { CommonData } from '../types/common-data';

const DEFAULT_CAPTCHA_SITE_KEY = '22';

interface Props {
  commonData: CommonData;
}

function isBrowser() {
  if (typeof window !== 'undefined') {
    return true;
  }
  return false;
}

const Index = ({ commonData }: Props) => {
  const router = useRouter();
  const { invitation } = router.query;
  const hCaptchaRef = useRef(null);
  const [captchaSiteKey, setCaptchaSiteKey] = useState<string>(DEFAULT_CAPTCHA_SITE_KEY);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [alertText, setAlertText] = useState<string>('');
  const [show, setShow] = useState<boolean>(false);
  const [requesting, setRequesting] = useState<boolean>(false);
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);

  useEffect(() => {
    const result: boolean = checkJwt();
    setUserIsLogged(result);
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
    if (!commonData.user) {
      return;
    }
    const redirectUrl: string | null = sessionStorage.getItem('redirectUrl') || '/';
    if (!commonData.user!.show_captcha) {
      setTimeout(() => router.replace(redirectUrl), 500);
      return;
    }
    const getData = async () => {
      const api: Api = new Api();
      const response: NormalizedResponseDTO<KysoSetting[]> = await api.getPublicSettings();
      const captchaEnabledKysoSetting: KysoSetting | undefined = response.data.find((kysoSetting: KysoSetting) => kysoSetting.key === KysoSettingsEnum.HCAPTCHA_ENABLED);
      const captchaEnabled: boolean = captchaEnabledKysoSetting === undefined || captchaEnabledKysoSetting.value === 'true';

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
      const captchaSiteKeyKysoSetting: KysoSetting | undefined = response.data.find((kysoSetting: KysoSetting) => kysoSetting.key === KysoSettingsEnum.HCAPTCHA_SITE_KEY);
      if (!captchaSiteKeyKysoSetting) {
        /* eslint-disable no-alert */
        alert('Captcha is enabled but no site key is set. Please contact support.');
        return;
      }
      setCaptchaSiteKey(captchaSiteKeyKysoSetting.value);
    };
    getData();
  }, [commonData.user]);

  const onSubmit = async () => {
    if (!captchaToken) {
      setShow(true);
      setAlertText('Please verify that you are not a robot.');
      return;
    }
    setRequesting(true);
    const api: Api = new Api(commonData.token);

    const response: NormalizedResponseDTO<boolean> = await api.verifyCaptcha(captchaToken);
    if (response?.data) {
      const redirectUrl: string | null = sessionStorage.getItem('redirectUrl') || '/';

      const showOnboarding = commonData.user?.show_onboarding ? commonData.user?.show_onboarding : false;

      if (isBrowser()) {
        sessionStorage.removeItem('redirectUrl');
      }
      setTimeout(() => {
        if (showOnboarding) {
          router.replace('/overview');
        }
        if (invitation) {
          router.replace(invitation as string);
        } else {
          router.replace(redirectUrl);
        }
      }, 200);
    } else {
      setShow(true);
      setAlertText('Please verify that you are not a robot.');
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
      <ToasterNotification show={show} setShow={setShow} icon={<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />} message={alertText} />
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
