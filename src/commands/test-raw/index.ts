import Ajv from 'ajv';
import dedent from 'dedent';
import packageName from 'depcheck-package-name';
import { execa } from 'execa';

import isCI from './is-ci';
import packageJsonSchema from './package-json-schema';

const ajv = new Ajv({ allowUnionTypes: true });
const validatePackageJson = ajv.compile(packageJsonSchema);

export default async function (options) {
  options = {
    log: process.env.NODE_ENV !== 'test',
    patterns: [],
    stderr: 'inherit',
    ...options,
  };

  if (options.patterns.length === 0) {
    if (!validatePackageJson(this.packageConfig)) {
      throw new Error(dedent`
        package.json invalid
        ${ajv.errorsText(validatePackageJson.errors)}
      `);
    }

    await this.lint(options);
    await this.depcheck(options);
  }

  const runDockerTests =
    !isCI({ cwd: this.cwd }) || !['win32', 'darwin'].includes(process.platform);

  return execa(
    packageName`c8`,
    [
      'playwright',
      'test',
      '--pass-with-no-tests',
      ...(runDockerTests ? [] : ['--grep-invert', '@usesdocker']),
      ...(options.updateSnapshots ? ['--update-snapshots'] : []),
      ...(options.ui ? ['--ui'] : []),
      ...(options.uiHost ? ['--ui-host', options.uiHost] : []),
      ...(options.grep ? ['--grep', options.grep] : []),
      '--trace',
      'retain-on-failure',
      ...(isCI({ cwd: this.cwd }) ? ['--forbid-only'] : []),
      /**
       * Reporter set to dot in CI environments by default.
       * See https://github.com/microsoft/playwright/blob/42ade54975f6990c41cddc7b6e11c46a36648d0d/packages/playwright/src/common/config.ts#L301.
       */
      '--reporter',
      'list',
      ...options.patterns,
    ],
    {
      cwd: this.cwd,
      env: { NODE_ENV: 'test' },
      ...(options.log && { stdout: 'inherit' }),
      stderr: options.stderr,
    },
  );
}
