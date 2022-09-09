/* eslint-disable camelcase */
export interface JupyterNotebook {
  cells: Cell[];
  metadata: JupyterBookMetadata;
  nbformat: number;
  nbformat_minor: number;
}

export interface Cell {
  cell_type: string;
  execution_count?: number | null;
  id: string;
  metadata: CellMetadata;
  outputs?: Output[];
  source: string | string[];
}

export interface CellMetadata {}

export interface Output {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  data?: { [key: string]: any };
  metadata?: OutputMetadata;
  execution_count?: number;
  output_type: string;
  name?: string;
  text?: string[];
  ename?: string;
  evalue?: string;
  traceback?: string[];
}

export interface OutputMetadata {
  needs_background?: string;
  'application/json'?: {
    expanded: boolean;
    root: string;
  };
}

export interface JupyterBookMetadata {
  kernelspec: Kernelspec;
  language_info: LanguageInfo;
}

export interface Kernelspec {
  display_name: string;
  language: string;
  name: string;
}

export interface LanguageInfo {
  codemirror_mode: CodemirrorMode;
  file_extension: string;
  mimetype: string;
  name: string;
  nbconvert_exporter: string;
  pygments_lexer: string;
  version: string;
}

export interface CodemirrorMode {
  name: string;
  version: number;
}
