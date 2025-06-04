import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import endent from 'endent';
import { execa, execaCommand } from 'execa';
import fs from 'fs-extra';
import { globby } from 'globby';
import { identity, sortBy } from 'lodash-es';
import outputFiles from 'output-files';

import { Base } from '@/src';

test('additional allowed match', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'foo.txt'), '');
  const base = new Base({ allowedMatches: ['foo.txt'] }, { cwd });
  await base.prepare();
  expect(await globby('*', { cwd, dot: true })).toContain('foo.txt');
});

test('commit valid', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });
  await execaCommand('git config user.email "foo@bar.de"', { cwd });
  await execaCommand('git config user.name "foo"', { cwd });
  const base = new Base(null, { cwd });
  await base.prepare();
  await execa('git', ['commit', '--allow-empty', '-m', 'fix: foo'], { cwd });
});

test('commit with linting errors', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });
  await execaCommand('git config user.email "foo@bar.de"', { cwd });
  await execaCommand('git config user.name "foo"', { cwd });
  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(
    execaCommand('git commit --allow-empty -m foo', { cwd }),
  ).rejects.toThrow('subject may not be empty');
});

test('custom prepare', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  const base = new Base(
    {
      async prepare() {
        await fs.outputFile(pathLib.join(this.cwd, 'foo.txt'), 'bar');
      },
    },
    { cwd },
  );

  await base.prepare();

  expect(await fs.readFile(pathLib.join(cwd, 'foo.txt'), 'utf8')).toEqual(
    'bar',
  );
});

test('valid', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });

  await execaCommand(
    'git remote add origin git@github.com:dword-design/bar.git',
    { cwd },
  );

  await outputFiles(cwd, {
    '.env.json': '',
    '.env.schema.json': endent`
      {
        "foo": "bar"
      }
    `,
    '.test.env.json': '',
    'CHANGELOG.md': '',
    'package.json': JSON.stringify({
      author: 'dword-design',
      license: 'MIT',
      name: 'foo',
    }),
    'pnpm-lock.yaml': '',
    'src/index.ts': 'export default 1',
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  const paths = await globby('*', { cwd, dot: true, onlyFiles: false });

  expect(
    JSON.stringify(
      Object.fromEntries(sortBy(paths, identity).map(path => [path, true])),
      undefined,
      2,
    ),
  ).toMatchSnapshot();

  expect(
    await fs.readFile(pathLib.join(cwd, 'README.md'), 'utf8'),
  ).toMatchSnapshot();

  expect(await fs.readFile(pathLib.join(cwd, 'LICENSE.md'), 'utf8')).toMatch(
    'MIT License',
  );
});
