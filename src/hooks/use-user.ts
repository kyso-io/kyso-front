import useSWR from 'swr';
import { fetchRelationsAction, fetchUserPermissions, refreshUserAction, setAuthAction } from '@kyso-io/kyso-store';
import decode from 'jwt-decode';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { ActionWithPayload, Token, UserDTO } from '@kyso-io/kyso-model';
import { Helper } from '@/helpers/Helper';
import { useAppDispatch } from './redux-hooks';

export type DecodedToken = {
  exp: number;
  iat: number;
  iss: string;
  payload: Token;
};

export const useUser = (): UserDTO => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const fetcher = async (): Promise<UserDTO | null> => {
    const jwt: string = localStorage.getItem('jwt') as string;

    if (!jwt) {
      return null;
    }

    const jwtToken: DecodedToken = decode<DecodedToken>(jwt);

    if (new Date(jwtToken.exp * 1000) <= new Date()) {
      // token is out of date
      localStorage.removeItem('jwt');
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
    const fetchUserRequest: ActionWithPayload<UserDTO> = await dispatch(refreshUserAction());

    if (userPermissions) {
      await dispatch(
        fetchRelationsAction({
          team: Helper.ListToKeyVal(userPermissions.payload.teams),
          organization: Helper.ListToKeyVal(userPermissions.payload.organizations),
        }),
      );
    }

    return fetchUserRequest.payload as UserDTO;
  };

  const [mounted, setMounted] = useState(false);
  const { data } = useSWR(mounted ? 'use-user' : null, fetcher);
  useEffect(() => {
    if (router.isReady) {
      setMounted(true);
    }
  }, [router.query]);

  // NO ANY
  return data as UserDTO;
};
