import {
  endent,
  identity,
  keyBy,
  mapValues,
  property,
  stubTrue,
} from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import { chmod, readFile } from 'fs-extra'
import globby from 'globby'
import outputFiles from 'output-files'
import P from 'path'
import stealthyRequire from 'stealthy-require-no-leak'
import unifyMochaOutput from 'unify-mocha-output'
import withLocalTmpDir from 'with-local-tmp-dir'

const runTest = config => {
  config = { files: {}, ...config }

  return function () {
    return withLocalTmpDir(async () => {
      await outputFiles(config.files)

      const prepare = stealthyRequire(require.cache, () =>
        require('../prepare')
      )
      await prepare()
      await config.test.call(this)
    })
  }
}

export default {
  '.nuxt': {
    files: {
      '.nuxt/index.js': 'export default 1',
      'src/index.spec.js': "import '@/.nuxt'",
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(
        /SyntaxError: Unexpected token '?export'?/
      )
    },
  },
  '.nuxt postfix': {
    files: {
      '.nuxt-foo/index.js': 'export default 1',
      'src/index.spec.js': "import '@/.nuxt-foo'",
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await self()
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
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(
        'Error: expect(received).toEqual(expected)'
      )
    },
  },
  'base config in prod dependencies': {
    files: {
      'node_modules/base-config-foo/index.js': 'module.exports = {}',
      'package.json': JSON.stringify(
        {
          baseConfig: 'foo',
          dependencies: {
            'base-config-foo': '^1.0.0',
          },
        },
        undefined,
        2
      ),
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(endent`
      Unused dependencies
      * base-config-foo
    `)
    },
  },
  'bin outside dist': {
    files: {
      'package.json': JSON.stringify(
        { bin: { foo: './src/cli.js' } },
        undefined,
        2
      ),
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(
        'package.json invalid\ndata/bin/foo must match pattern "^\\.\\/dist\\/"'
      )
    },
  },
  'config file errors': {
    files: {
      'package.json': JSON.stringify({ name: '_foo' }, undefined, 2),
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow('package.json invalid')
    },
  },
  'coverage file extension': {
    files: {
      'index.foo': '',
      'index.spec.js': endent`
        import { outputFile } from 'fs-extra'
        import P from 'path'

        const fooPath = P.resolve('index.foo')

        export default {
          works: () => outputFile(
            '.nyc_output/foo.js',
            JSON.stringify({
              [fooPath]: {
                all: true,
                b: {},
                branchMap: {},
                f: {},
                fnMap: {},
                path: fooPath,
                s: {
                  0: 0,
                },
                statementMap: {
                  0: {
                    end: {
                      column: 0,
                      line: 0,
                    },
                    start: {
                      column: 0,
                      line: 0,
                    },
                  },
                },
              },
            })
          )
        }
      `,
      'package.json': JSON.stringify({
        baseConfig: {
          coverageFileExtensions: ['.foo'],
        },
        devDependencies: { 'fs-extra': '^1.0.0' },
      }),
    },
    async test() {
      const self = stealthyRequire(require.cache, () => require('.'))
      expect(
        self() |> await |> property('all') |> unifyMochaOutput
      ).toMatchSnapshot(this)
    },
  },
  'depcheck ignoreMatches': {
    files: {
      'package.json': JSON.stringify(
        {
          baseConfig: {
            depcheckConfig: {
              ignoreMatches: ['foo'],
            },
          },
          dependencies: {
            foo: '^1.0.0',
          },
        },
        undefined,
        2
      ),
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await self()
    },
  },
  empty: {
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await self()
    },
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
      const self = stealthyRequire(require.cache, () => require('.'))

      const output = self('', { grep: 'foo' }) |> await |> property('all')
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
      const self = stealthyRequire(require.cache, () => require('.'))
      await self()
      expect(await globby('*', { cwd: '__image_snapshots__' })).toEqual([
        'index-spec-js-index-works-1-snap.png',
      ])
    },
  },
  'invalid name': {
    files: {
      'package.json': JSON.stringify({ name: '_foo' }, undefined, 2),
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(
        'package.json invalid\ndata/name must match pattern "^(@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]*$"'
      )
    },
  },
  'json errors': {
    files: {
      'src/test.json': 'foo bar',
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow('error  Unexpected token o')
    },
  },
  'linting errors': {
    files: {
      'src/index.js': "var foo = 'bar'",
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(
        "error  'foo' is assigned a value but never used  no-unused-vars"
      )
    },
  },
  minimal: {
    files: {
      'src/index.js': 'export default 1',
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await self()
    },
  },
  'missing readme sections': {
    files: {
      'README.md': endent`
        <!-- TITLE -->

        <!-- BADGES -->

        <!-- LICENSE -->

      `,
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(
        'The README.md file is missing or misses the following sections: DESCRIPTION, INSTALL'
      )
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
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await self()
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
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(
        /SyntaxError: Unexpected token '?export'?/
      )
    },
  },
  'node_modules postfix': {
    files: {
      'node_modules-foo/index.js': 'export default 1',
      'src/index.spec.js': "import '@/node_modules-foo'",
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await self()
    },
  },
  'node_modules subfolder': {
    files: {
      'package.json': { devDependencies: { foo: '^1.0.0' } } |> JSON.stringify,
      src: {
        'index.spec.js': "import 'foo'",
        'node_modules/foo/index.js': 'export default 1',
      },
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(
        /SyntaxError: Unexpected token '?export'?/
      )
    },
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
      const self = stealthyRequire(require.cache, () => require('.'))

      const output = self('src/index2.spec.js') |> await |> property('all')
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
        import execa from 'execa'
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
    test: async () => {
      await chmod(P.join('src', 'subprocess.js'), '755')

      const self = stealthyRequire(require.cache, () => require('.'))
      await self()
    },
  },
  'prod dependency only in test': {
    files: {
      'node_modules/bar/index.js': 'module.exports = 1',
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
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(endent`
      Unused dependencies
      * bar
    `)
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
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await self()
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
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      expect(self() |> await |> property('all')).toMatch('run test')
    },
  },
  'unused dependency': {
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
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(endent`
        Unused dependencies
        * change-case
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
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await self('', { updateSnapshots: true })
    },
  },
  'usesdocker macOS': {
    files: {
      'src/index.usesdocker.spec.js': 'throw new Error()',
    },
    test: async () => {
      const previousPlatform = process.platform

      const previousEnv = process.env
      process.env.CI = true

      const self = stealthyRequire(require.cache, () => require('.'))
      Object.defineProperty(process, 'platform', { value: 'darwin' })
      try {
        await self()
      } finally {
        Object.defineProperty(process, 'platform', { value: previousPlatform })
        process.env = previousEnv
      }
    },
  },
  'usesdocker outside ci': {
    files: {
      'src/index.usesdocker.spec.js': "throw new Error('foobarbaz')",
    },
    test: async () => {
      const previousPlatform = process.platform

      const previousEnv = process.env
      delete process.env.CI
      delete process.env.GITHUB_ACTIONS

      const self = stealthyRequire(require.cache, () => require('.'))
      Object.defineProperty(process, 'platform', { value: 'darwin' })
      await expect(self()).rejects.toThrow('foobarbaz')
      Object.defineProperty(process, 'platform', { value: previousPlatform })
      process.env = previousEnv
    },
  },
  'usesdocker windows': {
    files: {
      'src/index.usesdocker.spec.js': 'throw new Error()',
    },
    test: async () => {
      const previousPlatform = process.platform

      const previousEnv = process.env
      process.env.CI = true

      const self = stealthyRequire(require.cache, () => require('.'))
      Object.defineProperty(process, 'platform', { value: 'win32' })
      try {
        await self()
      } finally {
        Object.defineProperty(process, 'platform', { value: previousPlatform })
        process.env = previousEnv
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
      const self = stealthyRequire(require.cache, () => require('.'))
      expect((await self()) |> await |> property('all')).toMatch('run test')
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
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(
        'package.json invalid\ndata/dependencies must be object'
      )
    },
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
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(
        'package.json invalid\ndata/description must be string'
      )
    },
  },
  'wrong dev dependencies type': {
    files: {
      'package.json': JSON.stringify({ devDependencies: 1 }, undefined, 2),
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(
        'package.json invalid\ndata/devDependencies must be object'
      )
    },
  },
  'wrong keywords type': {
    files: {
      'package.json': JSON.stringify({ keywords: 1 }, undefined, 2),
    },
    test: async () => {
      const self = stealthyRequire(require.cache, () => require('.'))
      await expect(self()).rejects.toThrow(
        'package.json invalid\ndata/keywords must be array'
      )
    },
  },
} |> mapValues(runTest)
