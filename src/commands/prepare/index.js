import { createRequire } from 'node:module';
import pathLib from 'node:path';

import { first, keys } from '@dword-design/functions';
import packageName from 'depcheck-package-name';
import { execa, execaCommand } from 'execa';
import fs from 'fs-extra';
import outputFiles from 'output-files';

const _require = createRequire(import.meta.url);

const commitlintPackageConfig = _require(
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
        `npx ${commitlintPackageConfig.bin |> keys |> first} --edit "$1"`,
      ],
      {
        cwd: this.cwd,
        ...(options.log && { stdout: 'inherit' }),
        stderr: options.stderr,
      },
    );
  }

  await this.config.prepare(options);
}
