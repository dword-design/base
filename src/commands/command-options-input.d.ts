import type { StdoutStderrOptionCommon } from 'execa';

export type CommandOptionsInput = {
  log?: boolean;
  stderr?: StdoutStderrOptionCommon<false>;
  env?: Record<string, string>;
};
