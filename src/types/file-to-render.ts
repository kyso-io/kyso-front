import type { GitMetadata, TableOfContentEntryDto, ColumnStats } from '@kyso-io/kyso-model';

export type FileToRender = {
  path: string;
  id: string;
  path_scs: string;
  isLoading: boolean;
  percentLoaded?: number | null;
  content?: Buffer | string | null;
  toc: TableOfContentEntryDto[];
  git_metadata: GitMetadata | null;
  columns_stats: ColumnStats[];
};
