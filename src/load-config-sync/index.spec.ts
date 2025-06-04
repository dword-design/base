import { expect } from '@playwright/test';
import fs from 'fs-extra';

import { test } from '@/fixtures/tmpdir';

import self from '.';

test('.baserc.json', async ({ tmpdir: cwd }) => {
  await fs.outputFile(
    pathLib.join(cwd, '.baserc.json'),
    JSON.stringify({ foo: 'bar' }),
  );

  expect(self({ cwd })).toEqual({ foo: 'bar' });
});

test('none', ({ tmpdir: cwd }) => expect(self({ cwd })).toBeNull());

test('package.json', async ({ tmpdir: cwd }) => {
  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ baseConfig: { foo: 'bar' } }),
  );

  expect(self({ cwd })).toEqual({ foo: 'bar' });
});
