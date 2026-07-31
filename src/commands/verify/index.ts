import type { Base } from '@/src';
import type { PartialCommandOptions } from '@/src/commands/command-options-input';

export default async (
  base: Base,
  options: PartialCommandOptions & {
    grep?: string;
    patterns?: string[];
    updateSnapshots?: boolean;
  } = {},
) => {
  options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...options,
  };

  await base.lint(options);
  await base.typecheck(options);
  await base.depcheck();
  await base.checkUnknownFiles();
  await base.test(options);
};
