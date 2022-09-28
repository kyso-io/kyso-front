import { Helper } from '@/helpers/Helper';
import type { KeyValue } from '@/model/key-value.model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { logoutAction } from '@kyso-io/kyso-store';
import decode from 'jwt-decode';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import type { DecodedToken } from '../types/decoded-token';
import { useAppDispatch } from './redux-hooks';

export const useRedirectIfNoJWT = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const fetcher = async () => {
    const jwt: string = localStorage.getItem('jwt') as string;
    if (!jwt && !router.query.redirect) {
      let unauthorizedRedirectUrl = '/login';
      const publicKeys: KeyValue[] = await Helper.getKysoPublicSettings();
      if (publicKeys !== null && publicKeys.length > 0) {
        const settingsUnauthRedirect: KeyValue | undefined = publicKeys.find((x: KeyValue) => x.key === KysoSettingsEnum.UNAUTHORIZED_REDIRECT_URL);
        if (settingsUnauthRedirect) {
          unauthorizedRedirectUrl = settingsUnauthRedirect.value;
          if (unauthorizedRedirectUrl.includes('http')) {
            window.location.href = unauthorizedRedirectUrl;
            return;
          }
        }
      }
      if (router?.asPath && router.asPath.length > 0) {
        sessionStorage.setItem('redirectUrl', router.asPath);
      }
      router.push(unauthorizedRedirectUrl);
      return;
    }

    const jwtToken: DecodedToken = decode<DecodedToken>(jwt);
    if (new Date(jwtToken.exp * 1000) <= new Date()) {
      // token is out of date
      localStorage.removeItem('jwt');
      localStorage.removeItem('shownVerifiedAlert');
      sessionStorage.setItem('redirectUrl', router.asPath);
      await dispatch(logoutAction());
      router.replace(`/login`);
    }
  };

  const [mounted, setMounted] = useState(false);
  useSWR(mounted ? 'use-redirect' : null, fetcher);
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    setMounted(true);
  }, [router.query]);
};
