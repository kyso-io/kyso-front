/* eslint no-empty: "off" */
import KysoTopBar from '@/layouts/KysoTopBar';
import UnpureSidebar from '@/wrappers/UnpureSidebar';
import type { NormalizedResponseDTO, OrganizationInfoDto, PaginatedResponseDto, ReportDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import OrganizationInfo from '../../components/OrganizationActivity';
import Pagination from '../../components/Pagination';
import ReportBadget from '../../components/ReportBadge';
import { getLocalStorageItem } from '../../helpers/get-local-storage-item';
import type { CommonData } from '../../hooks/use-common-data';
import { useCommonData } from '../../hooks/use-common-data';

const token: string | null = getLocalStorageItem('jwt');

interface PaginationParams {
  page: number;
  limit: number;
  sort: string;
}

const Index = () => {
  const commonData: CommonData = useCommonData();
  const router: NextRouter = useRouter();
  const [paginatedResponseDto, setPaginatedResponseDto] = useState<PaginatedResponseDto<ReportDTO> | null>(null);
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfoDto | null>(null);
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    sort: '-created_at',
  });
  const { organizationName } = router.query;

  useEffect(() => {
    if (!organizationName) {
      return;
    }
    getReports();
  }, [token, organizationName, paginationParams]);

  useEffect(() => {
    if (!commonData.organization) {
      return;
    }
    getOrganizationsInfo();
  }, [commonData?.organization]);

  const getReports = async () => {
    try {
      const api: Api = new Api(token);
      const result: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>> = await api.getOrganizationReports(
        organizationName as string,
        paginationParams.page,
        paginationParams.limit,
        paginationParams.sort,
      );
      setPaginatedResponseDto(result.data);
    } catch (e) {}
  };

  const getOrganizationsInfo = async () => {
    try {
      const api: Api = new Api(token);
      const result: NormalizedResponseDTO<OrganizationInfoDto[]> = await api.getOrganizationsInfo(commonData.organization.id);
      if (result?.data?.length > 0) {
        setOrganizationInfo(result.data[0]!);
      }
    } catch (e) {}
  };

  const toggleUserStarReport = async (reportId: string) => {
    const api: Api = new Api(token);
    try {
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleUserStarReport(reportId);
      const { data: report } = result;
      const { results: reports } = paginatedResponseDto!;
      const newReports: ReportDTO[] = reports.map((r: ReportDTO) => (r.id === report.id ? report : r));
      setPaginatedResponseDto({ ...paginatedResponseDto!, results: newReports });
    } catch (e) {}
  };

  const toggleUserPinReport = async (reportId: string) => {
    const api: Api = new Api(token);
    try {
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleUserPinReport(reportId);
      const { data: report } = result;
      const { results: reports } = paginatedResponseDto!;
      const newReports: ReportDTO[] = reports.map((r: ReportDTO) => (r.id === report.id ? report : r));
      setPaginatedResponseDto({ ...paginatedResponseDto!, results: newReports });
    } catch (e) {}
  };

  const toggleGlobalPinReport = async (reportId: string) => {
    const api: Api = new Api(token, organizationName as string);
    try {
      const result: NormalizedResponseDTO<ReportDTO> = await api.toggleGlobalPinReport(reportId);
      const { data: report } = result;
      const { results: reports } = paginatedResponseDto!;
      const newReports: ReportDTO[] = reports.map((r: ReportDTO) => (r.id === report.id ? report : r));
      setPaginatedResponseDto({ ...paginatedResponseDto!, results: newReports });
    } catch (e) {}
  };

  return (
    <UnpureSidebar>
      <div className="container flex">
        <div className="basis-3/4">
          <main className="py-5">
            <div className="flex items-center space-x-5">
              <div className="shrink-0">
                <div className="relative">
                  <img className="h-16 w-16 rounded-full" src={commonData.organization?.avatar_url} alt="" />
                  <span className="absolute inset-0 shadow-inner rounded-full" aria-hidden="true" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{commonData.organization?.display_name}</h1>
                <p className="text-sm font-medium text-gray-500">{commonData.organization?.bio}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
      {organizationInfo && (
        <div className="mb-10">
          <OrganizationInfo organizationInfo={organizationInfo} />
        </div>
      )}
      <div className="grid lg:grid-cols-2 sm:grid-cols-1 xs:grid-cols-1 gap-4">
        {paginatedResponseDto?.results.map((report: ReportDTO) => (
          <ReportBadget
            key={report.id}
            report={report}
            toggleUserStarReport={() => toggleUserStarReport(report.id!)}
            toggleUserPinReport={() => toggleUserPinReport(report.id!)}
            toggleGlobalPinReport={() => toggleGlobalPinReport(report.id!)}
          />
        ))}
      </div>
      {paginatedResponseDto && paginatedResponseDto.totalPages > 1 && (
        <div className="pt-10">
          <Pagination page={paginatedResponseDto.currentPage} numPages={paginatedResponseDto.totalPages} onPageChange={(page: number) => setPaginationParams({ ...paginationParams, page })} />
        </div>
      )}
    </UnpureSidebar>
  );
};

Index.layout = KysoTopBar;

export default Index;
