import { expect, test } from '@playwright/test';
import { execaCommand } from 'execa';
import { pick } from 'lodash-es';

import self from '.';

test('invalid github url', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });

  await execaCommand('git remote add origin https://github.com/foo.git', {
    cwd,
  });

  expect(() => self({ cwd })).toThrow(
    'Only GitHub repositories are supported.',
  );
});

test.only('invalid url', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });
  await execaCommand('git remote add origin foo', { cwd });

  expect(() => self({ cwd })).toThrow(
    'Only GitHub repositories are supported.',
  );
});

test('not github', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });

  await execaCommand('git remote add origin https://foo.com/foo/bar.git', {
    cwd,
  });

  expect(() => self({ cwd })).toThrow(
    'Only GitHub repositories are supported.',
  );
});

test('works', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });

  await execaCommand('git remote add origin https://github.com/foo/bar.git', {
    cwd,
  });

  expect(pick(self({ cwd }), ['user', 'project'])).toEqual({
    project: 'bar',
    user: 'foo',
  });
});
