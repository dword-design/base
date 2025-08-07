import type { PartialCommandOptions } from './partial-command-options';

export type PartialTestOptions = PartialCommandOptions & {
  updateSnapshots?: boolean;
  ui?: boolean;
  uiHost?: string;
  grep?: string;
  patterns?: string[];
}
