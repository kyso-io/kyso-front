import type { RootState } from "@kyso-io/kyso-store";
import {
  fetchReportsAction,
  selectActiveReport,
  setActiveId,
  fetchOrganizationAction,
  fetchTeamAction,
  selectActiveOrganization,
  selectActiveTeam,
  setOrganizationAuthAction,
  setTeamAuthAction,
} from "@kyso-io/kyso-store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type {
  Organization,
  Report,
  ReportDTO,
  ResourcePermissions,
  Team,
  TokenPermissions,
  User,
} from "@kyso-io/kyso-model";
import useSWR from "swr";
import { unwrapResult } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "./redux-hooks";
import { useAuth } from "./use-auth";

export type CommonData = {
  permissions: TokenPermissions | null;
  token: string | null;
  organization: any;
  team: Team;
  user: User;
  report: Report | null;
};

export const useCommonData = (): CommonData => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { query } = router;
  const user: User = useAuth({ loginRedirect: false });

  const token: string | null = useAppSelector(
    (state: RootState) => state.auth.token
  );
  const permissions: TokenPermissions | null = useAppSelector(
    (state: RootState) => state.auth.currentUserPermissions
  );
  const activeOrganization: Organization = useAppSelector(
    selectActiveOrganization
  );

  const activeTeam: Team = useAppSelector(selectActiveTeam);
  const activeReport: Report = useAppSelector(selectActiveReport);

  const fetcher = async () => {
    const organizationResourcePermissions: ResourcePermissions | undefined =
      permissions!.organizations!.find(
        (org: ResourcePermissions) => org.name === query.organizationName
      );

    if (!organizationResourcePermissions) {
      return;
    }

    // Get the organization data
    await dispatch(setOrganizationAuthAction(query.organizationName as string));
    await dispatch(fetchOrganizationAction(organizationResourcePermissions.id));

    if (!query.teamName) {
      return;
    }

    const teamResourcePermissions: ResourcePermissions | undefined =
      permissions!.teams!.find(
        (team: ResourcePermissions) => team.name === query.teamName
      );

    if (!teamResourcePermissions) {
      return;
    }

    // Get the team data
    await dispatch(setTeamAuthAction(query.teamName as string));
    await dispatch(fetchTeamAction(teamResourcePermissions.id));

    if (!query.reportName) {
      return;
    }

    const resultReportAction = await dispatch(
      fetchReportsAction({
        filter: {
          team_id: teamResourcePermissions.id,
          sluglified_name: query.reportName,
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

  const [mounted, setMounted] = useState(false);
  useSWR(mounted ? "use-common-data" : null, fetcher);

  useEffect(() => {
    if (!permissions) {
      return;
    }

    if (!query.organizationName) {
      return;
    }

    if (activeOrganization) return;
    if (activeTeam) return;
    if (activeReport) return;

    setMounted(true);
  }, [router.query, user]);

  return {
    permissions,
    token,
    organization: activeOrganization,
    team: activeTeam,
    user,
    report: activeReport,
  } as CommonData;
};
