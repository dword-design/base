import type { Base } from '@/src';
import type { PartialCommandOptions } from '@/src/commands/command-options-input';
import depcheck from '@/src/commands/depcheck';
import lint from '@/src/commands/lint';
import checkUnknownFiles from '@/src/commands/check-unknown-files';
import test from '@/src/commands/test';
import typecheck from '@/src/commands/typecheck';

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

  await lint(base, options);
  await typecheck(base, options);
  await depcheck(base);
  await checkUnknownFiles(base);
  await test(base, options);
};
