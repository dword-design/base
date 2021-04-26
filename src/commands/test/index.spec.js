import {
  endent,
  identity,
  keyBy,
  mapValues,
  property,
  stubTrue,
} from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'
import packageName from 'depcheck-package-name'
import { readFile } from 'fs-extra'
import globby from 'globby'
import outputFiles from 'output-files'
import P from 'path'
import stealthyRequire from 'stealthy-require'
import withLocalTmpDir from 'with-local-tmp-dir'

import self from '.'

const runTest = config => {
  config = { files: {}, ...config }

  return () =>
    withLocalTmpDir(async () => {
      await outputFiles(config.files)

      const prepare = stealthyRequire(require.cache, () =>
        require('../prepare')
      )
      await prepare()
      await config.test()
    })
}

export default {
  '.nuxt': {
    files: {
      '.nuxt/index.js': 'export default 1',
      'src/index.spec.js': "import '@/.nuxt'",
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(
        /SyntaxError: Unexpected token '?export'?/
      ),
  },
  '.nuxt postfix': {
    files: {
      '.nuxt-foo/index.js': 'export default 1',
      'src/index.spec.js': "import '@/.nuxt-foo'",
    },
    test: () => self('', { log: false }),
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
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(
        'Error: expect(received).toEqual(expected)'
      ),
  },
  'bin outside dist': {
    files: {
      'package.json': JSON.stringify(
        { bin: { foo: './src/cli.js' } },
        undefined,
        2
      ),
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(
        'package.json invalid\ndata/bin/foo must match pattern "^\\.\\/dist\\/"'
      ),
  },
  'config file errors': {
    files: {
      'package.json': JSON.stringify({ name: '_foo' }, undefined, 2),
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow('package.json invalid'),
  },
  empty: {
    test: () => self('', { log: false }),
  },
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
    test: async () => {
      const output =
        self('', { grep: 'foo', log: false }) |> await |> property('all')
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
    test: async () => {
      await self('', { log: false })
      expect(await globby('*', { cwd: '__image_snapshots__' })).toEqual([
        'index-spec-js-index-works-1-snap.png',
      ])
    },
  },
  'invalid name': {
    files: {
      'package.json': JSON.stringify({ name: '_foo' }, undefined, 2),
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(
        'package.json invalid\ndata/name must match pattern "^(@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]*$"'
      ),
  },
  'json errors': {
    files: {
      'src/test.json': 'foo bar',
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(
        'error  Unexpected token o'
      ),
  },
  'linting errors': {
    files: {
      'src/index.js': "var foo = 'bar'",
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(
        "error  'foo' is assigned a value but never used  no-unused-vars"
      ),
  },
  minimal: {
    files: {
      'src/index.js': 'export default 1',
    },
    test: () => self('', { log: false }),
  },
  'missing readme sections': {
    files: {
      'README.md': endent`
        <!-- TITLE -->

        <!-- BADGES -->

        <!-- LICENSE -->

      `,
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(
        'The README.md file is missing or misses the following sections: DESCRIPTION, INSTALL'
      ),
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
    test: async () => {
      await self('', { log: false })
      expect(await globby('*', { cwd: '__snapshots__' })).toEqual([
        'index.spec.js.snap',
      ])
      expect(
        await readFile(P.join('__snapshots__', 'index.spec.js.snap'), 'utf8')
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
      'package.json': { devDependencies: { foo: '^1.0.0' } } |> JSON.stringify,
      'src/index.spec.js': "import 'foo'",
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(
        /SyntaxError: Unexpected token '?export'?/
      ),
  },
  'node_modules postfix': {
    files: {
      'node_modules-foo/index.js': 'export default 1',
      'src/index.spec.js': "import '@/node_modules-foo'",
    },
    test: () => self('', { log: false }),
  },
  'node_modules subfolder': {
    files: {
      'package.json': { devDependencies: { foo: '^1.0.0' } } |> JSON.stringify,
      src: {
        'index.spec.js': "import 'foo'",
        'node_modules/foo/index.js': 'export default 1',
      },
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(
        /SyntaxError: Unexpected token '?export'?/
      ),
  },
  pattern: {
    files: {
      'README.md': '',
      'package.json': JSON.stringify(
        {
          dependencies: {
            foo: '^1.0.0',
          },
        },
        undefined,
        2
      ),
      src: {
        'index.js': 'export default 1',
        'index1.spec.js':
          "export default { valid: () => console.log('run index1') }",
        'index2.spec.js':
          "export default { valid: () => console.log('run index2') }",
      },
    },
    test: async () => {
      const output =
        self('src/index2.spec.js', { log: false }) |> await |> property('all')
      expect(output).not.toMatch('run index1')
      expect(output).toMatch('run index2')
    },
  },
  'prod dependency only in test': {
    files: {
      'node_modules/bar/index.js': 'export default 1',
      'package.json': JSON.stringify(
        {
          dependencies: {
            bar: '^1.0.0',
          },
        },
        undefined,
        2
      ),
      src: {
        'index.js': 'export default 1',
        'index.spec.js': endent`
        import bar from 'bar'

        export default bar
      `,
      },
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(endent`
      Unused dependencies
      * bar
    `),
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
    test: async () => {
      await self('', { log: false })
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
      'package.json': JSON.stringify(
        {
          baseConfig: 'foo',
        },
        undefined,
        2
      ),
    },
    test: async () =>
      expect(self('', { log: false }) |> await |> property('all')).toMatch(
        'run test'
      ),
  },
  'unused dependecy': {
    files: {
      'package.json': JSON.stringify(
        {
          dependencies: {
            'change-case': '^1.0.0',
          },
        },
        undefined,
        2
      ),
      'src/index.js': 'export default 1',
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(endent`
        Unused dependencies
        * change-case
      `),
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
    test: async () => {
      await self('', { log: false, updateSnapshots: true })
    },
  },
  'usesdocker macOS': {
    files: {
      'src/index.usesdocker.spec.js': 'throw new Error()',
    },
    test: async () => {
      const previousPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'darwin' })

      const specialSelf = proxyquire('.', { 'is-ci': true })
      try {
        await specialSelf('', { log: false })
      } finally {
        Object.defineProperty(process, 'platform', { value: previousPlatform })
      }
    },
  },
  'usesdocker outside ci': {
    files: {
      'src/index.usesdocker.spec.js': "throw new Error('foobarbaz')",
    },
    test: async () => {
      const previousPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'darwin' })

      const specialSelf = proxyquire('.', { 'is-ci': false })
      await expect(specialSelf('', { log: false })).rejects.toThrow('foobarbaz')
      Object.defineProperty(process, 'platform', { value: previousPlatform })
    },
  },
  'usesdocker windows': {
    files: {
      'src/index.usesdocker.spec.js': 'throw new Error()',
    },
    test: async () => {
      const previousPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'win32' })

      const specialSelf = proxyquire('.', { 'is-ci': true })
      try {
        await specialSelf('', { log: false })
      } finally {
        Object.defineProperty(process, 'platform', { value: previousPlatform })
      }
    },
  },
  valid: {
    files: {
      'package.json': JSON.stringify(
        {
          name: 'foo',
        },
        undefined,
        2
      ),
      src: {
        'index.js': endent`
          export default 1

        `,
        'index.spec.js': endent`
          import foo from '.'

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
    test: async () => {
      expect(
        (await self('', { log: false })) |> await |> property('all')
      ).toMatch('run test')
      expect(
        globby('*', { dot: true, onlyFiles: false })
          |> await
          |> keyBy(identity)
          |> mapValues(stubTrue)
      ).toEqual({
        '.babelrc.json': true,
        '.commitlintrc.json': true,
        '.cz.json': true,
        '.editorconfig': true,
        '.eslintrc.json': true,
        '.gitattributes': true,
        '.github': true,
        '.gitignore': true,
        '.gitpod.Dockerfile': true,
        '.gitpod.yml': true,
        '.huskyrc.json': true,
        '.nyc_output': true,
        '.releaserc.json': true,
        '.renovaterc.json': true,
        '.vscode': true,
        'LICENSE.md': true,
        'README.md': true,
        coverage: true,
        node_modules: true,
        'package.json': true,
        src: true,
      })
    },
  },
  'wrong dependencies type': {
    files: {
      'package.json': JSON.stringify(
        {
          dependencies: 1,
        },
        undefined,
        2
      ),
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(
        'package.json invalid\ndata/dependencies must be object'
      ),
  },
  'wrong description type': {
    files: {
      'package.json': JSON.stringify(
        {
          description: 1,
        },
        undefined,
        2
      ),
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(
        'package.json invalid\ndata/description must be string'
      ),
  },
  'wrong dev dependencies type': {
    files: {
      'package.json': JSON.stringify({ devDependencies: 1 }, undefined, 2),
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(
        'package.json invalid\ndata/devDependencies must be object'
      ),
  },
  'wrong keywords type': {
    files: {
      'package.json': JSON.stringify({ keywords: 1 }, undefined, 2),
    },
    test: () =>
      expect(self('', { log: false })).rejects.toThrow(
        'package.json invalid\ndata/keywords must be array'
      ),
  },
} |> mapValues(runTest)
