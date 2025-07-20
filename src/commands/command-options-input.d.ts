import type { StdoutStderrOptionCommon } from 'execa';

export type PartialCommandOptions = {
  log?: boolean;
  stderr?: StdoutStderrOptionCommon<false>;
  env?: Record<string, string>;
};
