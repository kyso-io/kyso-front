import type { ElasticSearchIndex } from '@kyso-io/kyso-model';

export interface SearchNavItem {
  name: string;
  elasticSearchIndex: ElasticSearchIndex;
  count: number;
}
