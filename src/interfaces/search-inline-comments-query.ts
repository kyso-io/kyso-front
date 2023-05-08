import type { InlineCommentStatusEnum } from '@kyso-io/kyso-model';

export interface SearchInlineCommentsQuery {
  limit: number;
  page: number;
  order_by: 'created_at' | 'updated_at' | 'status';
  order_direction: 'asc' | 'desc';
  report_author_id?: string;
  report_author_id_operator?: 'eq' | 'ne';
  inline_comment_author_id?: string;
  inline_comment_author_id_operator?: 'eq' | 'ne';
  status?: InlineCommentStatusEnum;
  status_operator?: 'in' | 'nin';
  organization_id?: string;
  team_id?: string;
  team_id_operator?: 'eq' | 'ne';
  text?: string;
  start_date?: string;
  end_date?: string;
  start_date_operator?: 'lt' | 'lte' | 'eq' | 'neq' | 'gte' | 'gt';
  end_date_operator?: 'lt' | 'lte' | 'eq' | 'neq' | 'gte' | 'gt';
}
