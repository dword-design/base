import pathLib from 'node:path';

import { test } from '@playwright/test';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import { expect } from 'playwright-expect-snapshot';

import { Base } from '@/src';

import self from '.';

test('custom config', ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  const base = new Base(
    { packageConfig: { main: 'dist/index.scss' } },
    { cwd },
  );

  expect(self(base).main).toEqual('dist/index.scss');
});

test('empty', ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  expect(self(new Base(null, { cwd }))).toMatchSnapshot();
});

test('existing package', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({
      author: 'foo bar',
      bin: { foo: './dist/cli.js' },
      dependencies: { foo: '^1.0.0' },
      description: 'foo bar',
      devDependencies: { 'base-config-bar': '^1.0.0' },
      extra: 'foo',
      files: 'foo',
      keywords: ['foo', 'bar'],
      license: 'ISC',
      main: 'dist/index.scss',
      name: 'foo',
      optionalDependencies: { typescript: '^1.0.0' },
      peerDependencies: { nuxt: '^1.0.0' },
      pnpm: { overrides: { bulma: '^1' } },
      publishConfig: { access: 'public' },
      scripts: {
        foo: String.raw`echo \"foo\"`,
        test: String.raw`echo \"foo\"`,
      },
      type: 'module',
      version: '1.1.0',
    }),
  );

  expect(self(new Base(null, { cwd }))).toMatchSnapshot();
});

test('git repo', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });

  await execaCommand('git remote add origin git@github.com:bar/foo.git', {
    cwd,
  });

  expect(self(new Base(null, { cwd }))).toMatchSnapshot();
});

test('non-github repo', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });

  await execaCommand('git remote add origin git@special.com:bar/foo.git', {
    cwd,
  });

  expect(() => self(new Base(null, { cwd }))).toThrow(
    'Only GitHub repositories are supported.',
  );
});

test('private', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ private: true }),
  );

  expect(self(new Base(null, { cwd })).private).toBeTruthy();
});
