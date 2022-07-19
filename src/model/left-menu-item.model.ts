/* eslint-disable @typescript-eslint/no-explicit-any */
export class LeftMenuItem {
  public name: string;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public icon: any;

  public count: number;

  public href: string;

  public current: boolean;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  constructor(name: string, icon: any, count: number, href: string, current: boolean) {
    this.name = name;
    this.icon = icon;
    this.count = count;
    this.href = href;
    this.current = current;
  }
}
