import type { TeamMembershipOriginEnum } from '@kyso-io/kyso-model';

export interface Member {
  id: string;
  nickname: string;
  username: string;
  avatar_url: string;
  email: string;
  organization_roles: string[];
  team_roles: string[];
  membership_origin?: TeamMembershipOriginEnum;
}
