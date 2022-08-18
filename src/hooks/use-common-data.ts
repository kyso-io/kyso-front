import type { RootState } from '@kyso-io/kyso-store';
import { Api, fetchOrganizationAction, fetchTeamAction } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import type { ActionWithPayload, NormalizedResponseDTO, Organization, ResourcePermissions, Team, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';
import useSWR from 'swr';
import { setLocalStorageItem } from '@/helpers/set-local-storage-item';
import { useAppDispatch, useAppSelector } from './redux-hooks';
import { useUser } from './use-user';

export type CommonData = {
  permissions: TokenPermissions | null;
  token: string | null;
  organization: Organization | null;
  team: Team | null;
  user: UserDTO;
};

interface Props {
  organizationName: string;
  teamName: string;
}

export const useCommonData = (props: Props): CommonData => {
  const { organizationName, teamName } = props;
  const dispatch = useAppDispatch();

  const user: UserDTO = useUser();
  const token: string | null = useAppSelector((state: RootState) => state.auth.token);
  const permissions: TokenPermissions | null = useAppSelector((state: RootState) => state.auth.currentUserPermissions);

  const fetcher = async () => {
    const api: Api = new Api();
    let organizationResourcePermissions: ResourcePermissions | undefined;
    if (permissions) {
      organizationResourcePermissions = permissions!.organizations!.find((org: ResourcePermissions) => org.name === organizationName);
    }

    let organization: Organization | null = null;
    let team: Team | null = null;

    if (organizationName) {
      if (organizationResourcePermissions) {
        const fetchOrganizationRequest: ActionWithPayload<Organization> = await dispatch(fetchOrganizationAction(organizationResourcePermissions.id));
        organization = fetchOrganizationRequest.payload;
        setLocalStorageItem('last_organization', organization?.sluglified_name as string);
      } else {
        try {
          api.setOrganizationSlug(organizationName);
          const result: NormalizedResponseDTO<Organization> = await api.getOrganizationBySlug(organizationName);
          organization = result.data;
          setLocalStorageItem('last_organization', organization?.sluglified_name as string);
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (permissions) {
      if (teamName && organization) {
        const teamResourcePermissions: ResourcePermissions | undefined = permissions!.teams!.find((t: ResourcePermissions) => {
          return t.name === teamName && t.organization_id === organization!.id;
        });
        if (teamResourcePermissions) {
          const fetchTeamRequest: ActionWithPayload<Team> = await dispatch(fetchTeamAction(teamResourcePermissions.id));
          team = fetchTeamRequest.payload;
        }
      }
    }

    return { organization, team, token, permissions };
  };

  const [mounted, setMounted] = useState(false);
  const { data } = useSWR(mounted ? `use-common-data` : null, fetcher);

  useEffect(() => {
    if (!organizationName || !permissions) {
      return;
    }
    setMounted(true);
  }, [organizationName, teamName, permissions]);

  return {
    permissions,
    token,
    organization: data?.organization,
    team: data?.team,
    user,
  } as CommonData;
};
