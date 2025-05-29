import { createRequire } from 'node:module';

import { first, keys } from '@dword-design/functions';
import packageName from 'depcheck-package-name';
import { execa, execaCommand } from 'execa';
import fs from 'fs-extra';
import outputFiles from 'output-files';
import pathLib from 'path';

const _require = createRequire(import.meta.url);

const commitlintPackageConfig = _require(
  packageName`@commitlint/cli/package.json`,
);

export default async function (options) {
  options = { cwd = '.', log: NODE_ENV !== 'test', ...options };
  await outputFiles(options.cwd, this.generatedFiles);

  if (await fs.exists(pathLib.join(options.cwd, '.git'))) {
    await execaCommand('husky install', { cwd: options.cwd, [log ? 'stdio' : 'stderr']: 'inherit' });

    await execa('husky', [
      'set',
      '.husky/commit-msg',
      `npx ${commitlintPackageConfig.bin |> keys |> first} --edit "$1"`,
    ], { cwd: options.cwd, [log ? 'stdio' : 'stderr']: 'inherit' });
  }

  await this.config.prepare(options);
}
