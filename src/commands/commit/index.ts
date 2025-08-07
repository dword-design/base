import { execaCommand } from 'execa';
import type { PartialCommandOptions } from '@/src/commands/partial-command-options';
import type { Base } from '@/src';

export default function (this: Base, options: PartialCommandOptions & { allowEmpty?: boolean } = {}) {
  options = {
    allowEmpty: false,
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...options,
  };

  return execaCommand(`git-cz${options.allowEmpty ? ' --allow-empty' : ''}`, {
    cwd: this.cwd,
    ...(options.log && { stdout: 'inherit' }),
    stderr: options.stderr,
  });
}
