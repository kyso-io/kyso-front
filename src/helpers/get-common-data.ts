/* eslint-disable @typescript-eslint/no-explicit-any */
import { setLocalStorageItem } from '@/helpers/set-local-storage-item';
import type { CommonData } from '@/types/common-data';
import type { NormalizedResponseDTO, Organization, ResourcePermissions, Team, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import decode from 'jwt-decode';
import type { DecodedToken } from '../types/decoded-token';
import { getLocalStorageItem } from './isomorphic-local-storage';

interface Props {
  organizationName?: string;
  teamName?: string;
}

export const getCommonData = async ({ organizationName, teamName }: Props): Promise<CommonData> => {
  let token: string | null = getLocalStorageItem('jwt');
  if (token) {
    const jwtToken: DecodedToken = decode<DecodedToken>(token);
    if (new Date(jwtToken.exp * 1000) <= new Date()) {
      // token is out of date
      localStorage.removeItem('jwt');
      token = null;
    }
  }
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
  let errorOrganization: string | null = null;
  let team: Team | null = null;
  let errorTeam: string | null = null;
  if (organizationName) {
    api.setOrganizationSlug(organizationName);
    if (organizationResourcePermissions) {
      if (token) {
        try {
          const fetchOrganizationRequest: NormalizedResponseDTO<Organization> = await api.getOrganization(organizationResourcePermissions.id);
          organization = fetchOrganizationRequest.data;
        } catch (e: any) {
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
        } catch (e: any) {
          if (e.response.data.statusCode === 403) {
            errorOrganization = `You don't have permission to access this organization`;
          } else if (e.response.data.statusCode === 404) {
            errorOrganization = 'The organization does not exist';
          } else {
            errorOrganization = e.response.data.message;
          }
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
        } catch (e: any) {
          if (e.response.data.statusCode === 403) {
            errorTeam = `You don't have permission to access this team`;
          } else if (e.response.data.statusCode === 404) {
            errorTeam = 'The team does not exist';
          } else {
            errorTeam = e.response.data.message;
          }
        }
      }
    }
  }
  return { token, user, permissions, organization, errorOrganization, team, errorTeam };
};
