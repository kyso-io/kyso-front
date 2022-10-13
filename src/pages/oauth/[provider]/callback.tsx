/* eslint-disable @typescript-eslint/no-explicit-any */
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { KysoSetting, LoginProviderEnum, NormalizedResponseDTO, Token } from '@kyso-io/kyso-model';
import { KysoSettingsEnum, Login } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import decode from 'jwt-decode';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { DecodedToken } from '../../../types/decoded-token';

const Page = () => {
  const router = useRouter();
  const { code, provider } = router.query;
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const api: Api = new Api();
        const resultKysoSetting: NormalizedResponseDTO<KysoSetting[]> = await api.getPublicSettings();
        const index: number = resultKysoSetting.data.findIndex((item: KysoSetting) => item.key === KysoSettingsEnum.HCAPTCHA_ENABLED);
        if (index !== -1) {
          setCaptchaIsEnabled(resultKysoSetting.data[index]!.value === 'true');
        } else {
          setCaptchaIsEnabled(false);
        }
      } catch (errorHttp: any) {
        console.error(errorHttp.response.data);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (captchaIsEnabled === null) {
      return;
    }
    if (!code || !provider) {
      return;
    }
    const makeLogin = async () => {
      try {
        const api: Api = new Api();
        const login: Login = new Login(code as string, provider as LoginProviderEnum, '', `${window.location.origin}/oauth/${provider}/callback`);
        const resultLogin: NormalizedResponseDTO<string> = await api.login(login);
        const token: string = resultLogin.data;
        localStorage.setItem('jwt', token);
        // Get user info to check if has completed the captcha challenge
        const jwtToken: DecodedToken = decode<DecodedToken>(token);
        const user: Token = jwtToken.payload;
        setTimeout(() => {
          if (captchaIsEnabled && user.show_captcha) {
            router.push('/captcha');
          } else {
            router.push('/');
          }
        }, 500);
      } catch (e: any) {
        const message: string = Array.isArray(e.response.data.message) ? e.response.data.message.join('. ') : e.response.data.message;
        router.push(`/login?error=${encodeURIComponent(message)}`);
      }
    };
    makeLogin();
  }, [code, captchaIsEnabled]);

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-slate-50 border py-8 px-4 shadow sm:rounded-lg sm:px-10">loading...</div>
    </div>
  );
};

Page.layout = KysoApplicationLayout;

export default Page;
