import type { Organization, Team, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';

export type CommonData = {
  permissions: TokenPermissions | null;
  token: string | null;
  organization: Organization | null;
  team: Team | null;
  user: UserDTO | null | undefined;
};
