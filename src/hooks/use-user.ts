import useSWR from "swr";
import { fetchRelationsAction, fetchUserPermissions, selectUser, setAuthAction } from "@kyso-io/kyso-store";
import decode from "jwt-decode";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Token, User } from "@kyso-io/kyso-model";
import { Helper } from "@/helpers/Helper";
import { useAppSelector, useAppDispatch } from "./redux-hooks";

export type DecodedToken = {
  exp: number;
  iat: number;
  iss: string;
  payload: Token;
};

export const useUser = (): User => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const fetcher = async () => {
    const jwt: string = localStorage.getItem("jwt") as string;

    if (!jwt) {
      return;
    }

    const jwtToken: DecodedToken = decode<DecodedToken>(jwt);

    if (new Date(jwtToken.exp * 1000) <= new Date()) {
      // token is out of date
      localStorage.removeItem("jwt");
    }

    const tokenData: Token = jwtToken.payload;

    await dispatch(
      setAuthAction({
        jwt,
        teamName: router.query.teamName as string,
        organizationName: router.query.organizationName as string,
      }),
    );

    const userPermissions = await dispatch(fetchUserPermissions(tokenData.username));

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

  // NO ANY
  return user as User;
};
