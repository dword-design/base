import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import endent from 'endent';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import outputFiles from 'output-files';

import { Base } from '@/src';

test('custom linter', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  const base = new Base(
    {
      lint: () => {
        throw new Error('foobar');
      },
    },
    { cwd },
  );

  await base.prepare();
  await expect(base.lint()).rejects.toThrow('foobar');
});

test('fixable', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'src', 'index.ts'),
    "console.log('foo')",
  );

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.lint({ log: true });

  expect(
    await fs.readFile(pathLib.join(cwd, 'src', 'index.ts'), 'utf8'),
  ).toEqual("console.log('foo');\n");
});

test('lint eslint config', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ name: '@dword-design/eslint-config' }),
    'src/index.ts': endent`
      import { defineConfig } from 'eslint/config';

      export default defineConfig([]);
    `,
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.lint();
});

test('linting errors', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'src', 'index.ts'),
    "const foo = 'bar'",
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.lint()).rejects.toThrow(
    "'foo' is assigned a value but never used",
  );
});

test('package name != repository name', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ name: '@scope/bar' }),
  );

  await execaCommand('git init', { cwd });

  await execaCommand('git remote add origin https://github.com/xyz/foo.git', {
    cwd,
  });

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.lint()).rejects.toThrow(
    "Package name 'bar' has to be equal to repository name 'foo'",
  );
});

test('json error', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'src', 'test.json'), 'foo bar');
  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.lint()).rejects.toThrow(
    "Parsing error: Unexpected identifier 'foo'",
  );
});

test('node_modules postfix casing error', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'node_modules-foo.ts': 'export default 1',
    'src/index.spec.ts': "import '@/node_modules-foo.ts'",
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.lint()).rejects.toThrow('Filename is not in kebab case.');
});
