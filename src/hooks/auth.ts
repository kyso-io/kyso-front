import type { JwtDecode } from "@/model/jwt-decode.model";
import type { TokenPermissions, User } from "@kyso-io/kyso-model";
import {
  fetchUserPermissions,
  logoutAction,
  selectCurrentUserPermissions,
  setTokenAuthAction,
} from "@kyso-io/kyso-store";
import decode from "jwt-decode";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./redux-hooks";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentUserPermissions: TokenPermissions | null = useAppSelector(
    selectCurrentUserPermissions
  );

  useEffect(() => {
    const getData = async () => {
      const jwt: string | null = localStorage.getItem("jwt");

      if (!jwt) {
        router.push("/login");
        return;
      }

      const jwtToken: JwtDecode<User> = decode(jwt);
      if (new Date(jwtToken.exp * 1000) <= new Date()) {
        // token is out of date
        localStorage.removeItem("jwt");
        dispatch(logoutAction());
        router.push("/login");
        return;
      }

      await dispatch(setTokenAuthAction(jwt));
      if (!currentUserPermissions) {
        await dispatch(fetchUserPermissions(jwtToken.payload.username));
      }
    };
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
