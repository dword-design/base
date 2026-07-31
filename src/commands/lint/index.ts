import { execaCommand } from 'execa';
import parsePackagejsonName from 'parse-packagejson-name';

import type { Base } from '@/src';
import type { PartialCommandOptions } from '@/src/commands/command-options-input';

export default async (base: Base, options: PartialCommandOptions = {}) => {
  options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...options,
  };

  base.lintPackagejson();
  const packageName = parsePackagejsonName(base.packageConfig.name).fullName;

  if (
    base.config.git !== undefined &&
    packageName !== base.config.git.project
  ) {
    throw new Error(
      `Package name '${packageName}' has to be equal to repository name '${base.config.git.project}'`,
    );
  }

  await base.config.lint.call(base, options);
  return execaCommand('eslint --fix --no-error-on-unmatched-pattern .', {
    ...(options.log && { stdout: 'inherit' }),
    cwd: base.cwd,
    stderr: options.stderr,
  });
};
