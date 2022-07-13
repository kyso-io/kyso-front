import useSWR from "swr";
import {
  fetchRelationsAction,
  fetchUserPermissions,
  selectUser,
  setAuthAction,
} from "@kyso-io/kyso-store";
import decode from "jwt-decode";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Token, User } from "@kyso-io/kyso-model";
import { KysoSettingsEnum } from "@kyso-io/kyso-model";
import { Helper } from "@/helpers/Helper";
import type { KeyValue } from "@/model/key-value.model";
import { useAppSelector, useAppDispatch } from "./redux-hooks";

export type DecodedToken = {
  exp: number;
  iat: number;
  iss: string;
  payload: Token;
};

// EVERYTHING MUST BE TYPED
export const useAuth = ({ loginRedirect = true } = {}): User => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const router = useRouter();

  let publicKeys: KeyValue[];

  const fetcher = async () => {
    publicKeys = await Helper.getKysoPublicSettings();

    let unauthorizedRedirectUrl;
    if (publicKeys) {
      const pValue = publicKeys.find(
        (x: KeyValue) => x.key === KysoSettingsEnum.UNAUTHORIZED_REDIRECT_URL
      );

      if (pValue) {
        unauthorizedRedirectUrl = pValue.value;
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

      if (loginRedirect && window.location.pathname === "/") {
        // We are at the base of the URL, redirect to unauthorized redirect URL
        router.push(unauthorizedRedirectUrl);
      } else if (loginRedirect) {
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

    const tokenData: Token = jwtToken.payload;

    await dispatch(
      setAuthAction({
        jwt,
        teamName: router.query.teamName as string,
        organizationName: router.query.organizationName as string,
      })
    );

    const userPermissions = await dispatch(
      fetchUserPermissions(tokenData.username)
    );

    if (userPermissions) {
      await dispatch(
        fetchRelationsAction({
          team: Helper.ListToKeyVal(userPermissions.payload.teams),
          organization: Helper.ListToKeyVal(
            userPermissions.payload.organizations
          ),
        })
      );
    }
  };

  const [mounted, setMounted] = useState(false);
  useSWR(mounted ? "use-auth" : null, fetcher);
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (user) {
      return;
    }

    setMounted(true);
  }, [router.query, user]);

  // NO ANY
  return user as User;
};
