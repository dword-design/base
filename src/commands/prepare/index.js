import { first, keys } from '@dword-design/functions';
import packageName from 'depcheck-package-name';
import { execa, execaCommand } from 'execa';
import fs from 'fs-extra';
import { createRequire } from 'module';
import outputFiles from 'output-files';

const _require = createRequire(import.meta.url);

const commitlintPackageConfig = _require(
  packageName`@commitlint/cli/package.json`,
);

export default async function () {
  await outputFiles(this.generatedFiles);

  if (await fs.exists('.git')) {
    await execaCommand('husky install');

    await execa('husky', [
      'set',
      '.husky/commit-msg',
      `npx ${commitlintPackageConfig.bin |> keys |> first} --edit "$1"`,
    ]);
  }

  await this.config.prepare();
}
