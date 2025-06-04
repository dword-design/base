import pathLib from 'node:path';

import { expect, test as base } from '@playwright/test';
import dedent from 'dedent';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import outputFiles from 'output-files';
import parsePackagejsonName from 'parse-packagejson-name';
import { stringify as yamlStringify } from 'yaml';

import packageJson from '@/package.json' with { type: 'json' };
import { Base } from '@/src';

const { scope: projectScope, fullName: projectName } = parsePackagejsonName(
  packageJson.name,
);

const projectPrefix = `${projectScope.slice(1)}-${projectName}-`;

const test = base.extend({
  packageName: async ({}, use, testInfo) => {
    const packageName = `${projectPrefix}${pathLib.basename(testInfo.outputDir)}`;

    try {
      await use(packageName);
    } finally {
      await execaCommand(`docker volume rm ${packageName}`);
    }
  },
});

test('create folder @usesdocker', async ({ packageName }, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({
      name: packageName,
      scripts: { 'test:raw': 'mkdir dist && echo "foo bar" > dist/index.js' },
    }),
  );

  await new Base(null, { cwd }).testDocker();
  await fs.remove(pathLib.join(cwd, 'dist'));
});

test('create folder and error @usesdocker', async ({
  packageName,
}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({
      name: packageName,
      scripts: {
        'test:raw': 'mkdir dist && echo "foo bar" > dist/index.js && exit 1',
      },
    }),
  );

  await expect(new Base(null, { cwd }).testDocker()).rejects.toThrow();
  await fs.remove(pathLib.join(cwd, 'dist'));
});

test('env @usesdocker', async ({ packageName }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    '.env.schema.json': JSON.stringify({
      bar: { type: 'string' },
      foo: { type: 'string' },
    }),
    'cli.js': dedent`
      import { Base } from '../../src/index.js';

      new Base().testDocker();\n
    `,
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: packageName,
      scripts: { 'test:raw': 'node test.js' },
      type: 'module',
    }),
    'test.js': dedent`
      import { expect } from '@playwright/test';

      expect(process.env.TEST_FOO).toEqual('foo');
      expect(process.env.TEST_BAR).toBeUndefined();
    `,
  });

  await execaCommand('pnpm install', { cwd });
  await execaCommand('node cli.js', { cwd, env: { TEST_FOO: 'foo' } });
});

test('git @usesdocker', async ({ packageName }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      name: packageName,
      scripts: { 'test:raw': 'node test.js' },
      type: 'module',
    }),
    'test.js': dedent`
      import { spawn } from 'child_process'

      spawn('git', ['--help'])
    `,
  });

  await new Base(null, { cwd }).testDocker();
});

test('grep @usesdocker', async ({ packageName }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      name: packageName,
      scripts: { 'test:raw': 'node test.js' },
      type: 'module',
    }),
    'test.js': dedent`
      import fs from 'fs'

      fs.writeFileSync('grep.txt', process.argv.slice(2).toString());
    `,
  });

  await new Base(null, { cwd }).testDocker({ grep: 'foo bar baz' });

  expect(await fs.readFile(pathLib.join(cwd, 'grep.txt'), 'utf8')).toEqual(
    '-g,foo bar baz',
  );
});

test('is in docker @usesdocker', async ({ packageName }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      dependencies: { 'is-docker': '*' },
      name: packageName,
      scripts: { 'test:raw': 'node test.js' },
      type: 'module',
    }),
    'test.js': dedent`
      import isDocker from 'is-docker'

      if (!isDocker) {
        process.exit(1)
      }\n
    `,
  });

  await execaCommand('pnpm install', { cwd });
  const base = new Base(null, { cwd });
  await base.testDocker();
});

test('pattern @usesdocker', async ({ packageName }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      name: packageName,
      scripts: { 'test:raw': 'node test.js' },
      type: 'module',
    }),
    'test.js': dedent`
      import fs from 'fs'

      fs.writeFileSync('grep.txt', process.argv[2])
    `,
  });

  await new Base(null, { cwd }).testDocker({ patterns: ['foo bar baz'] });

  expect(await fs.readFile(pathLib.join(cwd, 'grep.txt'), 'utf8')).toEqual(
    'foo bar baz',
  );
});

test('puppeteer @usesdocker', async ({ packageName }, testInfo) => {
  test.setTimeout(60_000);
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      dependencies: { '@dword-design/puppeteer': '*' },
      name: packageName,
      scripts: { 'test:raw': 'node test.js' },
      type: 'module',
    }),
    'pnpm-workspace.yaml': yamlStringify({
      onlyBuiltDependencies: ['puppeteer'],
    }),
    'test.js': dedent`
      import puppeteer from '@dword-design/puppeteer';

      const browser = await puppeteer.launch();
      await browser.close();
    `,
  });

  await execaCommand('pnpm install', { cwd });
  await new Base(null, { cwd }).testDocker();
});

test('update snapshots @usesdocker', async ({ packageName }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      name: packageName,
      scripts: { 'test:raw': 'node test.js' },
    }),
    'test.js': dedent`
      if (process.argv[2] !== '--update-snapshots') {
        throw new Error('--update-snapshots is not set')
      }\n
    `,
  });

  await new Base(null, { cwd }).testDocker({ updateSnapshots: true });
});
