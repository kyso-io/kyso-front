import type { NormalizedResponseDTO, Token, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import decode from 'jwt-decode';
import useSWR from 'swr';

export type DecodedToken = {
  exp: number;
  iat: number;
  iss: string;
  payload: Token;
};

export const useUser = (): UserDTO | null => {
  const fetcher = async (): Promise<UserDTO | null> => {
    const jwt: string | null = localStorage.getItem('jwt') as string;
    if (!jwt) {
      return null;
    }
    const jwtToken: DecodedToken = decode<DecodedToken>(jwt);
    if (new Date(jwtToken.exp * 1000) <= new Date()) {
      // token is out of date
      localStorage.removeItem('jwt');
      return null;
    }
    try {
      const api: Api = new Api(jwt);
      const responseUserDto: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
      return responseUserDto.data;
    } catch (e) {
      return null;
    }
  };
  const { data } = useSWR('use-user', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });
  return data || null;
};
