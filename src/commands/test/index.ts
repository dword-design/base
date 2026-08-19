import type { Base } from '@/src';
import type { PartialCommandOptions } from '@/src/commands/command-options-input';
import testDocker from '@/src/commands/test-docker';
import testRaw from '@/src/commands/test-raw';

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
    ? testDocker(base, options)
    : testRaw(base, options);
