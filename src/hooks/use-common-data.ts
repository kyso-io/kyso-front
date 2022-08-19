import { setLocalStorageItem } from '@/helpers/set-local-storage-item';
import type { NormalizedResponseDTO, Organization, ResourcePermissions, Team, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { getLocalStorageItem } from '../helpers/isomorphic-local-storage';

export type CommonData = {
  permissions: TokenPermissions | null;
  token: string | null;
  organization: Organization | null;
  team: Team | null;
  user: UserDTO | null | undefined;
};

export const useCommonData = (): CommonData => {
  const router = useRouter();
  const token: string | null = getLocalStorageItem('jwt');

  const fetcher = async (): Promise<{ user: UserDTO | null; permissions: TokenPermissions | null; organization: Organization | null; team: Team | null }> => {
    const organizationName: string | undefined = router.query.organizationName as string | undefined;
    const teamName: string | undefined = router.query.teamName as string | undefined;
    const api: Api = new Api();
    let user: UserDTO | null = null;
    let permissions: TokenPermissions | null = null;
    if (token) {
      api.setToken(token);
      try {
        const responseUserDto: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
        user = responseUserDto.data;
        const response: NormalizedResponseDTO<TokenPermissions> = await api.getUserPermissions(user!.username);
        permissions = response.data;
      } catch (e) {}
    } else {
      try {
        const response: NormalizedResponseDTO<TokenPermissions> = await api.getPublicPermissions();
        permissions = response.data;
      } catch (e) {}
    }
    let organizationResourcePermissions: ResourcePermissions | undefined;
    if (permissions) {
      organizationResourcePermissions = permissions!.organizations!.find((org: ResourcePermissions) => org.name === organizationName);
    }
    let organization: Organization | null = null;
    let team: Team | null = null;
    if (organizationName) {
      api.setOrganizationSlug(organizationName);
      if (organizationResourcePermissions) {
        if (token) {
          try {
            const fetchOrganizationRequest: NormalizedResponseDTO<Organization> = await api.getOrganization(organizationResourcePermissions.id);
            organization = fetchOrganizationRequest.data;
          } catch (e) {}
        } else {
          try {
            const result: NormalizedResponseDTO<Organization> = await api.getOrganizationBySlug(organizationName);
            organization = result.data;
          } catch (e) {}
        }
      } else {
        try {
          const result: NormalizedResponseDTO<Organization> = await api.getOrganizationBySlug(organizationName);
          organization = result.data;
        } catch (e) {}
      }
      let lastOrganizationDict: { [userId: string]: string } = {};
      if (user && organization) {
        const lastOrganizationStr: string | null = getLocalStorageItem('last_organization');
        if (lastOrganizationStr) {
          try {
            lastOrganizationDict = JSON.parse(lastOrganizationStr);
          } catch (e) {}
        }
        lastOrganizationDict[user.id] = organization!.sluglified_name;
        setLocalStorageItem('last_organization', JSON.stringify(lastOrganizationDict));
      }
    }
    if (permissions) {
      if (teamName && organization) {
        const teamResourcePermissions: ResourcePermissions | undefined = permissions!.teams!.find((resourcePermission: ResourcePermissions) => {
          return resourcePermission.name === teamName && resourcePermission.organization_id === organization!.id;
        });
        if (teamResourcePermissions) {
          try {
            const fetchTeamRequest: NormalizedResponseDTO<Team> = await api.getTeam(teamResourcePermissions.id);
            team = fetchTeamRequest.data;
          } catch (err) {}
        }
      }
    }
    return { user, permissions, organization, team };
  };

  const [mounted, setMounted] = useState<boolean>(false);
  const { data } = useSWR(mounted ? 'use-common-data' : null, fetcher);

  useEffect(() => {
    if (router.isReady) {
      setMounted(true);
    }
  }, [router.isReady]);

  return {
    permissions: data?.permissions ? data.permissions : null,
    token,
    organization: data?.organization ? data.organization : null,
    team: data?.team ? data.team : null,
    user: data?.user ? data.user : null,
  };
};
