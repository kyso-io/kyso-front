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
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  organization: any;
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
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  const fetcher = async () => {
    const organizationResourcePermissions: ResourcePermissions | undefined = permissions!.organizations!.find((org: ResourcePermissions) => org.name === query.organizationName);
    if (!organizationResourcePermissions) {
      return;
    }

    const fetchOrganizationRequest: ActionWithPayload<Organization> = await dispatch(fetchOrganizationAction(organizationResourcePermissions.id));
    setOrganization(fetchOrganizationRequest.payload);

    if (!query.teamName) {
      return;
    }
    const teamResourcePermissions: ResourcePermissions | undefined = permissions!.teams!.find((t: ResourcePermissions) => t.name === query.tName);
    if (!teamResourcePermissions) {
      return;
    }

    const fetchTeamRequest: ActionWithPayload<Team> = await dispatch(fetchTeamAction(teamResourcePermissions.id));
    setTeam(fetchTeamRequest.payload);
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
    setMounted(true);
  }, [permissions]);

  return {
    permissions,
    token,
    organization,
    team,
    user,
  } as CommonData;
};
