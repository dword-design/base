import { Base } from '@/src';
import type { PartialCommandOptions } from '@/src/commands/partial-command-options';

export default async function (this: Base, options: PartialCommandOptions & { patterns?: string[] } = {}) {
  options = {
    log: process.env.NODE_ENV !== 'test',
    patterns: [],
    stderr: 'inherit',
    ...options,
  };

  await this.lint(options);
  await this.typecheck(options);
  await this.depcheck();
  await this.test(options);
}
