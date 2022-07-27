/* eslint-disable no-prototype-builtins */
import type { ReportDTO, User } from '@kyso-io/kyso-model';
import { useMemo } from 'react';
import { useUserEntities } from './use-user-entities';

interface Props {
  report: ReportDTO;
}

export const useAuthors = (props: Props): User[] => {
  const { report } = props;

  const userEntities: User[] = useUserEntities();
  const authors: User[] | undefined = useMemo<User[] | undefined>(() => {
    if (!report) {
      return undefined;
    }
    if (!userEntities) {
      return undefined;
    }
    let authorIds = [report.user_id];
    if (report.author_ids) {
      authorIds = report.author_ids;
    }
    const users = userEntities.filter((userEntity: User) => {
      return authorIds.includes(userEntity.id as string);
    });

    return users as User[];
  }, [report, userEntities]);

  return authors || [];
};
