export class BreadcrumbItem {
  public name: string;

  public href: string;

  public current: boolean;

  constructor(name: string, href: string, current: boolean) {
    this.name = name;
    this.href = href;
    this.current = current;
  }
}
