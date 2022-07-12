import useSWR from "swr";
import { fetchRelationsAction, fetchUserPermissions, selectUser, setAuthAction } from "@kyso-io/kyso-store";
import decode from "jwt-decode";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { KysoSettingsEnum } from "@kyso-io/kyso-model";
import { Helper } from "@/helpers/Helper";
import { useAppSelector, useAppDispatch } from "./redux-hooks";

export const useAuth = ({ loginRedirect = true } = {}) => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const router = useRouter();

  let publicKeys: any;

  const fetcher = async () => {
    publicKeys = await Helper.getKysoPublicSettings();

    let unauthorizedRedirectUrl;
    if (publicKeys) {
      const pValue = publicKeys.find((x: any) => x.key === KysoSettingsEnum.UNAUTHORIZED_REDIRECT_URL);

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

    const jwtToken: any = decode(jwt);

    const { exp } = jwtToken;

    if (new Date(exp * 1000) <= new Date()) {
      // token is out of date
      localStorage.removeItem("jwt");
      router.push(`/logout?redirect=true`);
    }

    const jwtUser = jwtToken.payload;

    await dispatch(
      setAuthAction({
        jwt,
        teamName: router.query.teamName,
        organizationName: router.query.organizationName,
      }),
    );

    const userPermissions = await dispatch(fetchUserPermissions(jwtUser.username));

    if (userPermissions) {
      await dispatch(
        fetchRelationsAction({
          team: Helper.ListToKeyVal(userPermissions.payload.teams),
          organization: Helper.ListToKeyVal(userPermissions.payload.organizations),
        }),
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

  return user;
};
