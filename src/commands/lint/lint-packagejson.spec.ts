import { test, expect } from '@playwright/test';
import pathLib from 'node:path';
import fs from 'fs-extra';
import { execaCommand } from 'execa';
import { Base } from '@/src';

test('bin: object', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ bin: { foo: './dist/cli.js' } }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();
  base.lintPackagejson();
});

test('bin: object: outside dist', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ bin: { foo: './src/cli.js' } }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  expect(() => base.lintPackagejson()).toThrow(
    'package.json invalid\ndata/bin/foo must match pattern "^\\.\\/dist\\/"',
  );
});

test('bin: string', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ bin: './dist/cli.js' }),
  );

  const base = await new Base(null, { cwd });
  await base.prepare();
  base.lintPackagejson();
});

test('bin: string: outside dist', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ bin: './src/cli.js' }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  expect(() => base.lintPackagejson()).toThrow(
    'package.json invalid\ndata/bin must match pattern "^\\.\\/dist\\/"',
  );
});

test('invalid name', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ name: '_foo' }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  expect(() => base.lintPackagejson()).toThrow(
    'package.json invalid\ndata/name must match pattern "^(@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]*$"',
  );
});

test('package overrides', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ pnpm: { overrides: { bulma: '^1' } } }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();
  base.lintPackagejson();
});

test('wrong dependencies type', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ dependencies: 1 }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  expect(() => base.lintPackagejson()).toThrow(
    'package.json invalid\ndata/dependencies must be object',
  );
});

test('wrong description type', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ description: 1 }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  expect(() => base.lintPackagejson()).toThrow(
    'package.json invalid\ndata/description must be string',
  );
});

test('wrong dev dependencies type', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ devDependencies: 1 }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  expect(() => base.lintPackagejson()).toThrow(
    'package.json invalid\ndata/devDependencies must be object',
  );
});

test('wrong keywords type', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ keywords: 1 }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  expect(() => base.lintPackagejson()).toThrow(
    'package.json invalid\ndata/keywords must be array',
  );
});

test('package name with dot', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ name: 'foo.de' }),
  );

  await execaCommand('git init', { cwd });

  await execaCommand(
    'git remote add origin https://github.com/xyz/foo.de.git',
    { cwd },
  );

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.lintPackagejson();
});
