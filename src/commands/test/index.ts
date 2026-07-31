import type { Base } from '@/src';
import type { PartialCommandOptions } from '@/src/commands/command-options-input';

export default (
  base: Base,
  options: PartialCommandOptions & {
    grep?: string;
    patterns?: string[];
    ui?: boolean;
    uiHost?: string;
    updateSnapshots?: boolean;
  } = {},
) =>
  base.config.testInContainer
    ? base.testDocker(options)
    : base.testRaw(options);
