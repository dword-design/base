import type { StdoutStderrOption } from 'execa';

export type PartialCommandOptions = {
  env?: Record<string, string>;
  log?: boolean;
  stderr?: StdoutStderrOption;
};
