import type { GitMetadata, TableOfContentEntryDto } from '@kyso-io/kyso-model';

export type FileToRender = {
  path: string;
  id: string;
  path_scs: string;
  isLoading: boolean;
  percentLoaded?: number | null;
  content?: Buffer | string | null;
  toc: TableOfContentEntryDto[];
  git_metadata: GitMetadata | null;
};
