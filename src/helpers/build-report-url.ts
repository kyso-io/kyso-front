import type { Organization, ReportDTO, Team } from '@kyso-io/kyso-model';

export default function buildReportUrl(basePath: string, org: Organization, team: Team, report: ReportDTO) {
  return `${basePath}/${org?.sluglified_name}/${team?.sluglified_name}/${report?.name}`;
}
