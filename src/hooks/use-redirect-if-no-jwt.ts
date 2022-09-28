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

  let publicKeys: KeyValue[];

  const fetcher = async () => {
    publicKeys = await Helper.getKysoPublicSettings();

    let unauthorizedRedirectUrl;
    if (publicKeys) {
      const settingsUnauthRedirect = publicKeys.find((x: KeyValue) => x.key === KysoSettingsEnum.UNAUTHORIZED_REDIRECT_URL);
      if (settingsUnauthRedirect) {
        unauthorizedRedirectUrl = settingsUnauthRedirect.value;
      } else {
        unauthorizedRedirectUrl = '/login';
      }
    } else {
      unauthorizedRedirectUrl = '/login';
    }

    const jwt: string = localStorage.getItem('jwt') as string;

    if (!jwt && router.query.redirect === undefined) {
      let redirectUrl = '?redirect=';
      if (router?.asPath && router.asPath.length > 0) {
        redirectUrl += `${router.basePath}${router.asPath}`;
      }

      if (window.location.pathname === router.basePath) {
        // We are at the base of the URL, redirect to unauthorized redirect URL
        router.push(unauthorizedRedirectUrl);
      } else {
        // We are in other place, redirect to login
        router.push(`/login${redirectUrl}`);
      }

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
