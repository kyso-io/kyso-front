export interface JwtDecode<T> {
  exp: number;
  iat: number;
  iss: string;
  payload: T;
}