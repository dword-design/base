import pathLib from 'node:path';

import { expect } from '@playwright/test';
import fs from 'fs-extra';

import { test } from '@/fixtures/tmpdir';

import self from '.';

test('.baserc.json', async ({ tmpdir: cwd }) => {
  await fs.outputFile(
    pathLib.join(cwd, '.baserc.json'),
    JSON.stringify({ foo: 'bar' }),
  );

  expect(await self({ cwd })).toEqual({ foo: 'bar' });
});

test('none', async ({ tmpdir: cwd }) => expect(await self({ cwd })).toBeNull());

test('package.json', async ({ tmpdir: cwd }) => {
  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ baseConfig: { foo: 'bar' } }),
  );

  expect(await self({ cwd })).toEqual({ foo: 'bar' });
});
