import packageName from 'depcheck-package-name';
import { execa } from 'execa';

import type { Base } from '@/src';
import type { PartialCommandOptions } from '@/src/commands/command-options-input';

import isCI from './is-ci';

export default (
  base: Base,
  optionsInput: PartialCommandOptions & {
    grep?: string;
    patterns?: string[];
    ui?: boolean;
    uiHost?: string;
    updateSnapshots?: boolean;
  } = {},
) => {
  const options = {
    grep: '',
    log: process.env.NODE_ENV !== 'test',
    patterns: [],
    stderr: 'inherit' as const,
    ui: false,
    uiHost: null,
    updateSnapshots: false,
    ...optionsInput,
  };

  const isRunDockerTests =
    !isCI({ cwd: base.cwd }) || !['win32', 'darwin'].includes(process.platform);

  return execa(
    packageName`c8`,
    [
      '--exclude',
      'fixtures',
      '--exclude',
      'test-results',
      '--exclude',
      'playwright.config.ts',
      'playwright',
      'test',
      '--pass-with-no-tests',
      ...(isRunDockerTests ? [] : ['--grep-invert', '@usesdocker']),
      ...(options.updateSnapshots ? ['--update-snapshots'] : []),
      ...(options.ui ? ['--ui'] : []),
      ...(options.uiHost ? ['--ui-host', options.uiHost] : []),
      ...(options.grep ? ['--grep', options.grep] : []),
      '--trace',
      'retain-on-failure',
      ...(isCI({ cwd: base.cwd }) ? ['--forbid-only'] : []),
      /**
       * Reporter set to dot in CI environments by default.
       * See https://github.com/microsoft/playwright/blob/42ade54975f6990c41cddc7b6e11c46a36648d0d/packages/playwright/src/common/config.ts#L301.
       */
      '--reporter',
      'list',
      ...options.patterns,
    ],
    {
      cwd: base.cwd,
      env: { NODE_ENV: 'test' },
      stderr: options.stderr,
      stdout: options.log ? 'inherit' : 'pipe',
    },
  );
};
