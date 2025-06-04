import { test, expect } from '@playwright/test';
import fs from 'fs-extra';
import * as pathLib from 'node:path';

import { Base } from '@/src/index.js';

test('works', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ name: '@dword-design/foo' }),
  );

  expect(new Base(null, { cwd }).getGitpodConfig()).toMatchSnapshot();
});
