import { execaCommand } from 'execa';

import type { Base } from '@/src';
import type { PartialCommandOptions } from '@/src/commands/command-options-input';

export default (
  base: Base,
  options: PartialCommandOptions & { allowEmpty?: boolean } = {},
) => {
  options = {
    allowEmpty: false,
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...options,
  };

  return execaCommand(`git-cz${options.allowEmpty ? ' --allow-empty' : ''}`, {
    cwd: base.cwd,
    ...(options.log && { stdout: 'inherit' }),
    stderr: options.stderr,
  });
};
