import { createRequire } from 'node:module';
import pathLib from 'node:path';

import Ajv from 'ajv';
import dedent from 'dedent';
import packageName from 'depcheck-package-name';
import { execa } from 'execa';
import fs from 'fs-extra';

import isCI from './is-ci';
import packageJsonSchema from './package-json-schema';

const _require = createRequire(import.meta.url);
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
    this.packageConfig.type === 'module' ? packageName`c8` : packageName`nyc`,
    [
      ...(this.packageConfig.type === 'module'
        ? ['--exclude', 'eslint.config.ts']
        : []),
      ...(this.config.testRunner === 'playwright'
        ? [
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
          ]
        : [
            '--reporter',
            'lcov',
            '--reporter',
            'text',
            '--cwd',
            this.cwd,
            '--all',
            '--exclude',
            '**/*.spec.js',
            '--exclude',
            'coverage',
            '--exclude',
            'tmp-*',
            '--exclude',
            'dist',
            'mocha',
            '--reporter',
            _require.resolve(packageName`mocha-spec-reporter-with-file-names`),
            '--ui',
            packageName`mocha-ui-exports-auto-describe`,
            '--require',
            packageName`@dword-design/pretest`,
            ...((await fs.exists(
              pathLib.join(this.cwd, 'global-test-hooks.js'),
            ))
              ? ['--require', 'global-test-hooks.js']
              : []),
            '--file',
            _require.resolve(packageName`@dword-design/setup-test`),
            ...(runDockerTests ? [] : ['--ignore', '**/*.usesdocker.spec.js']),
            '--timeout',
            130_000,
            ...(options.patterns.length > 0
              ? options.patterns
              : ['{,!(node_modules)/**/}*.spec.js']),
            ...(options.grep ? ['--grep', options.grep] : []),
            ...(process.platform === 'win32' ? ['--exit'] : []),
          ]),
    ],
    {
      cwd: this.cwd,
      env: {
        NODE_ENV: 'test',
        ...(this.packageConfig.type === 'module' && {
          NODE_OPTIONS: `--require=${packageName`suppress-experimental-warnings`} --require=${packageName`@dword-design/suppress-babel-register-esm-warning`} --experimental-loader=${packageName`babel-register-esm`}`,
        }),
        ...(options.updateSnapshots && this.config.testRunner === 'mocha'
          ? { SNAPSHOT_UPDATE: '1' }
          : {}),
      },
      ...(options.log && { stdout: 'inherit' }),
      stderr: options.stderr,
    },
  );
}
