import pathLib from 'node:path';

import {
  endent,
  endent as javascript,
  identity,
  keyBy,
  mapValues,
  stubTrue,
} from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import packageName from 'depcheck-package-name';
import fs from 'fs-extra';
import { globby } from 'globby';
import outputFiles from 'output-files';
import unifyMochaOutput from 'unify-mocha-output';

import { Base } from '@/src/index.js';

export default tester(
  {
    assertion: {
      files: {
        src: {
          'index.js': 'export default 1',
          'index.spec.js': javascript`
            export default {
              valid: () => expect(1).toEqual(2),
            }
          `,
        },
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'Error: expect(received).toEqual(expected)',
        );
      },
    },
    'bin: object': {
      files: {
        'package.json': JSON.stringify({
          bin: { foo: './dist/cli.js' },
          type: 'module',
        }),
      },
    },
    'bin: object: outside dist': {
      files: {
        'package.json': JSON.stringify({
          bin: { foo: './src/cli.js' },
          type: 'module',
        }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'package.json invalid\ndata/bin/foo must match pattern "^\\.\\/dist\\/"',
        );
      },
    },
    'bin: string': {
      files: {
        'package.json': JSON.stringify({
          bin: './dist/cli.js',
          type: 'module',
        }),
      },
    },
    'bin: string: outside dist': {
      files: {
        'package.json': JSON.stringify({ bin: './src/cli.js', type: 'module' }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'package.json invalid\ndata/bin must match pattern "^\\.\\/dist\\/"',
        );
      },
    },
    'config file errors': {
      files: {
        'package.json': JSON.stringify({ name: '_foo', type: 'module' }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow('package.json invalid');
      },
    },
    empty: {},
    'global setup': {
      files: {
        'global-test-hooks.js':
          'export const mochaGlobalSetup = () => console.log(1 |> x => x * 2)',
        src: {
          'index1.spec.js': 'export default { valid: () => {} }',
          'index2.spec.js': 'export default { valid: () => {} }',
        },
      },
      async test() {
        let { stdout: output } = await this.base.test();
        output = unifyMochaOutput(output);
        expect(output).toMatchSnapshot(this);
      },
    },
    grep: {
      files: {
        src: {
          'index.js': 'export default 1',
          'index.spec.js': javascript`
            export default {
              bar: () => console.log('run bar'),
              foo: () => console.log('run foo'),
            }
          `,
        },
      },
      async test() {
        const { stdout: output } = await this.base.test({ grep: 'foo' });
        expect(output).not.toMatch('run bar');
        expect(output).toMatch('run foo');
      },
    },
    'image snapshot': {
      files: {
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
          type: 'module',
        }),
      },
      async test() {
        await this.base.test();

        expect(await globby('*', { cwd: '__image_snapshots__' })).toEqual([
          'index-spec-js-index-works-1-snap.png',
        ]);
      },
    },
    'invalid name': {
      files: {
        'package.json': JSON.stringify({ name: '_foo', type: 'module' }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'package.json invalid\ndata/name must match pattern "^(@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]*$"',
        );
      },
    },
    'json errors': {
      files: { 'src/test.json': 'foo bar' },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          "Parsing error: Unexpected identifier 'foo'",
        );
      },
    },
    'linting errors': {
      files: { 'src/index.js': "var foo = 'bar'" },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          "error  'foo' is assigned a value but never used  no-unused-vars",
        );
      },
    },
    minimal: { files: { 'src/index.js': 'export default 1' } },
    'multiple patterns': {
      files: {
        src: {
          'index1.spec.js': 'export default { valid: () => {} }',
          'index2.spec.js': 'export default { valid: () => {} }',
        },
      },
      async test() {
        let { stdout: output } = await this.base.test({
          patterns: ['src/index1.spec.js', 'src/index2.spec.js'],
        });

        output = unifyMochaOutput(output);
        expect(output).toMatchSnapshot(this);
      },
    },
    'multiple snapshots': {
      files: {
        'index.spec.js': javascript`
          export default {
            works: function () {
              expect('foo').toMatchSnapshot(this)
              expect('bar').toMatchSnapshot(this)
            },
          }
        `,
      },
      async test() {
        await this.base.test();

        expect(await globby('*', { cwd: '__snapshots__' })).toEqual([
          'index.spec.js.snap',
        ]);

        expect(
          await fs.readFile(
            pathLib.join('__snapshots__', 'index.spec.js.snap'),
            'utf8',
          ),
        ).toEqual(javascript`
          // Jest Snapshot v1, https://goo.gl/fbAQLP

          exports[\`index works 1\`] = \`"foo"\`;

          exports[\`index works 2\`] = \`"bar"\`;

        `);
      },
    },
    'node_modules not transpiled': {
      files: {
        'node_modules/foo/index.js': 'export default 1 |> x => x * 2',
        'package.json': JSON.stringify({
          devDependencies: { foo: '^1.0.0' },
          type: 'module',
        }),
        'src/index.spec.js': "import 'foo'",
      },
      test() {
        return expect(this.base.test({ stderr: 'pipe' })).rejects.toThrow(
          /Unexpected token '>'/,
        );
      },
    },
    'node_modules postfix casing error': {
      files: {
        'node_modules-foo.js': 'export default 1',
        'src/index.spec.js': "import '@/node_modules-foo.js'",
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'Filename is not in kebab case.',
        );
      },
    },
    'package overrides': {
      files: {
        'package.json': JSON.stringify({
          pnpm: { overrides: { bulma: '^1' } },
        }),
      },
    },
    pattern: {
      files: {
        'README.md': '',
        'package.json': JSON.stringify({
          dependencies: { foo: '^1.0.0' },
          type: 'module',
        }),
        src: {
          'index.js': 'export default 1',
          'index1.spec.js':
            "export default { valid: () => console.log('run index1') }",
          'index2.spec.js':
            "export default { valid: () => console.log('run index2') }",
        },
      },
      async test() {
        const { stdout: output } = await this.base.test({
          patterns: ['src/index2.spec.js'],
        });

        expect(output).not.toMatch('run index1');
        expect(output).toMatch('run index2');
      },
    },
    'pipeline operator and esm': {
      files: {
        'package.json': JSON.stringify({
          devDependencies: { execa: '^1' },
          type: 'module',
        }),
        src: {
          'index.spec.js': javascript`
            import { execa } from 'execa'
            import pathLib from 'path'

            export default {
              valid: () => execa(pathLib.join('src', 'subprocess.js'), { stdio: 'inherit' }),
            }
          `,
          'subprocess.js': javascript`
            #!/usr/bin/env node

            console.log(1 |> x => x * 2)
          `,
        },
      },
      async test() {
        await fs.chmod(pathLib.join('src', 'subprocess.js'), '755');
        await this.base.test();
      },
    },
    'playwright: babel': {
      config: { testRunner: 'playwright' },
      files: {
        'package.json': JSON.stringify({
          devDependencies: { '@playwright/test': '*' },
          name: 'foo',
          type: 'module',
        }),
        src: {
          'index.js': 'export default 1 |> x => x * 2;\n',
          'index.spec.js': javascript`
            import { test, expect } from '${packageName`@playwright/test`}';

            import foo from './index.js';

            test('valid', () => expect(foo).toEqual(2));\n
          `,
        },
      },
      async test() {
        await this.base.test();
      },
    },
    'playwright: error': {
      config: { testRunner: 'playwright' },
      files: {
        'package.json': JSON.stringify({
          devDependencies: { '@playwright/test': '*' },
          name: 'foo',
          type: 'module',
        }),
        'src/index.spec.js': javascript`
          import { test, expect } from '${packageName`@playwright/test`}';

          test('valid', () => expect(1).toEqual(2));\n
        `,
      },
      async test() {
        await expect(this.base.test()).rejects.toThrow();

        expect(await fs.exists('test-results/src-index-valid/trace.zip')).toBe(
          true,
        );
      },
    },
    'playwright: grep': {
      config: { testRunner: 'playwright' },
      files: {
        'package.json': JSON.stringify({
          devDependencies: { '@playwright/test': '*' },
          name: 'foo',
          type: 'module',
        }),
        src: {
          'index.spec.js': javascript`
            import { test } from '${packageName`@playwright/test`}';

            test('test1', () => {});\n
            test('test2', () => {});\n
          `,
        },
      },
      async test() {
        const { stdout: output } = await this.base.test({ grep: 'test1' });

        expect(output).toMatch(
          `${pathLib.join('src', 'index.spec.js')}:2:1 › test1`,
        );

        expect(output).toMatch('1 passed');
      },
    },
    'playwright: pattern': {
      config: { testRunner: 'playwright' },
      files: {
        'package.json': JSON.stringify({
          devDependencies: { '@playwright/test': '*' },
          name: 'foo',
          type: 'module',
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
      },
      async test() {
        const { stdout: output } = await this.base.test({
          patterns: ['src/index.spec.js'],
        });

        expect(output).toMatch(
          `${pathLib.join('src', 'index.spec.js')}:2:1 › valid`,
        );

        expect(output).toMatch('1 passed');
      },
    },
    'playwright: update snapshots': {
      config: { testRunner: 'playwright' },
      files: {
        'package.json': JSON.stringify({
          devDependencies: { '@playwright/test': '*' },
          name: 'foo',
          type: 'module',
        }),
        'playwright.config.js': endent`
          import { defineConfig } from '@playwright/test';

          export default defineConfig({
            expect: {
              toMatchSnapshot: {
                pathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
              },
            },
          });
        `,
        src: {
          'index.spec.js': javascript`
            import { test, expect } from '${packageName`@playwright/test`}';

            test('valid', () => expect('foo').toMatchSnapshot());\n
          `,
        },
      },
      async test() {
        await this.base.test({ updateSnapshots: true });

        expect(
          await fs.readFile('src/index.spec.js-snapshots/valid-1.txt', 'utf8'),
        ).toEqual('foo');
      },
    },
    'playwright: valid': {
      config: { testRunner: 'playwright' },
      files: {
        'package.json': JSON.stringify({
          devDependencies: { '@playwright/test': '*' },
          name: 'foo',
          type: 'module',
        }),
        src: {
          'index.js': 'export default 1\n',
          'index.spec.js': javascript`
            import { test, expect } from '${packageName`@playwright/test`}';

            import foo from './index.js'

            test('valid', () => expect(foo).toEqual(1));\n
          `,
        },
      },
      async test() {
        const { stdout: output } = await this.base.test();

        expect(output).toMatch(
          `1 ${pathLib.join('src', 'index.spec.js')}:3:1 › valid`,
        );

        expect(await fs.exists('test-results/src-index-valid/trace.zip')).toBe(
          false,
        );
      },
    },
    snapshot: {
      files: {
        'index.spec.js': javascript`
          export default {
            works: function () {
              expect('foo').toMatchSnapshot(this)
            },
          }
        `,
      },
      async test() {
        await this.base.test();

        expect(await globby('*', { cwd: '__snapshots__' })).toEqual([
          'index.spec.js.snap',
        ]);
      },
    },
    'test in project root': {
      files: {
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
        'package.json': JSON.stringify({ baseConfig: 'foo', type: 'module' }),
      },
      async test() {
        const { stdout: output } = await this.base.test();
        expect(output).toMatch('run test');
      },
    },
    'unused dependencies': {
      files: {
        'package.json': JSON.stringify({
          dependencies: { 'change-case': '^1.0.0', foo: '^1.0.0' },
          type: 'module',
        }),
        'src/index.js': 'export default 1',
      },
      async test() {
        await expect(this.base.test()).rejects.toThrow(endent`
          Unused dependencies
          * change-case
          * foo
        `);
      },
    },
    'update snapshot': {
      files: {
        '__snapshots__/index.spec.js.snap': javascript`
          exports[\`index works 1\`] = \`"foo"\`;
      
        `,
        'index.spec.js': endent`
          export default {
            works: function () {
              expect('bar').toMatchSnapshot(this)
            },
          }
        `,
      },
      test() {
        return this.base.test({ updateSnapshots: true });
      },
    },
    'usesdocker macOS': {
      files: { 'src/index.usesdocker.spec.js': "throw new Error('error')" },
      async test() {
        const previousPlatform = process.platform;
        const previousEnv = process.env;
        process.env.CI = true;
        Object.defineProperty(process, 'platform', { value: 'darwin' });

        try {
          await this.base.test();
        } finally {
          Object.defineProperty(process, 'platform', {
            value: previousPlatform,
          });

          process.env = previousEnv;
        }
      },
    },
    'usesdocker outside ci': {
      files: { 'src/index.usesdocker.spec.js': "throw new Error('foobarbaz')" },
      async test() {
        const previousPlatform = process.platform;
        const previousEnv = process.env;
        delete process.env.CI;
        delete process.env.GITHUB_ACTIONS;
        Object.defineProperty(process, 'platform', { value: 'darwin' });

        await expect(this.base.test({ stderr: 'pipe' })).rejects.toThrow(
          'foobarbaz',
        );

        Object.defineProperty(process, 'platform', { value: previousPlatform });
        process.env = previousEnv;
      },
    },
    'usesdocker playwright': {
      config: { testRunner: 'playwright' },
      files: {
        'package.json': JSON.stringify({
          devDependencies: { '@playwright/test': '*' },
        }),
        'src/index.spec.js': endent`
          import { test, expect } from '@playwright/test';

          test('valid @usesdocker', () => expect(1).toEqual(2));
        `,
      },
      async test() {
        const previousPlatform = process.platform;
        const previousEnv = process.env;
        process.env.CI = true;
        Object.defineProperty(process, 'platform', { value: 'win32' });

        try {
          await this.base.test();
        } finally {
          Object.defineProperty(process, 'platform', {
            value: previousPlatform,
          });

          process.env = previousEnv;
        }
      },
    },
    'usesdocker windows': {
      files: { 'src/index.usesdocker.spec.js': "throw new Error('error')" },
      async test() {
        const previousPlatform = process.platform;
        const previousEnv = process.env;
        process.env.CI = true;
        Object.defineProperty(process, 'platform', { value: 'win32' });

        try {
          await this.base.test();
        } finally {
          Object.defineProperty(process, 'platform', {
            value: previousPlatform,
          });

          process.env = previousEnv;
        }
      },
    },
    valid: {
      files: {
        'package.json': JSON.stringify({ name: 'foo', type: 'module' }),
        src: {
          'index.js': javascript`
            export default 1

          `,
          'index.spec.js': javascript`
            import foo from './index.js'

            export default {
              valid: () => {
                expect(process.env.NODE_ENV).toEqual('test')
                expect(foo).toEqual(1)
                console.log('run test')
              },
            }

          `,
        },
      },
      async test() {
        const { stdout: output } = await this.base.test();
        expect(output).toMatch('run test');

        expect(
          globby('*', { dot: true, onlyFiles: false })
            |> await
            |> keyBy(identity)
            |> mapValues(stubTrue),
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
        });
      },
    },
    'wrong dependencies type': {
      files: {
        'package.json': JSON.stringify({ dependencies: 1, type: 'module' }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'package.json invalid\ndata/dependencies must be object',
        );
      },
    },
    'wrong description type': {
      files: {
        'package.json': JSON.stringify({ description: 1, type: 'module' }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'package.json invalid\ndata/description must be string',
        );
      },
    },
    'wrong dev dependencies type': {
      files: {
        'package.json': JSON.stringify({ devDependencies: 1, type: 'module' }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'package.json invalid\ndata/devDependencies must be object',
        );
      },
    },
    'wrong keywords type': {
      files: {
        'package.json': JSON.stringify({ keywords: 1, type: 'module' }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'package.json invalid\ndata/keywords must be array',
        );
      },
    },
  },
  [
    testerPluginTmpDir(),
    {
      transform: test =>
        async function () {
          test = { config: {}, files: {}, ...test };

          await outputFiles({
            '.baserc.json': JSON.stringify(test.config),
            'package.json': JSON.stringify({ type: 'module' }),
            ...test.files,
          });

          this.base = new Base(test.config);
          test.test = test.test || (() => this.base.test());
          await this.base.prepare();
          await test.test.call(this);
        },
    },
  ],
);
