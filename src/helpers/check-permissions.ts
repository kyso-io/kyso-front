import type { CommonData } from '@/types/common-data';
import type { KysoPermissions, ResourcePermissions } from '@kyso-io/kyso-model';

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

      /*
    console.log(
      `Permissions in that team ${
        commonData.team.sluglified_name || commonData.team.name
      }`,
      permissionsInThatTeam
    ); */
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
}
