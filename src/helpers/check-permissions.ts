import type { CommonData } from '@/types/common-data';
import type { KysoPermissions, ResourcePermissions, TokenPermissions } from '@kyso-io/kyso-model';
import { GlobalPermissionsEnum, TeamVisibilityEnum } from '@kyso-io/kyso-model';

export class HelperPermissions {
  /**
 *
 * @param {*} activeOrganization const activeOrganization = useSelector((s) => selectOrganizationBySlugifiedName(s, organizationName));
 * @param {*} commonData.team const commonData.team = useSelector((s) => selectTeamBySlugifiedName(s, teamName));
 * @param {*} commonData.permissions   const commonData.permissions = useSelector(selectcommonData.permissions)
 * @param {*} listOfPermissionsToCheck "KYSO_IO_EDIT_REPORT"
 * @returns true if user has permissions on that team + org, false if not
 * 
 * 
 * List of possible permissions role.
 * Organization:
 * KYSO_IO_ADMIN_ORGANIZATION
 * KYSO_IO_EDIT_ORGANIZATION
 * KYSO_IO_CREATE_ORGANIZATION
 * KYSO_IO_DELETE_ORGANIZATION
 * KYSO_IO_READ_ORGANIZATION

 * Team:
 * KYSO_IO_ADMIN_TEAM
 * KYSO_IO_EDIT_TEAM
 * KYSO_IO_CREATE_TEAM
 * KYSO_IO_DELETE_TEAM
 * KYSO_IO_READ_TEAM

 * User:
 * KYSO_IO_ADMIN_USER
 * KYSO_IO_EDIT_USER
 * KYSO_IO_CREATE_USER
 * KYSO_IO_DELETE_USER
 * KYSO_IO_READ_USER

 * Discussion:
 * KYSO_IO_ADMIN_DISCUSSION
 * KYSO_IO_EDIT_DISCUSSION
 * KYSO_IO_CREATE_DISCUSSION
 * KYSO_IO_DELETE_DISCUSSION
 * KYSO_IO_READ_DISCUSSION

 * Report:
 * KYSO_IO_ADMIN_REPORT
 * KYSO_IO_EDIT_REPORT
 * KYSO_IO_CREATE_REPORT
 * KYSO_IO_DELETE_REPORT
 * KYSO_IO_READ_REPORT
 * KYSO_IO_GLOBAL_PIN_REPORT

 * Github Repo:
 * KYSO_IO_ADMIN_GITHUB_REPO
 * KYSO_IO_EDIT_GITHUB_REPO
 * KYSO_IO_CREATE_GITHUB_REPO
 * KYSO_IO_DELETE_GITHUB_REPO
 * KYSO_IO_READ_GITHUB_REPO

 * Comments:
 * KYSO_IO_ADMIN_COMMENT
 * KYSO_IO_EDIT_COMMENT
 * KYSO_IO_CREATE_COMMENT
 * KYSO_IO_DELETE_COMMENT
 * KYSO_IO_READ_COMMENT
 */
  static checkPermissions = (commonData: CommonData, listOfPermissionsToCheck: string | string[]) => {
    if (!commonData.organization || !commonData.permissions) {
      return false;
    }

    let permissionInOrganization: boolean = false;
    let permissionInTeam: boolean = false;

    /* if (!permissionsOfOrganization) {
    return false;
  } */

    // Get the permissions of that user in that team
    let permissionsInThatTeam: ResourcePermissions | undefined;
    let permissionsInThatOrganization: ResourcePermissions | undefined;

    if (commonData.team) {
      permissionsInThatTeam = commonData.permissions.teams?.find((x: ResourcePermissions) => x.id === commonData.team?.id);
    }

    if (commonData.organization) {
      permissionsInThatOrganization = commonData.permissions.organizations?.find((x: ResourcePermissions) => x.id === commonData.organization?.id);

      /* console.log(
      `Permissions in that organization ${
        activeOrganization.sluglified_name || activeOrganization.name
      }`,
      permissionsInThatOrganization
    ); */
    }

    if (permissionsInThatOrganization) {
      if (Array.isArray(listOfPermissionsToCheck)) {
        permissionInOrganization = Boolean(permissionsInThatOrganization.permissions?.find((perm) => listOfPermissionsToCheck.includes(perm)));
      } else {
        permissionInOrganization = Boolean(permissionsInThatOrganization?.permissions?.includes(listOfPermissionsToCheck as KysoPermissions));
      }
    }

    if (permissionsInThatTeam && permissionsInThatTeam?.permissions) {
      if (Array.isArray(listOfPermissionsToCheck)) {
        permissionInTeam = Boolean(permissionsInThatTeam.permissions?.find((perm) => (listOfPermissionsToCheck as KysoPermissions[]).includes(perm)));
      } else {
        permissionInTeam = Boolean(permissionsInThatTeam.permissions.includes(listOfPermissionsToCheck as KysoPermissions));
      }
    }

    if (!permissionsInThatTeam || permissionsInThatTeam?.organization_inherited === true) {
      // console.log(`[ORG] Has permissions returning ${permissionInOrganization}`);
      return permissionInOrganization;
    }
    // console.log(`[TEAM] Has permissions returning ${permissionInTeam}`);
    return permissionInTeam;
  };

  static belongsToOrganization = (commonData: CommonData, organizationName: string): boolean => {
    if (!commonData) {
      return false;
    }
    if (!commonData.permissions) {
      return false;
    }
    if (!commonData.permissions.organizations) {
      return false;
    }
    if (!organizationName) {
      return false;
    }
    const indexOrganization: number = commonData.permissions.organizations.findIndex((item: ResourcePermissions) => item.name === organizationName);
    if (indexOrganization === -1) {
      return false;
    }

    return true;
  };

  static belongsToTeam = (commonData: CommonData, organizationName: string, teamName: string): boolean => {
    if (!commonData) {
      return false;
    }
    if (!commonData.permissions) {
      return false;
    }
    if (!commonData.permissions.organizations) {
      return false;
    }
    if (!organizationName) {
      return false;
    }
    if (!commonData.permissions.teams) {
      return false;
    }
    if (!teamName) {
      return false;
    }
    const indexOrganization: number = commonData.permissions.organizations.findIndex((item: ResourcePermissions) => item.name === organizationName);
    if (indexOrganization === -1) {
      return false;
    }
    const organizationResourcePermission: ResourcePermissions = commonData.permissions.organizations[indexOrganization]!;
    const indexTeam: number = commonData.permissions.teams.findIndex((item: ResourcePermissions) => organizationResourcePermission.id === item.organization_id && item.name === teamName);
    if (indexTeam === -1) {
      return false;
    }

    return true;
  };

  static hasPermissions(permissions: TokenPermissions, kysoPermissions: KysoPermissions[], organizationId: string, teamId: string): boolean {
    if (kysoPermissions.length === 0) {
      return false;
    }

    const glovalAdminKysoPermissions: KysoPermissions | undefined = permissions.global!.find((x: KysoPermissions) => x === GlobalPermissionsEnum.GLOBAL_ADMIN);

    // triple absurd checking because a GLOBAL ADMIN DESERVES IT
    if (glovalAdminKysoPermissions) {
      return true;
    }

    // Check if user has the required permissions in the team
    let userPermissionsInThatTeam: ResourcePermissions | undefined;
    if (teamId) {
      userPermissionsInThatTeam = permissions.teams!.find((x: ResourcePermissions) => x.id.toLowerCase() === teamId.toLowerCase());
    }

    // Check if user has the required permissions in the organization
    let userPermissionsInThatOrganization: ResourcePermissions | undefined;

    // If the team is private we should not take into account the organization permissions
    if (userPermissionsInThatTeam && userPermissionsInThatTeam.team_visibility !== TeamVisibilityEnum.PRIVATE) {
      userPermissionsInThatOrganization = permissions.organizations!.find((x: ResourcePermissions) => x.id.toLowerCase() === organizationId);
    }

    let allUserPermissions: KysoPermissions[] = [];

    if (userPermissionsInThatTeam && userPermissionsInThatTeam?.permissions && userPermissionsInThatTeam.permissions.length > 0) {
      allUserPermissions = [...userPermissionsInThatTeam.permissions];
    } else if (userPermissionsInThatOrganization && userPermissionsInThatTeam && userPermissionsInThatTeam.organization_inherited && userPermissionsInThatTeam?.permissions) {
      allUserPermissions = [...userPermissionsInThatOrganization.permissions!];
    }

    if (userPermissionsInThatOrganization) {
      allUserPermissions = [...allUserPermissions, ...userPermissionsInThatOrganization.permissions!];
    }

    // Finally, check the global permissions
    if (permissions.global) {
      allUserPermissions = [...allUserPermissions, ...permissions.global];
    }

    return kysoPermissions.some((i: KysoPermissions) => allUserPermissions.includes(i));
  }
}

export const isGlobalAdmin = (tokenPermissions: TokenPermissions): boolean => {
  if (!tokenPermissions) {
    return false;
  }

  if (!tokenPermissions.global || !Array.isArray(tokenPermissions.global)) {
    return false;
  }

  return tokenPermissions.global.includes(GlobalPermissionsEnum.GLOBAL_ADMIN);
};
