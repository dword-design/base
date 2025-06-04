import * as pathLib from 'node:path';

import {
  identity,
  mapValues,
  stubTrue,
} from 'lodash-es';
import dedent from 'dedent';
import { expect, test } from '@playwright/test';
import packageName from 'depcheck-package-name';
import fs from 'fs-extra';
import { globby } from 'globby';
import outputFiles from 'output-files';
import unifyMochaOutput from 'unify-mocha-output';
import stripAnsi from 'strip-ansi';
import { execaCommand } from 'execa';

import { Base } from '@/src/index.js';

const javascript = dedent;

test('assertion', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    src: {
      'index.js': 'export default 1',
      'index.spec.js': javascript`
        export default {
          valid: () => expect(1).toEqual(2),
        }
      `,
    },
  });
  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow(
    'Error: expect(received).toEqual(expected)',
  );
});

test('bin: object', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({
    bin: { foo: './dist/cli.js' },
  }));
  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();
});

test('bin: object: outside dist', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({
    bin: { foo: './src/cli.js' },
  }));
  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/bin/foo must match pattern "^\\.\\/dist\\/"',
  );
});

test('bin: string', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({ bin: './dist/cli.js' }));
  const base = await new Base(null, { cwd });
  await base.prepare();
  await base.test();
});

test('bin: string: outside dist', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({ bin: './src/cli.js' }));
  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/bin must match pattern "^\\.\\/dist\\/"',
  );
});

test('config file errors', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({ name: '_foo' }));
  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow('package.json invalid');
});

test('empty', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();
});

test('global setup', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'global-test-hooks.js':
      'export const mochaGlobalSetup = () => console.log(1)',
    src: {
      'index1.spec.js': 'export default { valid: () => {} }',
      'index2.spec.js': 'export default { valid: () => {} }',
    },
  });
  const base = new Base(null, { cwd });
  await base.prepare();
  let { stdout } = await base.test();
  stdout = unifyMochaOutput(stdout);
  expect(stdout).toMatchSnapshot();
});

test('grep', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    src: {
      'index.js': 'export default 1',
      'index.spec.js': javascript`
        export default {
          bar: () => console.log('run bar'),
          foo: () => console.log('run foo'),
        }
      `,
    },
  });
  const base = new Base(null, { cwd });
  await base.prepare();
  const { stdout } = await base.test({ grep: 'foo' });
  expect(stdout).not.toMatch('run bar');
  expect(stdout).toMatch('run foo');
});

test('image snapshot', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'index.spec.js': javascript`
      import sharp from '${packageName`sharp`}'

      export default {
        works: async function () {
          const img = await sharp({
            create: {
              background: { b: 0, g: 255, r: 0 },
              channels: 3,
              height: 48,
              width: 48,
            },
          })
            .png()
            .toBuffer()
          expect(img).toMatchImageSnapshot(this)
        },
      }
    `,
    'package.json': JSON.stringify({
      devDependencies: { sharp: '^1.0.0' },
    }),
  });
  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();

  expect(
    await globby('*', { cwd: pathLib.join(cwd, '__image_snapshots__') }),
  ).toEqual(['index-spec-js-index-works-1-snap.png']);
});

test('invalid name', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({ name: '_foo' }));
  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/name must match pattern "^(@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]*$"',
  );
});

test('json errors', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'src', 'test.json'), 'foo bar');
  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow(
    "Parsing error: Unexpected identifier 'foo'",
  );
});

test('linting errors', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'src', 'index.js'), "var foo = 'bar'");
  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test({ stderr: 'pipe' })).rejects.toThrow(
    "error  'foo' is assigned a value but never used  no-unused-vars",
  );
});

test('minimal', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'src', 'index.js'), 'export default 1');
  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();
});

test('multiple patterns', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    src: {
      'index1.spec.js': 'export default { valid: () => {} }',
      'index2.spec.js': 'export default { valid: () => {} }',
    },
  });
  const base = new Base(null, { cwd });
  await base.prepare();
  let { stdout } = await base.test({
    patterns: ['src/index1.spec.js', 'src/index2.spec.js'],
  });

  stdout = unifyMochaOutput(stdout);
  expect(stdout).toMatchSnapshot();
});

test('multiple snapshots', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'index.spec.js': javascript`
      export default {
        works: function () {
          expect('foo').toMatchSnapshot(this)
          expect('bar').toMatchSnapshot(this)
        },
      }
    `,
  });
  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();

  expect(
    await globby('*', { cwd: pathLib.join(cwd, '__snapshots__') }),
  ).toEqual(['index.spec.js.snap']);

  expect(
    await fs.readFile(
      pathLib.join(cwd, '__snapshots__', 'index.spec.js.snap'),
      'utf8',
    ),
  ).toEqual(javascript`
    // Jest Snapshot v1, https://goo.gl/fbAQLP

    exports[\`index works 1\`] = \`"foo"\`;

    exports[\`index works 2\`] = \`"bar"\`;

  `);
});

test('node_modules postfix casing error', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'node_modules-foo.js': 'export default 1',
    'src/index.spec.js': "import '@/node_modules-foo.js'",
  });
  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow('Filename is not in kebab case.');
});

test('package overrides', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({ pnpm: { overrides: { bulma: '^1' } } }));
  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();
});

test('pattern', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'README.md': '',
    'package.json': JSON.stringify({
      dependencies: { foo: '^1.0.0' },
    }),
    src: {
      'index.js': 'export default 1',
      'index1.spec.js':
        "export default { valid: () => console.log('run index1') }",
      'index2.spec.js':
        "export default { valid: () => console.log('run index2') }",
    },
  });
  const base = new Base(null, { cwd });
  await base.prepare();
  const { stdout } = await base.test({ patterns: ['src/index2.spec.js'] });
  expect(stdout).not.toMatch('run index1');
  expect(stdout).toMatch('run index2');
});

test('playwright: error', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: 'foo',
    }),
    'src/index.spec.js': javascript`
      import { test, expect } from '${packageName`@playwright/test`}';

      test('valid', () => expect(1).toEqual(2));\n
    `,
  });
  const base = new Base({ testRunner: 'playwright' }, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow();

  expect(
    await fs.exists(
      pathLib.join(cwd, 'test-results', 'src-index-valid', 'trace.zip'),
    ),
  ).toBe(true);
});

test('playwright: grep', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: 'foo',
    }),
    src: {
      'index.spec.js': javascript`
        import { test } from '${packageName`@playwright/test`}';

        test('test1', () => {});\n
        test('test2', () => {});\n
      `,
    },
  });
  const base = new Base({ testRunner: 'playwright' }, { cwd });
  await base.prepare();
  const { stdout } = await base.test({ grep: 'test1' });

  expect(stdout).toMatch(
    `${pathLib.join('src', 'index.spec.js')}:2:1 › test1`,
  );

  expect(stdout).toMatch('1 passed');
});

test('playwright: pattern', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: 'foo',
    }),
    src: {
      'index.spec.js': javascript`
        import { test } from '${packageName`@playwright/test`}';

        test('valid', () => {});\n
      `,
      'index2.spec.js': javascript`
        import { test } from '${packageName`@playwright/test`}';

        test('valid', () => {});\n
      `,
    },
  });
  const base = new Base({ testRunner: 'playwright' }, { cwd });
  await base.prepare();
  const { stdout } = await base.test({ patterns: ['src/index.spec.js'] });

  expect(stdout).toMatch(
    `${pathLib.join('src', 'index.spec.js')}:2:1 › valid`,
  );

  expect(stdout).toMatch('1 passed');
});

test('playwright: update snapshots', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: 'foo',
    }),
    'playwright.config.js': dedent`
      import { defineConfig } from '@playwright/test';

      export default defineConfig({
        expect: {
          toMatchSnapshot: {
            pathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
          },
        },
      });
    `,
    '.baserc.json': JSON.stringify({ testRunner: 'playwright' }),
    src: {
      'index.spec.js': javascript`
        import { test, expect } from '${packageName`@playwright/test`}';

        test('valid', () => expect('foo').toMatchSnapshot());\n
      `,
    },
  });
  const base = new Base(null, { cwd });
  await base.prepare();
  await execaCommand('base test --update-snapshots');

  expect(
    await fs.readFile(
      pathLib.join(cwd, 'src', 'index.spec.js-snapshots', 'valid-1.txt'),
      'utf8',
    ),
  ).toEqual('foo');
});

test('playwright: valid', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: 'foo',
    }),
    src: {
      'index.js': 'export default 1\n',
      'index.spec.js': javascript`
        import { test, expect } from '${packageName`@playwright/test`}';

        import foo from './index.js'

        test('valid', () => expect(foo).toEqual(1));\n
      `,
    },
  });
  const base = new Base({ testRunner: 'playwright' }, { cwd });
  await base.prepare();
  let { stdout } = await base.test();
  stdout = stripAnsi(stdout);
  expect(stdout).toMatch(
    `1 ${pathLib.join('src', 'index.spec.js')}:3:1 › valid`,
  );

  expect(
    await fs.exists(
      pathLib.join(cwd, 'test-results', 'src-index-valid', 'trace.zip'),
    ),
  ).toBe(false);
});

test('snapshot', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'index.spec.js'), javascript`
    export default {
      works: function () {
        expect('foo').toMatchSnapshot(this)
      },
    }
  `);
  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();

  expect(
    await globby('*', { cwd: pathLib.join(cwd, '__snapshots__') }),
  ).toEqual(['index.spec.js.snap']);
});

test('test in project root', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'index.spec.js': javascript`
      export default {
        valid: () => console.log('run test')
      }

    `,
    'node_modules/base-config-foo/index.js': javascript`
      module.exports = {
        allowedMatches: [
          'index.spec.js',
        ],
      }
    `,
    'package.json': JSON.stringify({ baseConfig: 'foo' }),
  });
  const base = new Base(null, { cwd });
  await base.prepare();
  const { stdout } = await base.test();
  expect(stdout).toMatch('run test');
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
  await expect(base.test()).rejects.toThrow(dedent`
    Unused dependencies
    * change-case
    * foo
  `);
});

test('update snapshot', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    '__snapshots__/index.spec.js.snap': javascript`
      exports[\`index works 1\`] = \`"foo"\`;
  
    `,
    'index.spec.js': dedent`
      export default {
        works: function () {
          expect('bar').toMatchSnapshot(this)
        },
      }
    `,
  });
  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test({ updateSnapshots: true });
});

test('usesdocker macOS', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'cli.js': dedent`
      import { Base } from '../../src/index.js';

      Object.defineProperty(process, 'platform', { value: 'darwin' });

      const base = new Base();
      await base.test();
    `,
    'src/index.usesdocker.spec.js': "throw new Error('error')",
  });
  await execaCommand('node cli.js', { env: { CI: true }, cwd });
});

test('usesdocker outside ci', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'cli.js': dedent`
      import { expect } from '@playwright/test';

      import { Base } from '../../src/index.js';

      delete process.env.CI;
      delete process.env.GITHUB_ACTIONS;
      Object.defineProperty(process, 'platform', { value: 'darwin' });

      const base = new Base();
      await expect(base.test({ stderr: 'pipe' })).rejects.toThrow(
        'foobarbaz',
      );
    `,
    'src/index.usesdocker.spec.js': "throw new Error('foobarbaz')",
  });
  await execaCommand('node cli.js', { cwd });
});

test('usesdocker playwright', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'cli.js': dedent`
      import { expect } from '@playwright/test';

      import { Base } from '../../src/index.js';

      Object.defineProperty(process, 'platform', { value: 'win32' });

      const base = new Base({ testRunner: 'playwright' });
      await base.test();
    `,
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
    }),
    'src/index.spec.js': dedent`
      import { test, expect } from '@playwright/test';

      test('valid @usesdocker', () => expect(1).toEqual(2));
    `,
  });
  await execaCommand('node cli.js', { env: { CI: true }, cwd });
});

test('usesdocker windows', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'cli.js': dedent`
      import { expect } from '@playwright/test';

      import { Base } from '../../src/index.js';

      Object.defineProperty(process, 'platform', { value: 'win32' });

      const base = new Base();
      await base.test();
    `,
    'src/index.usesdocker.spec.js': "throw new Error('error')",
  });
  await execaCommand('node cli.js', { env: { CI: true }, cwd });
});

test('valid', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, {
    'package.json': JSON.stringify({ name: 'foo' }),
    src: {
      'index.js': 'export default 1\n',
      'index.spec.js': javascript`
        import foo from './index.js';

        export default {
          valid: () => {
            expect(process.env.NODE_ENV).toEqual('test')
            expect(foo).toEqual(1)
            console.log('run test')
          },
        };\n
      `,
    },
  });
  const base = new Base(null, { cwd });
  const { stdout } = await base.test();
  expect(stdout).toMatch('run test');

  const paths = await globby('*', { cwd, dot: true, onlyFiles: false });
  expect(
    Object.fromEntries(paths.map(path => [path, true])),
  ).toEqual({
    '.baserc.json': true,
    '.commitlintrc.json': true,
    '.cz.json': true,
    '.devcontainer': true,
    '.editorconfig': true,
    '.gitattributes': true,
    '.github': true,
    '.gitignore': true,
    '.gitpod.Dockerfile': true,
    '.gitpod.yml': true,
    '.npmrc': true,
    '.releaserc.json': true,
    '.renovaterc.json': true,
    '.vscode': true,
    'LICENSE.md': true,
    'README.md': true,
    'babel.config.json': true,
    coverage: true,
    'eslint.config.js': true,
    'package.json': true,
    src: true,
    'tsconfig.json': true,
  });
});

test('wrong dependencies type', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({ dependencies: 1 }));
  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/dependencies must be object',
  );
});

test('wrong description type', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({ description: 1 }));
  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/description must be string',
  );
});

test('wrong dev dependencies type', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({ devDependencies: 1 }));
  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/devDependencies must be object',
  );
});

test('wrong keywords type', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({ keywords: 1 }));
  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/keywords must be array',
  );
});
