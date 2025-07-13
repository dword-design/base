import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import endent from 'endent';
import fs from 'fs-extra';
import { identity, omit, sortBy } from 'lodash-es';
import outputFiles from 'output-files';

import { Base } from '.';

test('array merge', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(
      cwd,
      'node_modules',
      '@dword-design',
      'base-config-foo',
      'index.js',
    ),
    "export default { allowedMatches: ['foo.txt'] };",
  );

  const base = new Base(
    { allowedMatches: ['bar.txt'], name: '@dword-design/foo' },
    { cwd },
  );

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

  expect(
    new Base(null, { cwd: pathLib.join(cwd, 'sub') }).packageConfig.description,
  ).toBeUndefined();
});

test('empty', ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  expect(new Base(null, { cwd }).config.name).toEqual(
    '@dword-design/base-config-node',
  );
});

test('string', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join('node_modules', 'base-config-foo', 'index.js'),
    'export default {}',
  );

  expect(new Base('foo', { cwd }).config.name).toEqual('base-config-foo');
});

test('empty parent', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'node_modules/base-config-foo/index.js': 'export default {}',
    'package.json': JSON.stringify({ name: 'foo' }),
  });

  const base = new Base({ name: 'foo' }, { cwd });

  expect(
    JSON.stringify(
      omit(base.config, ['depcheckConfig', 'prepare', 'lint']),
      undefined,
      2,
    ),
  ).toMatchSnapshot();

  expect(typeof base.config.depcheckConfig).toEqual('object');
  expect(typeof base.config.lint).toEqual('function');
});

test('esm', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'node_modules', 'base-config-foo', 'index.js'),
    'export default {}',
  );

  expect(new Base({ name: 'foo' }, { cwd }).config.name).toEqual(
    'base-config-foo',
  );
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
    'export default config => ({ readmeInstallString: config.name })',
  );

  const base = new Base({ name: 'foo' }, { cwd });
  expect(base.config.readmeInstallString).toEqual('base-config-foo');
});

test('global', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ name: 'foo' }),
  );

  const base = new Base({ global: true }, { cwd });

  expect(base.config.readmeInstallString).toEqual(endent`
    ## Install

    \`\`\`bash
    # npm
    $ npm install -g foo

    # Yarn
    $ yarn global add foo
    \`\`\`
  `);
});

test.only('inherited', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'node_modules', 'base-config-foo', 'index.js'),
    endent`
      import fs from 'fs-extra';
      import pathLib from 'node:path';

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
        lint: () => fs.outputFile(pathLib.join('${cwd}', 'lint.txt'), ''),
        nodeVersion: 10,
        packageBaseConfig: {
          main: 'dist/index.scss',
        },
        preDeploySteps: [{ run: 'foo' }],
        prepare: () => fs.outputFile(pathLib.join('${cwd}', 'prepare.txt'), ''),
        readmeInstallString: 'foo',
        supportedNodeVersions: [1, 2],
      }
    `,
  );

  const base = new Base({ name: 'foo' }, { cwd });

  expect(
    JSON.stringify(
      omit(base.config, ['commands', 'depcheckConfig', 'prepare', 'lint']),
      undefined,
      2,
    ),
  ).toMatchSnapshot();

  expect(sortBy(Object.keys(base.config.commands), identity)).toEqual([
    'prepublishOnly',
    'start',
  ]);

  expect(base.run('prepublishOnly', 1)).toEqual(2);
  expect(base.run('start', 1)).toEqual(4);
  await base.config.prepare();
  expect(await fs.exists(pathLib.join(cwd, 'prepare.txt'))).toBe(true);
  await base.config.lint();
  expect(await fs.exists(pathLib.join(cwd, 'lint.txt'))).toBe(true);
  expect(typeof base.config.depcheckConfig).toEqual('object');
});

test('name scoped', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(
      cwd,
      'node_modules',
      '@dword-design',
      'base-config-foo',
      'index.js',
    ),
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

  expect(new Base({ name: 'foo' }, { cwd }).config.name).toEqual(
    'base-config-foo',
  );
});

test('run', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ name: 'bar' }),
  );

  expect(
    new Base(
      {
        commands: {
          foo() {
            return this.packageConfig.name;
          },
        },
      },
      { cwd },
    ).run('foo'),
  ).toEqual('bar');
});
