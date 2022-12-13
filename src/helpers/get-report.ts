/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReportData } from '@/types/report-data';
import type { NormalizedResponseDTO, ReportDTO, Team, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { Helper } from './Helper';

interface Props {
  token: string | null;
  team: Team | null;
  reportName: string;
  version?: number;
}

export const getReport = async ({ token, team, reportName, version }: Props): Promise<ReportData> => {
  try {
    const api: Api = new Api(token);
    if (!team) {
      const errorReport = `The report does not exist, or you don't have access.`;
      return { report: null, authors: [], errorReport };
    }
    const result: NormalizedResponseDTO<ReportDTO> = await api.getReportByTeamIdAndSlug(team!.id!, reportName, version);
    const authors: UserDTO[] = [];
    result.data.author_ids.forEach((authorId: string) => {
      if (result.relations?.user[authorId]) {
        authors.push(result.relations.user[authorId]);
      }
    });
    return { report: result.data, authors, errorReport: null };
  } catch (e: any) {
    Helper.logError('errorReport', e);

    let errorReport: string | null = null;
    if (!e.response) {
      errorReport = `An unkown error occurred.`;
      Helper.logError(errorReport, e);
    } else if (e.response.data.statusCode === 403) {
      errorReport = `You don't have permission to access this report.`;
    } else if (e.response.data.statusCode === 404) {
      errorReport = 'The report does not exist.';
    } else {
      errorReport = e.response.data.message;
    }
    return { report: null, authors: [], errorReport };
  }
};
