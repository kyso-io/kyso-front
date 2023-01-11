/* eslint no-case-declarations: off */

import type { Organization, ResourcePermissions, Team, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';
import { AllowDownload } from '@kyso-io/kyso-model';

export const isReportDownloadable = (permissions: TokenPermissions, organization: Organization, team: Team, userDTO: UserDTO | null | undefined): boolean => {
  if (team.allow_download === AllowDownload.INHERITED) {
    switch (organization.allow_download) {
      case AllowDownload.ALL:
        return true;
      case AllowDownload.ONLY_MEMBERS:
        if (!userDTO) {
          return false;
        }
        const index: number = permissions.organizations!.findIndex((resourcePermissions: ResourcePermissions) => resourcePermissions.id === organization.id);
        return index !== -1;
      case AllowDownload.NONE:
        return false;
      default:
        return false;
    }
  } else {
    switch (team.allow_download) {
      case AllowDownload.ALL:
        return true;
      case AllowDownload.ONLY_MEMBERS:
        if (!userDTO) {
          return false;
        }
        const index: number = permissions.teams!.findIndex((resourcePermissions: ResourcePermissions) => resourcePermissions.id === team.id);
        return index !== -1;
      case AllowDownload.NONE:
        return false;
      default:
        return false;
    }
  }
};
