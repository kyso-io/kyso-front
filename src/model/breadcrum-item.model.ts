import type { TeamVisibilityEnum } from '@kyso-io/kyso-model';

export class BreadcrumbItem {
  public name: string;

  public href: string;

  public current: boolean;

  public team_visibility?: TeamVisibilityEnum;

  constructor(name: string, href: string, current: boolean, team_visibility?: TeamVisibilityEnum) {
    this.name = name;
    this.href = href;
    this.current = current;
    this.team_visibility = team_visibility;
  }
}
