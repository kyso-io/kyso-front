/* eslint-disable no-prototype-builtins */
import type { ReportDTO, User } from '@kyso-io/kyso-model';
import { useAppSelector } from './redux-hooks';
import { useCommonReportData } from './use-common-report-data';

export const useAuthors = (): User[] => {
  const report: ReportDTO = useCommonReportData();
  const authors: User[] = useAppSelector((state) => {
    if (!report) {
      return [];
    }

    if (report.author_ids.length === 0) {
      return [state.user.entities.hasOwnProperty(report.user_id) ? state.user.entities[report.user_id] : null];
    }

    return report.author_ids
      .filter((authorId) => {
        return authorId in Object.keys(state.user.entities);
      })
      .map((authorId) => {
        const user = state.user.entities.hasOwnProperty(authorId) ? state.user.entities[authorId] : null;
        return user;
      });
  });

  return authors;
};
