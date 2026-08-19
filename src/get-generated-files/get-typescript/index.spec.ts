import pathLib from 'node:path';

import { test } from '@playwright/test';
import fs from 'fs-extra';

import { Base } from '@/src';
import prepare from '@/src/commands/prepare';
import typecheck from '@/src/commands/typecheck';

test('node_modules', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'node_modules', 'foo', 'index.ts'),
    'foo',
  );

  const base = new Base(null, { cwd });
  await prepare(base);
  await typecheck(base);
});

test('test-results', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'test-results', 'foo', 'index.ts'),
    'foo',
  );

  const base = new Base(null, { cwd });
  await prepare(base);
  await typecheck(base);
});
