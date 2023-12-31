/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LoginProviderEnum, NormalizedResponseDTO, Token } from '@kyso-io/kyso-model';
import { KysoSettingsEnum, Login } from '@kyso-io/kyso-model';
import type { AppDispatch } from '@kyso-io/kyso-store';
import { Api, setTokenAuthAction } from '@kyso-io/kyso-store';
import decode from 'jwt-decode';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { usePublicSetting } from '../../../hooks/use-public-setting';
import MainLayout from '../../../layouts/MainLayout';
import type { DecodedToken } from '../../../types/decoded-token';

const Page = () => {
  const router = useRouter();
  const hcaptchaEnabledStr: any | null = usePublicSetting(KysoSettingsEnum.HCAPTCHA_ENABLED);
  const dispatch = useDispatch<AppDispatch>();
  const { code, provider, state } = router.query;
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    if (!hcaptchaEnabledStr) {
      return;
    }
    setCaptchaIsEnabled(hcaptchaEnabledStr === 'true');
  }, [hcaptchaEnabledStr]);

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
        dispatch(setTokenAuthAction(token));
        localStorage.setItem('jwt', token);
        // Get user info to check if has completed the captcha challenge
        const jwtToken: DecodedToken = decode<DecodedToken>(token);
        const user: Token = jwtToken.payload;
        setTimeout(() => {
          if (captchaIsEnabled && user.show_captcha) {
            router.push(`/captcha${state ? `?invitation=${state as string}` : ''}`);
          } else if (state) {
            router.push(state as string);
          } else if (user.show_onboarding) {
            router.push('/overview');
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

Page.layout = MainLayout;

export default Page;
