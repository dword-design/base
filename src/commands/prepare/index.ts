import { createRequire } from 'node:module';
import pathLib from 'node:path';

import packageName from 'depcheck-package-name';
import { execa, execaCommand } from 'execa';
import fs from 'fs-extra';
import outputFiles from 'output-files';

const resolver = createRequire(import.meta.url);

const commitlintPackageConfig = resolver(
  packageName`@commitlint/cli/package.json`,
);

export default async function (options) {
  options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...options,
  };

  await outputFiles(this.cwd, this.generatedFiles);

  if (await fs.exists(pathLib.join(this.cwd, '.git'))) {
    await execaCommand('husky install', {
      cwd: this.cwd,
      ...(options.log && { stdout: 'inherit' }),
      stderr: options.stderr,
    });

    await execa(
      'husky',
      [
        'set',
        '.husky/commit-msg',
        `npx ${Object.keys(commitlintPackageConfig.bin)[0]} --edit "$1"`,
      ],
      {
        cwd: this.cwd,
        ...(options.log && { stdout: 'inherit' }),
        stderr: options.stderr,
      },
    );

    await execa(
      'husky',
      ['set', '.husky/pre-commit', `npx ${packageName`lint-staged`}`],
      {
        cwd: this.cwd,
        ...(options.log && { stdout: 'inherit' }),
        stderr: options.stderr,
      },
    );
  }

  await this.config.prepare.call(this, options);
}
