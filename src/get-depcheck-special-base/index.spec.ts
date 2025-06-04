import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import depcheck from 'depcheck';
import fs from 'fs-extra';

import self from '.';

test('no config', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  const packageConfig = {};

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify(packageConfig),
  );

  await depcheck(cwd, {
    package: packageConfig,
    specials: [self('base-config-foo')],
  });
});

test('valid', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  const packageConfig = { devDependencies: { 'base-config-foo': '^1.0.0' } };

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify(packageConfig),
  );

  const result = await depcheck(cwd, {
    package: { devDependencies: { 'base-config-foo': '^1.0.0' } },
    specials: [self('base-config-foo')],
  });

  expect(result.devDependencies).toEqual([]);
});
