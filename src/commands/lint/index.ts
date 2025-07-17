import { execaCommand } from 'execa';
import parsePackagejsonName from 'parse-packagejson-name';

import type { CommandOptionsInput } from '@/src/commands/command-options-input';

export default async function (optionsInput?: CommandOptionsInput) {
  const options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...optionsInput,
  };

  this.lintPackagejson();
  const packageName = parsePackagejsonName(this.packageConfig.name).fullName;

  if (
    this.config.git !== undefined &&
    packageName !== this.config.git.project
  ) {
    throw new Error(
      `Package name '${packageName}' has to be equal to repository name '${this.config.git.project}'`,
    );
  }

  await this.config.lint.call(this, options);

  const result = await execaCommand(
    'eslint --fix --no-error-on-unmatched-pattern .',
    {
      ...(options.log && { stdout: 'inherit' }),
      cwd: this.cwd,
      stderr: options.stderr,
    },
  );

  await this.typecheck(options);
  return result;
}
