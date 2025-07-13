import pathLib from 'node:path';

import { execaCommand } from 'execa';
import { globby } from 'globby';
import parsePackagejsonName from 'parse-packagejson-name';
import ts from 'typescript';

import type { CommandOptionsInput } from '@/src/commands/command-options-input';

export default async function (optionsInput?: CommandOptionsInput) {
  const options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...optionsInput,
  };

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

  const { config } = ts.readConfigFile(
    pathLib.join(this.cwd, 'tsconfig.json'),
    ts.sys.readFile,
  );

  const { fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, this.cwd);

  const vueFiles = await globby('**/*.vue', {
    cwd: this.cwd,
    dot: true,
    ignore: ['**/node_modules/**'],
  });

  const allFileNames = [...fileNames, ...vueFiles];

  if (allFileNames.length > 0) {
    await execaCommand('vue-tsc --noEmit', {
      ...(options.log && { stdout: 'inherit' }),
      cwd: this.cwd,
      stderr: options.stderr,
    });
  }

  return result;
}
