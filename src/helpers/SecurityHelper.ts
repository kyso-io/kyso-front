export class SecurityHelper {
  // public static checkPermissions(activeOrganization: Organization, activeTeam: Team, currentUserPermissions: TokenPermissions, listOfPermissionsToCheck: KysoPermissions) {
  //   if (!activeOrganization || !currentUserPermissions) {
  //     return false;
  //   }
  //   let permissionInOrganization = false;
  //   let permissionInTeam = false;
  //   /* if (!permissionsOfOrganization) {
  //     return false;
  //   } */
  //   // Get the permissions of that user in that team
  //   let permissionsInThatTeam = null;
  //   let permissionsInThatOrganization = null;
  //   if (activeTeam) {
  //     permissionsInThatTeam = currentUserPermissions.teams?.find((x) => x.id === activeTeam.id);
  //     /*
  //     console.log(
  //       `Permissions in that team ${
  //         activeTeam.sluglified_name || activeTeam.name
  //       }`,
  //       permissionsInThatTeam
  //     ); */
  //   }
  //   if (activeOrganization) {
  //     permissionsInThatOrganization = currentUserPermissions.organizations?.find((x) => x.id === activeOrganization.id);
  //     /* console.log(
  //       `Permissions in that organization ${
  //         activeOrganization.sluglified_name || activeOrganization.name
  //       }`,
  //       permissionsInThatOrganization
  //     ); */
  //   }
  //   if (permissionsInThatOrganization) {
  //     const hasPermissions = permissionsInThatOrganization.permissions?.includes(listOfPermissionsToCheck);
  //     if (hasPermissions) {
  //       permissionInOrganization = hasPermissions;
  //     } else {
  //       // If undefined
  //       permissionInOrganization = false;
  //     }
  //   }
  //   if (permissionsInThatTeam && permissionsInThatTeam?.permissions) {
  //     permissionInTeam = permissionsInThatTeam.permissions.includes(listOfPermissionsToCheck);
  //   }
  //   if (!permissionsInThatTeam || permissionsInThatTeam?.organization_inherited === true) {
  //     // console.log(`[ORG] Has permissions returning ${permissionInOrganization}`);
  //     return permissionInOrganization;
  //   }
  //   // console.log(`[TEAM] Has permissions returning ${permissionInTeam}`);
  //   return permissionInTeam;
  // }
}
