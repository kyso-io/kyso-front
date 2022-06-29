/**
 *
 * @param {*} activeOrganization const activeOrganization = useSelector((s) => selectOrganizationBySlugifiedName(s, organizationName));
 * @param {*} activeTeam const activeTeam = useSelector((s) => selectTeamBySlugifiedName(s, teamName));
 * @param {*} currentUserPermissions   const currentUserPermissions = useSelector(selectCurrentUserPermissions)
 * @param {*} listOfPermissionsToCheck "KYSO_IO_EDIT_REPORT"
 * @returns true if user has permissions on that team + org, false if not
 */
const checkPermissions = (
  activeOrganization,
  activeTeam,
  currentUserPermissions,
  listOfPermissionsToCheck
) => {
  if (!activeOrganization || !currentUserPermissions) {
    return false;
  }

  let permissionInOrganization = false;
  let permissionInTeam = false;

  /* if (!permissionsOfOrganization) {
    return false;
  } */

  // Get the permissions of that user in that team
  let permissionsInThatTeam = null;
  let permissionsInThatOrganization = null;

  if (activeTeam) {
    permissionsInThatTeam = currentUserPermissions.teams.find(
      (x) => x.id === activeTeam.id
    );

    /*
    console.log(
      `Permissions in that team ${
        activeTeam.sluglified_name || activeTeam.name
      }`,
      permissionsInThatTeam
    ); */
  }

  if (activeOrganization) {
    permissionsInThatOrganization = currentUserPermissions.organizations.find(
      (x) => x.id === activeOrganization.id
    );

    /* console.log(
      `Permissions in that organization ${
        activeOrganization.sluglified_name || activeOrganization.name
      }`,
      permissionsInThatOrganization
    ); */
  }

  if (permissionsInThatOrganization) {
    permissionInOrganization =
      permissionsInThatOrganization.permissions.includes(
        listOfPermissionsToCheck
      );
  }

  if (permissionsInThatTeam && permissionsInThatTeam?.permissions) {
    permissionInTeam = permissionsInThatTeam.permissions.includes(
      listOfPermissionsToCheck
    );
  }

  if (
    !permissionsInThatTeam ||
    permissionsInThatTeam?.organization_inherited === true
  ) {
    // console.log(`[ORG] Has permissions returning ${permissionInOrganization}`);
    return permissionInOrganization;
  }
  // console.log(`[TEAM] Has permissions returning ${permissionInTeam}`);
  return permissionInTeam;
};

export default checkPermissions;

// List of possible permissions role.
// Organization:
// KYSO_IO_ADMIN_ORGANIZATION
// KYSO_IO_EDIT_ORGANIZATION
// KYSO_IO_CREATE_ORGANIZATION
// KYSO_IO_DELETE_ORGANIZATION
// KYSO_IO_READ_ORGANIZATION

// Team:
// KYSO_IO_ADMIN_TEAM
// KYSO_IO_EDIT_TEAM
// KYSO_IO_CREATE_TEAM
// KYSO_IO_DELETE_TEAM
// KYSO_IO_READ_TEAM

// User:
// KYSO_IO_ADMIN_USER
// KYSO_IO_EDIT_USER
// KYSO_IO_CREATE_USER
// KYSO_IO_DELETE_USER
// KYSO_IO_READ_USER

// Discussion:
// KYSO_IO_ADMIN_DISCUSSION
// KYSO_IO_EDIT_DISCUSSION
// KYSO_IO_CREATE_DISCUSSION
// KYSO_IO_DELETE_DISCUSSION
// KYSO_IO_READ_DISCUSSION

// Report:
// KYSO_IO_ADMIN_REPORT
// KYSO_IO_EDIT_REPORT
// KYSO_IO_CREATE_REPORT
// KYSO_IO_DELETE_REPORT
// KYSO_IO_READ_REPORT
// KYSO_IO_GLOBAL_PIN_REPORT

// Github Repo:
// KYSO_IO_ADMIN_GITHUB_REPO
// KYSO_IO_EDIT_GITHUB_REPO
// KYSO_IO_CREATE_GITHUB_REPO
// KYSO_IO_DELETE_GITHUB_REPO
// KYSO_IO_READ_GITHUB_REPO

// Comments:
// KYSO_IO_ADMIN_COMMENT
// KYSO_IO_EDIT_COMMENT
// KYSO_IO_CREATE_COMMENT
// KYSO_IO_DELETE_COMMENT
// KYSO_IO_READ_COMMENT
