import pathLib from 'node:path';

import { test } from '@playwright/test';
import fs from 'fs-extra';
import { expect } from 'playwright-expect-snapshot';

import { Base } from '@/src';

test('works', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ name: '@dword-design/foo' }),
  );

  expect(new Base(null, { cwd }).getGitpodConfig()).toMatchSnapshot();
});
