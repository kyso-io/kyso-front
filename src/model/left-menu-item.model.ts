export class LeftMenuItem {
  public name: string;
  public icon: any;
  public count: number;
  public href: string;
  public current: boolean

  constructor(name: string, icon: any, count: number, href: string, current: boolean) {
    this.name = name;
    this.icon = icon;
    this.count = count;
    this.href = href;
    this.current = current;
  }
}