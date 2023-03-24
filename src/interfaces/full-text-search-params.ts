import type { ElasticSearchIndex } from '@kyso-io/kyso-model';

export interface FullTextSearchParams {
  type: ElasticSearchIndex;
  terms: string;
  page: number;
  perPage: number;
  filterOrgs: string[];
  filterTeams: string[];
  filterTags: string[];
  filterPeople: string[];
  filterFileTypes: string[];
  orderBy: string;
  order: 'asc' | 'desc';
}
