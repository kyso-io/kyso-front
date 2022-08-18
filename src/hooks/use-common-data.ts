import { setLocalStorageItem } from '@/helpers/set-local-storage-item';
import type { ActionWithPayload, NormalizedResponseDTO, Organization, ResourcePermissions, Team, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';
import type { RootState } from '@kyso-io/kyso-store';
import { Api, fetchOrganizationAction, fetchTeamAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getLocalStorageItem } from '../helpers/isomorphic-local-storage';
import { useAppDispatch, useAppSelector } from './redux-hooks';
import { useUser } from './use-user';

export type CommonData = {
  permissions: TokenPermissions | null;
  token: string | null;
  organization: Organization | null;
  team: Team | null;
  user: UserDTO;
};

export const useCommonData = (): CommonData => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user: UserDTO = useUser();
  const token: string | null = useAppSelector((state: RootState) => state.auth.token);
  const permissions: TokenPermissions | null = useAppSelector((state: RootState) => state.auth.currentUserPermissions);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const organizationName = router.query.organizationName as string;
    const teamName = router.query.teamName as string;
    const getData = async () => {
      const api: Api = new Api();
      let organizationResourcePermissions: ResourcePermissions | undefined;
      if (permissions) {
        organizationResourcePermissions = permissions!.organizations!.find((org: ResourcePermissions) => org.name === organizationName);
      }
      let org: Organization | null = null;
      let t: Team | null = null;
      if (organizationName) {
        if (organizationResourcePermissions) {
          const fetchOrganizationRequest: ActionWithPayload<Organization> = await dispatch(fetchOrganizationAction(organizationResourcePermissions.id));
          org = fetchOrganizationRequest.payload;
          setOrganization(org);
        } else {
          try {
            api.setOrganizationSlug(organizationName);
            const result: NormalizedResponseDTO<Organization> = await api.getOrganizationBySlug(organizationName);
            org = result.data;
            setOrganization(org);
          } catch (e) {
            console.error(e);
          }
        }
        let lastOrganizationDict: { [userId: string]: string } = {};
        if (user && org) {
          const lastOrganizationStr: string | null = getLocalStorageItem('last_organization');
          if (lastOrganizationStr) {
            try {
              lastOrganizationDict = JSON.parse(lastOrganizationStr);
            } catch (e) {}
          }
          lastOrganizationDict[user.id] = org!.sluglified_name;
          setLocalStorageItem('last_organization', JSON.stringify(lastOrganizationDict));
        }
      }
      if (permissions) {
        if (teamName && org) {
          const teamResourcePermissions: ResourcePermissions | undefined = permissions!.teams!.find((resourcePermission: ResourcePermissions) => {
            return resourcePermission.name === teamName && resourcePermission.organization_id === org!.id;
          });
          if (teamResourcePermissions) {
            const fetchTeamRequest: ActionWithPayload<Team> = await dispatch(fetchTeamAction(teamResourcePermissions.id));
            t = fetchTeamRequest.payload;
            setTeam(t);
          }
        }
      }
    };
    getData();
  }, [router?.isReady]);

  return {
    permissions,
    token,
    organization,
    team,
    user,
  };
};
