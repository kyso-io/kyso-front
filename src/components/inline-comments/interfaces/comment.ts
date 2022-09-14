/* eslint-disable camelcase */
export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  text: string;
  date: Date;
  edited: boolean;
}
