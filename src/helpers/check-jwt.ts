import decode from 'jwt-decode';
import type { DecodedToken } from '../types/decoded-token';
import { getLocalStorageItem } from './isomorphic-local-storage';

export const checkJwt = (): boolean => {
  // const jwt: string | null = localStorage.getItem('jwt');
  const jwt: string | null = getLocalStorageItem('jwt');
  if (!jwt) {
    return false;
  }
  const jwtToken: DecodedToken = decode<DecodedToken>(jwt);
  if (new Date(jwtToken.exp * 1000) <= new Date()) {
    localStorage.removeItem('jwt');
    return false;
  }
  return true;
};
