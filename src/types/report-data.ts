import type { ReportDTO, UserDTO } from '@kyso-io/kyso-model';

export type ReportData = {
  report: ReportDTO | null | undefined;
  authors: UserDTO[];
  errorReport: string | null;
  httpStatusCode: number;
};
