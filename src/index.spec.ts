import pathLib from 'node:path';

import { identity, omit, sortBy } from 'lodash-es';
import { test, expect } from '@playwright/test';
import fs from 'fs-extra';
import outputFiles from 'output-files';
import dedent from 'dedent';

import { Base } from './index.js';

test('array merge', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(
    pathLib.join(cwd, 'node_modules', '@dword-design', 'base-config-foo', 'index.js'),
    "export default { allowedMatches: ['foo.txt'] }",
  );

  const base = new Base({
    allowedMatches: ['bar.txt'],
    name: '@dword-design/foo',
  }, { cwd });

  expect(base.config.allowedMatches).toEqual(['foo.txt', 'bar.txt']);
});

test('call multiple times', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(
    pathLib.join(cwd, 'node_modules', 'base-config-foo', 'index.js'),
    'export default {}',
  );

  const config = { name: 'foo' };
  let base = new Base(config, { cwd });
  base = new Base(config, { cwd });
  expect(base.config.name).toEqual('base-config-foo');
});

test('do not recurse up to find package.json', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ description: 'foo' }),
  );

  await fs.ensureDir(pathLib.join(cwd, 'sub'));

  expect(new Base(null, { cwd: pathLib.join(cwd, 'sub') }).packageConfig.description).toBeUndefined();
});

test('empty', ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  expect(new Base(null, { cwd }).config.name).toEqual('@dword-design/base-config-node');
});

test('empty parent',async  ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'node_modules/base-config-foo/index.js': 'export default {}',
    'package.json': JSON.stringify({ name: 'foo' }),
  });

  const base = new Base({ name: 'foo' }, { cwd });

  expect(
    omit(base.config, ['depcheckConfig', 'prepare', 'lint']),
  ).toMatchSnapshot();

  expect(typeof base.config.depcheckConfig).toEqual('object');
  expect(base.config.lint(1)).toEqual(1);
});

test('esm', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(
    pathLib.join(cwd, 'node_modules', 'base-config-foo', 'index.js'),
    'export default {}',
  );

  expect(new Base({ name: 'foo' }, { cwd }).config.name).toEqual('base-config-foo');
});

test('function', ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  const base = new Base(() => ({ readmeInstallString: 'foo' }), { cwd });
  expect(base.config.readmeInstallString).toEqual('foo');
});

test('function inherited', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(
    pathLib.join(cwd, 'node_modules', 'base-config-foo', 'index.js'),
    'export default config => ({ readmeInstallString: config.bar })',
  );

  const base = new Base({ bar: 'baz', name: 'foo' }, { cwd });
  expect(base.config.readmeInstallString).toEqual('baz');
});

test('global', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({ name: 'foo' }));
  const base = new Base({ global: true }, { cwd });

  expect(base.config.readmeInstallString).toEqual(dedent`
    ## Install
    \`\`\`bash
    # npm
    $ npm install -g foo
    # Yarn
    $ yarn global add foo
    \`\`\`
  `);
});

test('inherited', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(
    pathLib.join(cwd, 'node_modules', 'base-config-foo', 'index.js'),
    dedent`
      export default {
        commands: {
          prepublishOnly: x => x + 1,
          start: x => x + 3,
        },
        deployAssets: [{ label: 'Foo', path: 'foo.js' }],
        deployEnv: {
          FOO: '\${{ secrets.FOO }}',
        },
        deployPlugins: ['semantic-release-foo'],
        editorIgnore: ['foo'],
        gitignore: ['foo'],
        lint: x => x + 3,
        nodeVersion: 10,
        packageBaseConfig: {
          main: 'dist/index.scss',
        },
        preDeploySteps: [{ run: 'foo' }],
        prepare: x => x + 2,
        readmeInstallString: 'foo',
        supportedNodeVersions: [1, 2],
      }
    `,
  );

  const base = new Base({ name: 'foo' }, { cwd });

  expect(
    omit(base.config, ['commands', 'depcheckConfig', 'prepare', 'lint']),
  ).toMatchSnapshot();

  expect(sortBy(Object.keys(base.config.commands), identity)).toEqual([
    'prepublishOnly',
    'start',
  ]);

  expect(base.run('prepublishOnly', 1)).toEqual(2);
  expect(base.run('start', 1)).toEqual(4);
  expect(base.config.prepare(1)).toEqual(3);
  expect(base.config.lint(1)).toEqual(4);
  expect(typeof base.config.depcheckConfig).toEqual('object');
});

test('name scoped', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(
    pathLib.join(cwd, 'node_modules', '@dword-design', 'base-config-foo', 'index.js'),
    'export default {}',
  );

  expect(new Base({ name: '@dword-design/foo' }, { cwd }).config.name).toEqual(
    '@dword-design/base-config-foo',
  );
});

test('name shortcut', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(
    pathLib.join(cwd, 'node_modules', 'base-config-foo', 'index.js'),
    'export default {}',
  );

  expect(new Base({ name: 'foo' }, { cwd }).config.name).toEqual('base-config-foo');
});

test('run', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(
    pathLib.join(cwd, 'node_modules', 'base-config-foo', 'index.js'),
    'export default {}',
  );

  expect(
    new Base({
      commands: {
        foo() {
          return this.config.foo;
        },
      },
      foo: 'bar',
    }, { cwd }).run('foo'),
  ).toEqual('bar');
});
