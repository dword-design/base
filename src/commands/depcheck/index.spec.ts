import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import dedent from 'dedent';
import fs from 'fs-extra';
import outputFiles from 'output-files';

import { Base } from '@/src';

test('base config in dev dependencies', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'node_modules/base-config-foo/index.js': 'export default {}',
    'package.json': JSON.stringify({
      devDependencies: { 'base-config-foo': '^1.0.0' },
    }),
  });

  const base = new Base({ name: 'foo' }, { cwd });
  await base.prepare();
  await base.depcheck();
});

test('base config in prod dependencies', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'node_modules/base-config-foo/index.js': 'export default {}',
    'package.json': JSON.stringify({
      dependencies: { 'base-config-foo': '^1.0.0' },
    }),
  });

  const base = new Base({ name: 'foo' }, { cwd });
  await base.prepare();

  await expect(base.depcheck()).rejects.toThrow(dedent`
    Unused dependencies
    * base-config-foo
  `);
});

test('depcheck ignoreMatches', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ dependencies: { foo: '^1.0.0' } }),
  );

  const base = new Base(
    { depcheckConfig: { ignoreMatches: ['foo'] } },
    { cwd },
  );

  await base.prepare();
  await base.depcheck();
});

test('invalid file', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    foo: '',
    'package.json': JSON.stringify({
      dependencies: { 'change-case': '^1.0.0' },
    }),
  });

  const base = new Base(
    {
      depcheckConfig: {
        specials: [
          path => {
            if (path === pathLib.resolve(cwd, 'foo')) {
              throw new Error('foo');
            }
          },
        ],
      },
    },
    { cwd },
  );

  await base.prepare();

  await expect(base.depcheck()).rejects.toThrow(dedent`
    Unused dependencies
    * change-case

    Invalid files
    * ${pathLib.resolve(cwd, 'foo')}: Error: foo
  `);
});

test('prod dependency only in global-test-hooks.js', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'global-test-hooks.js': "import 'bar'",
    'node_modules/bar/index.js': 'export default 1',
    'package.json': JSON.stringify({
      dependencies: { bar: '^1.0.0' },
      type: 'module',
    }),
  });

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.depcheck()).rejects.toThrow(dedent`
    Unused dependencies
    * bar
  `);
});

test('prod dependency only in test', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'node_modules/bar/index.js': 'export default 1',
    'package.json': JSON.stringify({ dependencies: { bar: '^1.0.0' } }),
    'src/index.spec.js': "import 'bar'",
  });

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.depcheck()).rejects.toThrow(dedent`
    Unused dependencies
    * bar
  `);
});

test('unused dependencies', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      dependencies: { 'change-case': '^1.0.0', foo: '^1.0.0' },
    }),
    'src/index.js': 'export default 1',
  });

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.depcheck()).rejects.toThrow(dedent`
    Unused dependencies
    * change-case
    * foo
  `);
});
