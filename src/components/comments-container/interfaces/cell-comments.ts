/* eslint-disable camelcase */
import type { Comment } from './comment';

export interface CellComments {
  cell_id: string;
  author_id: string;
  comments: Comment[];
}
