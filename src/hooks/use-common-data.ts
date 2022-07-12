import type { RootState } from "@kyso-io/kyso-store";
import { fetchOrganizationAction, fetchTeamAction, selectActiveOrganization, selectActiveTeam, setOrganizationAuthAction, setTeamAuthAction } from "@kyso-io/kyso-store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Organization, ResourcePermissions, Team, TokenPermissions } from "@kyso-io/kyso-model";
import useSWR from "swr";
import { useAppDispatch, useAppSelector } from "./redux-hooks";
import { useAuth } from "./use-auth";

export const useCommonData = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { query } = router;
  const user = useAuth({ loginRedirect: false });

  const token: string | null = useAppSelector((state: RootState) => state.auth.token);
  const permissions: TokenPermissions | null = useAppSelector((state: RootState) => state.auth.currentUserPermissions);
  const activeOrganization: Organization = useAppSelector(selectActiveOrganization);
  const activeTeam: Team = useAppSelector(selectActiveTeam);

  const fetcher = async () => {
    const organizationResourcePermissions: ResourcePermissions | undefined = permissions!.organizations!.find((org: ResourcePermissions) => org.name === query.organizationName);

    if (!organizationResourcePermissions) {
      return;
    }

    await dispatch(setOrganizationAuthAction(query.organizationName as string));
    await dispatch(fetchOrganizationAction(organizationResourcePermissions.id));

    if (!query.teamName) {
      return;
    }
    const teamResourcePermissions: ResourcePermissions | undefined = permissions!.teams!.find((team: ResourcePermissions) => team.name === query.teamName);
    if (!teamResourcePermissions) {
      return;
    }
    await dispatch(setTeamAuthAction(query.teamName as string));
    await dispatch(fetchTeamAction(teamResourcePermissions.id));
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

    setMounted(true);
  }, [router.query, user]);

  return {
    permissions,
    token,
    organization: activeOrganization,
    team: activeTeam,
    user,
  };
};
