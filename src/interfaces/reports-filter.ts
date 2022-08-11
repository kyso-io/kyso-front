export interface ReportsFilter {
  key: string | string[];
  label: string | string[];
  modificable: boolean;
  type?: 'user' | 'tag' | 'date' | 'author_ids-operator' | 'date-operator';
  image?: string | string[];
  isLeaf: boolean;
}
