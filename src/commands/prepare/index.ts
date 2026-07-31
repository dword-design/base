import { createRequire } from 'node:module';
import pathLib from 'node:path';

import packageName from 'depcheck-package-name';
import { execa, execaCommand } from 'execa';
import fs from 'fs-extra';
import outputFiles from 'output-files';

import type { Base } from '@/src';
import type { PartialCommandOptions } from '@/src/commands/command-options-input';

const resolver = createRequire(import.meta.url);

const commitlintPackageConfig = resolver(
  packageName`@commitlint/cli/package.json`,
);

export default async (base: Base, options: PartialCommandOptions = {}) => {
  options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...options,
  };

  await outputFiles(base.cwd, base.generatedFiles);

  if (await fs.exists(pathLib.join(base.cwd, '.git'))) {
    await execaCommand('husky install', {
      cwd: base.cwd,
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
        cwd: base.cwd,
        ...(options.log && { stdout: 'inherit' }),
        stderr: options.stderr,
      },
    );

    await execa(
      'husky',
      ['set', '.husky/pre-commit', `npx ${packageName`lint-staged`}`],
      {
        cwd: base.cwd,
        ...(options.log && { stdout: 'inherit' }),
        stderr: options.stderr,
      },
    );
  }

  await base.config.prepare.call(base, options);
};
