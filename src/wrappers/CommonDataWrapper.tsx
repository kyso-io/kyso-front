import { useAuth } from "@/hooks/use-auth";
import type {
  ReportDTO,
  ResourcePermissions,
  Team,
  TokenPermissions,
} from "@kyso-io/kyso-model";
import type { AppDispatch, RootState } from "@kyso-io/kyso-store";
import {
  fetchOrganizationAction,
  fetchReportsAction,
  fetchTeamAction,
  setActiveId,
  setOrganizationAuthAction,
  setTeamAuthAction,
} from "@kyso-io/kyso-store";
import { unwrapResult } from "@reduxjs/toolkit";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";

const CommonDataWrapper = (props: any) => {
  const router = useRouter();
  const { organizationName, teamName, reportName } = router.query;

  useAuth();
  const dispatch = useAppDispatch();

  const token: string | null = useAppSelector(
    (state: RootState) => state.auth.token
  );
  const permissions: TokenPermissions | null = useAppSelector(
    (state: RootState) => state.auth.currentUserPermissions
  );

  useEffect(() => {
    const getData = async () => {
      if (!permissions) {
        return;
      }
      if (!organizationName) {
        return;
      }

      const organizationResourcePermissions: ResourcePermissions | undefined =
        permissions.organizations!.find(
          (org: ResourcePermissions) => org.name === organizationName
        );
      if (!organizationResourcePermissions) {
        return;
      }

      await dispatch(setOrganizationAuthAction(organizationName as string));
      await dispatch(
        fetchOrganizationAction(organizationResourcePermissions.id)
      );

      if (!teamName) {
        return;
      }
      const teamResourcePermissions: ResourcePermissions | undefined =
        permissions.teams!.find(
          (team: ResourcePermissions) => team.name === teamName
        );
      if (!teamResourcePermissions) {
        return;
      }
      await dispatch(setTeamAuthAction(teamName as string));
      const resultTeamAction: AppDispatch = await dispatch(
        fetchTeamAction(teamResourcePermissions.id)
      );
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
        })
      );
      const reports: ReportDTO[] = unwrapResult(resultReportAction);
      if (reports.length === 0) {
        return;
      }
      const report: ReportDTO = reports[0] as ReportDTO;
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

export default CommonDataWrapper;
