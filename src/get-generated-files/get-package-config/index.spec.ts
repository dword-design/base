import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import { execaCommand } from 'execa';
import fs from 'fs-extra';

import { Base } from '@/src';

test('custom config', ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  expect(
    new Base(
      { packageConfig: { main: 'dist/index.scss' } },
      { cwd },
    ).getPackageConfig().main,
  ).toEqual('dist/index.scss');
});

test('empty', ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  expect(
    JSON.stringify(new Base(null, { cwd }).getPackageConfig(), undefined, 2),
  ).toMatchSnapshot();
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

  expect(
    JSON.stringify(new Base(null, { cwd }).getPackageConfig(), undefined, 2),
  ).toMatchSnapshot();
});

test('git repo', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });

  await execaCommand('git remote add origin git@github.com:bar/foo.git', {
    cwd,
  });

  expect(
    JSON.stringify(new Base(null, { cwd }).getPackageConfig(), undefined, 2),
  ).toMatchSnapshot();
});

test('non-github repo', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });

  await execaCommand('git remote add origin git@special.com:bar/foo.git', {
    cwd,
  });

  expect(() => new Base(null, { cwd }).getPackageConfig()).toThrow(
    'Only GitHub repositories are supported.',
  );
});

test('private', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ private: true }),
  );

  expect(new Base(null, { cwd }).getPackageConfig().private).toBeTruthy();
});
