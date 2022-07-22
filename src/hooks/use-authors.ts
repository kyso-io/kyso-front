/* eslint-disable no-prototype-builtins */
import type { User } from '@kyso-io/kyso-model';
import { useAppSelector } from './redux-hooks';
import { useCommonReportData } from './use-common-report-data';

export const useAuthors = (): User[] => {
  const report = useCommonReportData();
  const authors: User[] = useAppSelector((state) => {
    if (!report) {
      return [];
    }
    return report.author_ids.map((authorId) => {
      const user = state.user.entities.hasOwnProperty(authorId) ? state.user.entities[authorId] : null;
      return user;
    });
  });

  return authors;
};
