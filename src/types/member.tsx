import type { TeamMembershipOriginEnum } from '@kyso-io/kyso-model';

export interface Member {
  id: string;
  nickname: string;
  username: string;
  // Added to make it compatible with UserDTO and Avatar objects, but it's value
  // it's the same as nickname
  display_name: string;
  avatar_url: string;
  email: string;
  organization_roles: string[];
  team_roles: string[];
  membership_origin?: TeamMembershipOriginEnum;
}
