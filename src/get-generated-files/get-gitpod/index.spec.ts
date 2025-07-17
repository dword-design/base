import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import fs from 'fs-extra';

import { Base } from '@/src';

test.only('works', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ name: '@dword-design/foo' }),
  );

  expect(
    JSON.stringify(new Base(null, { cwd }).getGitpodConfig(), undefined, 2),
  ).toMatchSnapshot();
});
