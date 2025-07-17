import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import endent from 'endent';
import fs from 'fs-extra';
import outputFiles from 'output-files';

import { Base } from '@/src';

test('unused dependencies', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      dependencies: { 'change-case': '^1.0.0', foo: '^1.0.0' },
    }),
    'src/index.ts': 'export default 1',
  });

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.verify()).rejects.toThrow(endent`
    Unused dependencies
    * change-case
    * foo
  `);
});

test('package.json error', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ name: '_foo' }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.verify()).rejects.toThrow('package.json invalid');
});
