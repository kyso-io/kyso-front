import type { Token } from '@kyso-io/kyso-model';

export type DecodedToken = {
  exp: number;
  iat: number;
  iss: string;
  payload: Token;
};
