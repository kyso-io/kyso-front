/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CommonData } from '@/types/common-data';
import type { ReportData } from '@/types/report-data';
import type { NormalizedResponseDTO, ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';

interface Props {
  commonData: CommonData;
  reportName: string;
}

export const getReport = async ({ commonData, reportName }: Props): Promise<ReportData> => {
  try {
    const api: Api = new Api(commonData.token);
    const result: NormalizedResponseDTO<ReportDTO> = await api.getReportByTeamIdAndSlug(commonData.team!.id!, reportName);
    const authors: UserDTO[] = [];
    result.data.author_ids.forEach((authorId: string) => {
      if (result.relations?.user[authorId]) {
        authors.push(result.relations.user[authorId]);
      }
    });
    return { report: result.data, authors, errorReport: null };
  } catch (e: any) {
    let errorReport: string | null = null;
    if (e.response.data.statusCode === 403) {
      errorReport = `You don't have permission to access this report`;
    } else if (e.response.data.statusCode === 404) {
      errorReport = 'The report does not exist';
    } else {
      errorReport = e.response.data.message;
    }
    return { report: null, authors: [], errorReport };
  }
};
