import useSWR from "swr";
import decode from "jwt-decode";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Token } from "@kyso-io/kyso-model";
import { KysoSettingsEnum } from "@kyso-io/kyso-model";
import { Helper } from "@/helpers/Helper";
import type { KeyValue } from "@/model/key-value.model";

export type DecodedToken = {
  exp: number;
  iat: number;
  iss: string;
  payload: Token;
};

// export type IUseRedirectProps = {};

export const useRedirectIfNoJWT = () => {
  const router = useRouter();

  let publicKeys: KeyValue[];

  const fetcher = async () => {
    publicKeys = await Helper.getKysoPublicSettings();

    let unauthorizedRedirectUrl;
    if (publicKeys) {
      const settingsUnauthRedirect = publicKeys.find((x: KeyValue) => x.key === KysoSettingsEnum.UNAUTHORIZED_REDIRECT_URL);
      if (settingsUnauthRedirect) {
        unauthorizedRedirectUrl = settingsUnauthRedirect.value;
      } else {
        unauthorizedRedirectUrl = "/login";
      }
    } else {
      unauthorizedRedirectUrl = "/login";
    }

    const jwt: string = localStorage.getItem("jwt") as string;

    if (!jwt && router.query.redirect === undefined) {
      let redirectUrl = "?redirect=";
      if (router?.asPath && router.asPath.length > 0) {
        redirectUrl += router.asPath;
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
      localStorage.removeItem("jwt");
      router.push(`/logout?redirect=true`);
    }
  };

  const [mounted, setMounted] = useState(false);
  useSWR(mounted ? "use-redirect" : null, fetcher);
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    setMounted(true);
  }, [router.query]);
};
