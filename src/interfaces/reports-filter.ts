export interface ReportsFilter {
  key: string;
  label: string;
  modificable: boolean;
  type?: 'user' | 'tag' | 'date' | 'author_ids-operator' | 'date-operator';
  image?: string;
  isLeaf: boolean;
}
