import { ReportDTO, ResourcePermissions, Team, TokenPermissions } from '@kyso-io/kyso-model';
import { AppDispatch, fetchOrganizationAction, fetchReportsAction, fetchTeamAction, RootState, setActiveId, setOrganizationAuthAction, setTeamAuthAction } from '@kyso-io/kyso-store';
import { unwrapResult } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../hooks/auth';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';

const Wrapper = (props: any) => {
  useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token: string | null = useAppSelector((state: RootState) => state.auth.token);
  const permissions: TokenPermissions | null = useAppSelector((state: RootState) => state.auth.currentUserPermissions);
  const { organizationName, teamName, reportName } = router.query;

  useEffect(() => {
    const getData = async () => {
      if (!permissions) {
        return;
      }
      if (!organizationName) {
        return;
      }
      const organizationResourcePermissions: ResourcePermissions | undefined = permissions.organizations!.find((org: ResourcePermissions) => org.name === organizationName);
      if (!organizationResourcePermissions) {
        return;
      }
      await dispatch(setOrganizationAuthAction(organizationName as string));
      const resultOrganizationAction: AppDispatch = await dispatch(fetchOrganizationAction(organizationResourcePermissions.id));

      if (!teamName) {
        return;
      }
      const teamResourcePermissions: ResourcePermissions | undefined = permissions.teams!.find((team: ResourcePermissions) => team.name === teamName);
      if (!teamResourcePermissions) {
        return;
      }
      await dispatch(setTeamAuthAction(teamName as string));
      const resultTeamAction: AppDispatch = await dispatch(fetchTeamAction(teamResourcePermissions.id));
      const team: Team = unwrapResult(resultTeamAction);

      if (!reportName) {
        return;
      }
      const resultReportAction: AppDispatch = await dispatch(
        fetchReportsAction({
          filter: {
            team_id: team.id,
            sluglified_name: reportName,
          },
        }),
      );
      const reports: ReportDTO[] = unwrapResult(resultReportAction);
      if (reports.length === 0) {
        return;
      }
      const report: ReportDTO = reports[0];
      await dispatch(setActiveId(report.id as string));
    };
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions]);

  if (!token) {
    return <div />;
  }

  return <div>{props.children}</div>;
};

export default Wrapper;
