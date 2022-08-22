import type { NormalizedResponseDTO, ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import type { CommonData } from '@/types/common-data';

interface Props {
  commonData: CommonData;
  reportName: string;
}

export const getReport = async ({ commonData, reportName }: Props): Promise<{ report: ReportDTO | null | undefined; authors: UserDTO[] }> => {
  try {
    const api: Api = new Api(commonData.token);
    const result: NormalizedResponseDTO<ReportDTO> = await api.getReportByTeamIdAndSlug(commonData.team!.id!, reportName);
    const authors: UserDTO[] = [];
    result.data.author_ids.forEach((authorId: string) => {
      if (result.relations?.user[authorId]) {
        authors.push(result.relations.user[authorId]);
      }
    });
    return { report: result.data, authors };
  } catch (e) {
    return { report: null, authors: [] };
  }
};
