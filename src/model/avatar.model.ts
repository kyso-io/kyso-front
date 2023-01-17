import { v4 } from 'uuid';

export class Avatar {
  public avatar_url?: string;

  public id?: string;

  public username?: string;

  public display_name: string;

  constructor(display_name: string, avatar_url?: string, id?: string, username?: string) {
    this.display_name = display_name;

    if (avatar_url) {
      this.avatar_url = avatar_url;
    }
    if (username) {
      this.username = username;
    }
    if (id) {
      this.id = id;
    } else {
      this.id = v4();
    }
  }
}
