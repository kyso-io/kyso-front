import { setLocalStorageItem } from '@/helpers/set-local-storage-item';
import type { CommonData } from '@/types/common-data';
import type { NormalizedResponseDTO, Organization, ResourcePermissions, Team, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { getLocalStorageItem } from './isomorphic-local-storage';

interface Props {
  organizationName?: string;
  teamName?: string;
}

export const getCommonData = async ({ organizationName, teamName }: Props): Promise<CommonData> => {
  const token: string | null = getLocalStorageItem('jwt');
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
  return { token, user, permissions, organization, team };
};
