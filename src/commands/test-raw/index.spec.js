import {
  endent,
  identity,
  keyBy,
  mapValues,
  property,
  stubTrue,
} from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import packageName from 'depcheck-package-name'
import fs from 'fs-extra'
import { globby } from 'globby'
import outputFiles from 'output-files'
import P from 'path'
import unifyMochaOutput from 'unify-mocha-output'

import { Base } from '@/src/index.js'

export default tester(
  {
    '.nuxt': {
      files: {
        '.nuxt/index.js': 'export default 1',
        'src/index.spec.js': "import '@/.nuxt'",
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          /SyntaxError: Unexpected token '?export'?/
        )
      },
    },
    '.nuxt postfix': {
      files: {
        '.nuxt-foo/index.js': 'export default 1',
        'src/index.spec.js': "import '@/.nuxt-foo'",
      },
    },
    assertion: {
      files: {
        src: {
          'index.js': 'export default 1',
          'index.spec.js': endent`
        export default {
          valid: () => expect(1).toEqual(2),
        }
      `,
        },
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'Error: expect(received).toEqual(expected)'
        )
      },
    },
    'bin outside dist': {
      files: {
        'package.json': JSON.stringify({ bin: { foo: './src/cli.js' } }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'package.json invalid\ndata/bin/foo must match pattern "^\\.\\/dist\\/"'
        )
      },
    },
    'config file errors': {
      files: {
        'package.json': JSON.stringify({ name: '_foo' }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow('package.json invalid')
      },
    },
    'coverage file extension': {
      config: {
        coverageFileExtensions: ['.foo'],
      },
      files: {
        'index.foo': 'module.exports = {}',
        'index.spec.js': "import './index.foo'",
        'package.json': JSON.stringify({}),
      },
      async test() {
        return expect(
          this.base.test() |> await |> property('all') |> unifyMochaOutput
        ).toMatchSnapshot(this)
      },
    },
    empty: {},
    grep: {
      files: {
        src: {
          'index.js': 'export default 1',
          'index.spec.js': endent`
        export default {
          bar: () => console.log('run bar'),
          foo: () => console.log('run foo'),
        }
      `,
        },
      },
      async test() {
        const output =
          this.base.test({ grep: 'foo' }) |> await |> property('all')
        expect(output).not.toMatch('run bar')
        expect(output).toMatch('run foo')
      },
    },
    'image snapshot': {
      files: {
        'index.spec.js': endent`
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
          devDependencies: {
            sharp: '^1.0.0',
          },
        }),
      },
      async test() {
        await this.base.test()
        expect(await globby('*', { cwd: '__image_snapshots__' })).toEqual([
          'index-spec-js-index-works-1-snap.png',
        ])
      },
    },
    'invalid name': {
      files: {
        'package.json': JSON.stringify({ name: '_foo' }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'package.json invalid\ndata/name must match pattern "^(@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]*$"'
        )
      },
    },
    'json errors': {
      files: {
        'src/test.json': 'foo bar',
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'error  Unexpected token o'
        )
      },
    },
    'linting errors': {
      files: {
        'src/index.js': "var foo = 'bar'",
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          "error  'foo' is assigned a value but never used  no-unused-vars"
        )
      },
    },
    minimal: {
      files: {
        'src/index.js': 'export default 1',
      },
    },
    'multiple patterns': {
      files: {
        src: {
          'index1.spec.js': 'export default { valid: () => {} }',
          'index2.spec.js': 'export default { valid: () => {} }',
        },
      },
      async test() {
        const output =
          this.base.test({
            patterns: ['src/index1.spec.js', 'src/index2.spec.js'],
          })
          |> await
          |> property('all')
          |> unifyMochaOutput
        expect(output).toMatchSnapshot(this)
      },
    },
    'multiple snapshots': {
      files: {
        'index.spec.js': endent`
        export default {
          works: function () {
            expect('foo').toMatchSnapshot(this)
            expect('bar').toMatchSnapshot(this)
          },
        }
      `,
      },
      async test() {
        await this.base.test()
        expect(await globby('*', { cwd: '__snapshots__' })).toEqual([
          'index.spec.js.snap',
        ])
        expect(
          await fs.readFile(
            P.join('__snapshots__', 'index.spec.js.snap'),
            'utf8'
          )
        ).toEqual(endent`
        // Jest Snapshot v1, https://goo.gl/fbAQLP

        exports[\`index works 1\`] = \`"foo"\`;

        exports[\`index works 2\`] = \`"bar"\`;

      `)
      },
    },
    node_modules: {
      files: {
        'node_modules/foo/index.js': 'export default 1',
        'package.json': JSON.stringify({ devDependencies: { foo: '^1.0.0' } }),
        'src/index.spec.js': "import 'foo'",
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          /SyntaxError: Unexpected token '?export'?/
        )
      },
    },
    'node_modules postfix': {
      files: {
        'node_modules-foo/index.js': 'export default 1',
        'src/index.spec.js': "import '@/node_modules-foo'",
      },
    },
    'node_modules subfolder': {
      files: {
        'package.json': JSON.stringify({ devDependencies: { foo: '^1.0.0' } }),
        src: {
          'index.spec.js': "import 'foo'",
          'node_modules/foo/index.js': 'export default 1',
        },
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          /SyntaxError: Unexpected token '?export'?/
        )
      },
    },
    pattern: {
      files: {
        'README.md': '',
        'package.json': JSON.stringify({
          dependencies: {
            foo: '^1.0.0',
          },
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
        const output =
          this.base.test({ patterns: ['src/index2.spec.js'] })
          |> await
          |> property('all')
        expect(output).not.toMatch('run index1')
        expect(output).toMatch('run index2')
      },
    },
    'pipeline operator and esm': {
      files: {
        'package.json': JSON.stringify({
          devDependencies: {
            execa: '^1',
          },
          type: 'module',
        }),
        src: {
          'index.spec.js': endent`
        import { execa } from 'execa'
        import P from 'path'

        export default {
          valid: () => execa(P.join('src', 'subprocess.js'), { stdio: 'inherit' }),
        }
      `,
          'subprocess.js': endent`
          #!/usr/bin/env node

          console.log(1 |> x => x * 2)
        `,
        },
      },
      async test() {
        await fs.chmod(P.join('src', 'subprocess.js'), '755')
        await this.base.test()
      },
    },
    snapshot: {
      files: {
        'index.spec.js': endent`
        export default {
          works: function () {
            expect('foo').toMatchSnapshot(this)
          },
        }
      `,
      },
      async test() {
        await this.base.test()
        expect(await globby('*', { cwd: '__snapshots__' })).toEqual([
          'index.spec.js.snap',
        ])
      },
    },
    'test in project root': {
      files: {
        'index.spec.js': endent`
        export default {
          valid: () => console.log('run test')
        }

      `,
        'node_modules/base-config-foo/index.js': endent`
        module.exports = {
          allowedMatches: [
            'index.spec.js',
          ],
        }
      `,
        'package.json': JSON.stringify({
          baseConfig: 'foo',
        }),
      },
      async test() {
        expect(this.base.test() |> await |> property('all')).toMatch('run test')
      },
    },
    'unused dependencies': {
      files: {
        'package.json': JSON.stringify({
          dependencies: {
            'change-case': '^1.0.0',
            foo: '^1.0.0',
          },
        }),
        'src/index.js': 'export default 1',
      },
      async test() {
        await expect(this.base.test()).rejects.toThrow(endent`
          Unused dependencies
          * change-case
          * foo
        `)
      },
    },
    'update snapshot': {
      files: {
        '__snapshots__/index.spec.js.snap': endent`
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
        return this.base.test({ updateSnapshots: true })
      },
    },
    'usesdocker macOS': {
      files: {
        'src/index.usesdocker.spec.js': 'throw new Error()',
      },
      async test() {
        const previousPlatform = process.platform

        const previousEnv = process.env
        process.env.CI = true
        Object.defineProperty(process, 'platform', { value: 'darwin' })
        try {
          await this.base.test()
        } finally {
          Object.defineProperty(process, 'platform', {
            value: previousPlatform,
          })
          process.env = previousEnv
        }
      },
    },
    'usesdocker outside ci': {
      files: {
        'src/index.usesdocker.spec.js': "throw new Error('foobarbaz')",
      },
      async test() {
        const previousPlatform = process.platform

        const previousEnv = process.env
        delete process.env.CI
        delete process.env.GITHUB_ACTIONS
        Object.defineProperty(process, 'platform', { value: 'darwin' })
        await expect(this.base.test()).rejects.toThrow('foobarbaz')
        Object.defineProperty(process, 'platform', { value: previousPlatform })
        process.env = previousEnv
      },
    },
    'usesdocker windows': {
      files: {
        'src/index.usesdocker.spec.js': 'throw new Error()',
      },
      async test() {
        const previousPlatform = process.platform

        const previousEnv = process.env
        process.env.CI = true
        Object.defineProperty(process, 'platform', { value: 'win32' })
        try {
          await this.base.test()
        } finally {
          Object.defineProperty(process, 'platform', {
            value: previousPlatform,
          })
          process.env = previousEnv
        }
      },
    },
    valid: {
      files: {
        'package.json': JSON.stringify({
          name: 'foo',
          type: 'module',
        }),
        src: {
          'index.js': endent`
          export default 1

        `,
          'index.spec.js': endent`
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
        expect(this.base.test() |> await |> property('all')).toMatch('run test')
        expect(
          globby('*', { dot: true, onlyFiles: false })
            |> await
            |> keyBy(identity)
            |> mapValues(stubTrue)
        ).toEqual({
          '.babelrc.json': true,
          '.commitlintrc.json': true,
          '.cz.json': true,
          '.devcontainer': true,
          '.editorconfig': true,
          '.eslintrc.json': true,
          '.gitattributes': true,
          '.github': true,
          '.gitignore': true,
          '.gitpod.Dockerfile': true,
          '.gitpod.yml': true,
          '.releaserc.json': true,
          '.renovaterc.json': true,
          '.vscode': true,
          'LICENSE.md': true,
          'README.md': true,
          coverage: true,
          'package.json': true,
          src: true,
        })
      },
    },
    'wrong dependencies type': {
      files: {
        'package.json': JSON.stringify({
          dependencies: 1,
        }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'package.json invalid\ndata/dependencies must be object'
        )
      },
    },
    'wrong description type': {
      files: {
        'package.json': JSON.stringify({
          description: 1,
        }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'package.json invalid\ndata/description must be string'
        )
      },
    },
    'wrong dev dependencies type': {
      files: {
        'package.json': JSON.stringify({ devDependencies: 1 }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'package.json invalid\ndata/devDependencies must be object'
        )
      },
    },
    'wrong keywords type': {
      files: {
        'package.json': JSON.stringify({ keywords: 1 }),
      },
      test() {
        return expect(this.base.test()).rejects.toThrow(
          'package.json invalid\ndata/keywords must be array'
        )
      },
    },
  },
  [
    testerPluginTmpDir(),
    {
      transform: test =>
        async function () {
          test = {
            config: {},
            files: {},
            ...test,
          }
          await outputFiles(test.files)
          this.base = new Base(test.config)
          test.test = test.test || (() => this.base.test())
          await this.base.prepare()
          await test.test.call(this)
        },
    },
  ]
)
