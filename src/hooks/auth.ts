import { Helper } from "@/helpers/Helper";
import { KysoSettingsEnum } from "@kyso-io/kyso-model";
import type { AppDispatch } from "@kyso-io/kyso-store";
import { fetchRelationsAction, fetchUserPermissions, selectUser, setAuthAction } from "@kyso-io/kyso-store";
import decode from "jwt-decode";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = (redirectToLogin: boolean = true) => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { organizationName, teamName, redirect } = router.query;

  useEffect(() => {
    (async () => {
      const publicKeys: any = await Helper.getKysoPublicSettings();
      let unauthorizedRedirectUrl: string;
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

      if (!router.isReady) {
        return;
      }

      if (user) {
        return;
      }

      const jwt: string = localStorage.getItem("jwt") as string;

      if (!jwt) {
        if (redirectToLogin) {
          router.push("/login");
        }
        return;
      }

      if (!jwt && redirect === undefined) {
        let redirectUrl = "?redirect=";
        if (router?.asPath && router.asPath.length > 0) {
          redirectUrl += router.asPath;
        }

        if (window.location.pathname === "/") {
          // We are at the base of the URL, redirect to unauthorized redirect URL
          router.push(unauthorizedRedirectUrl);
        } else {
          // We are in other place, redirect to login
          router.push(`/login${redirectUrl}`);
        }
      }

      const jwtToken: any = decode(jwt);

      const { exp } = jwtToken;

      if (new Date(exp * 1000) <= new Date()) {
        // token is out of date
        localStorage.removeItem("jwt");
        router.push(`/logout?redirect=true`);
        return;
      }

      const jwtUser = jwtToken.payload;

      dispatch(
        setAuthAction({
          jwt,
          teamName,
          organizationName,
        }),
      );

      const userPermissions = await dispatch(fetchUserPermissions(jwtUser.username));

      if (userPermissions) {
        dispatch(
          fetchRelationsAction({
            team: Helper.ListToKeyVal(userPermissions.payload.teams),
            organization: Helper.ListToKeyVal(userPermissions.payload.organizations),
          }),
        );
      }
    })();
  }, [user, router, teamName, organizationName, dispatch]);

  return user;
};
