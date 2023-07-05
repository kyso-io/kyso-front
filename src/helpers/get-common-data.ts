/* eslint-disable @typescript-eslint/no-explicit-any */
import { setLocalStorageItem } from '@/helpers/set-local-storage-item';
import type { NormalizedResponseDTO, Organization, ResourcePermissions, Team, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { getLocalStorageItem } from './isomorphic-local-storage';

interface Props {
  token: string | null;
  permissions: TokenPermissions;
  user: UserDTO | null;
  organizationName?: string;
  teamName?: string;
}

export const getCommonData = async ({
  token,
  permissions,
  user,
  organizationName,
  teamName,
}: Props): Promise<{
  organization: Organization | null;
  team: Team | null;
  httpCodeOrganization: number | null;
  errorOrganization: string | null;
  httpCodeTeam: number | null;
  errorTeam: string | null;
}> => {
  if (!permissions || !organizationName) {
    return {
      organization: null,
      team: null,
      httpCodeOrganization: null,
      errorOrganization: null,
      httpCodeTeam: null,
      errorTeam: null,
    };
  }
  const api: Api = new Api(token);
  const organizationResourcePermissions: ResourcePermissions | undefined = permissions!.organizations!.find((org: ResourcePermissions) => org.name === organizationName);
  let organization: Organization | null = null;
  let httpCodeOrganization: number | null = null;
  let errorOrganization: string | null = null;
  let team: Team | null = null;
  let httpCodeTeam: number | null = null;
  let errorTeam: string | null = null;
  api.setOrganizationSlug(organizationName);
  if (organizationResourcePermissions) {
    if (token) {
      try {
        const fetchOrganizationRequest: NormalizedResponseDTO<Organization> = await api.getOrganization(organizationResourcePermissions.id);
        organization = fetchOrganizationRequest.data;
        httpCodeOrganization = 200;
      } catch (e: any) {
        httpCodeOrganization = e.response.data.statusCode;
        if (e.response.data.statusCode === 403) {
          errorOrganization = `You don't have permission to access this organization`;
        } else if (e.response.data.statusCode === 404) {
          errorOrganization = 'The organization does not exist';
        } else {
          errorOrganization = e.response.data.message;
        }
      }
    } else {
      try {
        const result: NormalizedResponseDTO<Organization> = await api.getOrganizationBySlug(organizationName);
        organization = result.data;
        httpCodeOrganization = 200;
      } catch (e: any) {
        httpCodeOrganization = e.response.data.statusCode;
        if (e.response.data.statusCode === 403) {
          errorOrganization = `You don't have permission to access this organization`;
        } else if (e.response.data.statusCode === 404) {
          errorOrganization = 'The organization does not exist';
        } else {
          errorOrganization = e.response.data.message;
        }
      }
    }
  } else {
    try {
      const normalizedResponse: NormalizedResponseDTO<Organization> = await api.getOrganizationBySlug(organizationName);
      organization = normalizedResponse.data;
    } catch (e: any) {
      httpCodeOrganization = e.response.data.statusCode;
      if (e.response.data.statusCode === 404) {
        errorOrganization = 'The organization does not exist';
      } else {
        errorOrganization = e.response.data.message;
      }
    }
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
  if (teamName && organization) {
    const teamResourcePermissions: ResourcePermissions | undefined = permissions!.teams!.find((resourcePermission: ResourcePermissions) => {
      return resourcePermission.name === teamName && resourcePermission.organization_id === organization!.id;
    });
    if (teamResourcePermissions) {
      try {
        const fetchTeamRequest: NormalizedResponseDTO<Team> = await api.getTeam(teamResourcePermissions.id);
        team = fetchTeamRequest.data;
        httpCodeTeam = 200;
      } catch (e: any) {
        httpCodeTeam = e.response.data.statusCode;
        if (e.response.data.statusCode === 403) {
          errorTeam = `You don't have permission to access this channel`;
        } else if (e.response.data.statusCode === 404) {
          errorTeam = 'The channel does not exist';
        } else {
          errorTeam = e.response.data.message;
        }
      }
    } else {
      try {
        const fetchTeamRequest: NormalizedResponseDTO<Team> = await api.getTeamBySlug(organization.id!, teamName);
        team = fetchTeamRequest.data;
        httpCodeTeam = 200;
      } catch (e: any) {
        httpCodeTeam = e.response.data.statusCode;
        if (e.response.data.statusCode === 403) {
          errorTeam = `You don't have permission to access this channel`;
        } else if (e.response.data.statusCode === 404) {
          errorTeam = 'The channel does not exist';
        } else {
          errorTeam = e.response.data.message;
        }
      }
    }
  }
  return { organization, httpCodeOrganization, errorOrganization, team, httpCodeTeam, errorTeam };
};
