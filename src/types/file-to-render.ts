export type FileToRender = {
  path: string;
  id: string;
  path_scs: string;
  isLoading: boolean;
  percentLoaded?: number | null;
  content?: Buffer | string | null;
};