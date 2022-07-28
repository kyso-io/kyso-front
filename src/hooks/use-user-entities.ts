/* eslint-disable no-prototype-builtins */
import type { User } from '@kyso-io/kyso-model';
import { useAppSelector } from './redux-hooks';

interface IUserEntities {
  [key: string]: User;
}

export const useUserEntities = (): User[] => {
  const userEntities: IUserEntities = useAppSelector((state) => state.user.entities);

  return Object.values(userEntities);
};
