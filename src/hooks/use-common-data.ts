import type { RootState } from "@kyso-io/kyso-store";
import { fetchOrganizationAction, fetchTeamAction } from "@kyso-io/kyso-store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { ActionWithPayload, Organization, ResourcePermissions, Team, TokenPermissions, User } from "@kyso-io/kyso-model";
import useSWR from "swr";
import { useAppDispatch, useAppSelector } from "./redux-hooks";
import { useUser } from "./use-user";

export type CommonData = {
  permissions: TokenPermissions | null;
  token: string | null;
  organization: Organization;
  team: Team;
  user: User;
};

export const useCommonData = (): CommonData => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { query } = router;
  const user: User = useUser();
  const token: string | null = useAppSelector((state: RootState) => state.auth.token);
  const permissions: TokenPermissions | null = useAppSelector((state: RootState) => state.auth.currentUserPermissions);

  const fetcher = async () => {
    const organizationResourcePermissions: ResourcePermissions | undefined = permissions!.organizations!.find((org: ResourcePermissions) => org.name === query.organizationName);

    let organization: Organization | null = null;
    let team = null;

    if (query.organizationName) {
      if (organizationResourcePermissions) {
        const fetchOrganizationRequest: ActionWithPayload<Organization> = await dispatch(fetchOrganizationAction(organizationResourcePermissions.id));
        organization = fetchOrganizationRequest.payload;
      }
    }

    if (query.teamName && organization) {
      const teamResourcePermissions: ResourcePermissions | undefined = permissions!.teams!.find((t: ResourcePermissions) => {
        return t.name === query.teamName && t.organization_id === organization!.id;
      });
      if (teamResourcePermissions) {
        const fetchTeamRequest: ActionWithPayload<Team> = await dispatch(fetchTeamAction(teamResourcePermissions.id));
        team = fetchTeamRequest.payload;
      }
    }

    return { organization, team, token, permissions };
  };

  const [mounted, setMounted] = useState(false);
  const { data } = useSWR(mounted ? `use-common-data` : null, fetcher);

  useEffect(() => {
    if (!permissions) {
      return;
    }
    setMounted(true);
  }, [router.query, permissions]);

  return {
    permissions,
    token,
    organization: data?.organization,
    team: data?.team,
    user,
  } as CommonData;
};
