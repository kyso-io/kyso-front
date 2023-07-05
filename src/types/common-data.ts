import type { Organization, Team, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';

export type CommonData = {
  permissions: TokenPermissions | null;
  token: string | null;
  organization: Organization | null;
  httpCodeOrganization: number | null;
  errorOrganization: string | null;
  team: Team | null;
  httpCodeTeam: number | null;
  errorTeam: string | null;
  user: UserDTO | null | undefined;
};
