import chdir from '@dword-design/chdir'
import { endent, identity, keys, omit, sortBy } from '@dword-design/functions'
import tester from '@dword-design/tester'
import { outputFile } from 'fs-extra'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require-no-leak'
import { WithTempDir as withTmpDir } from 'with-tmp-dir-promise'

export default tester(
  {
    'array merge': async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js':
          "module.exports = { allowedMatches: ['foo.txt'] }",
        'package.json': JSON.stringify({
          baseConfig: {
            allowedMatches: ['bar.txt'],
            name: 'foo',
          },
          name: 'foo',
        }),
      })

      const self = stealthyRequire(require.cache, () => require('./config'))
      expect(self.allowedMatches).toEqual(['foo.txt', 'bar.txt'])
    },
    'config not in project path': async () => {
      await outputFile(
        'package.json',
        JSON.stringify({
          baseConfig: { name: '@dword-design/node' },
          name: 'foo',
        })
      )

      const self = stealthyRequire(require.cache, () => require('./config'))
      expect(self.name).toEqual('@dword-design/base-config-node')
    },
    empty: async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js': 'module.exports = {}',
        'package.json': JSON.stringify({ baseConfig: 'foo', name: 'foo' }),
      })

      const self = stealthyRequire(require.cache, () => require('./config'))
      expect(self |> omit(['depcheckConfig', 'prepare', 'lint'])).toEqual({
        allowedMatches: [],
        commands: {},
        coverageFileExtensions: [],
        deployAssets: [],
        deployEnv: {},
        deployPlugins: [],
        editorIgnore: [],
        gitignore: [],
        name: 'base-config-foo',
        nodeVersion: 14,
        preDeploySteps: [],
        readmeInstallString: endent`
        ## Install

        \`\`\`bash
        # npm
        $ npm install foo

        # Yarn
        $ yarn add foo
        \`\`\`
      `,
        seeAlso: [],
        syncKeywords: true,
      })
      expect(typeof self.depcheckConfig).toEqual('object')
      expect(self.lint(1)).toEqual(1)
    },
    global: async () => {
      await outputFile(
        'package.json',
        JSON.stringify({
          baseConfig: { global: true },
          name: 'foo',
        })
      )

      const self = stealthyRequire(require.cache, () => require('./config'))
      expect(self.readmeInstallString).toEqual(endent`
      ## Install

      \`\`\`bash
      # npm
      $ npm install -g foo

      # Yarn
      $ yarn global add foo
      \`\`\`
    `)
    },
    inherited: async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js': endent`
          module.exports = {
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
          }

        `,
        'package.json': JSON.stringify({
          baseConfig: 'foo',
          name: 'foo',
        }),
      })

      const self = stealthyRequire(require.cache, () => require('./config'))
      expect(
        self |> omit(['commands', 'depcheckConfig', 'prepare', 'lint'])
      ).toEqual({
        allowedMatches: [],
        coverageFileExtensions: [],
        deployAssets: [{ label: 'Foo', path: 'foo.js' }],
        deployEnv: {
          FOO: '${{ secrets.FOO }}',
        },
        deployPlugins: ['semantic-release-foo'],
        editorIgnore: ['foo'],
        gitignore: ['foo'],
        name: 'base-config-foo',
        nodeVersion: 10,
        packageBaseConfig: {
          main: 'dist/index.scss',
        },
        preDeploySteps: [{ run: 'foo' }],
        readmeInstallString: 'foo',
        seeAlso: [],
        syncKeywords: true,
      })
      expect(self.commands |> keys |> sortBy(identity)).toEqual([
        'prepublishOnly',
        'start',
      ])
      expect(self.commands.prepublishOnly(1)).toEqual(2)
      expect(self.commands.start(1)).toEqual(4)
      expect(self.prepare(1)).toEqual(3)
      expect(self.lint(1)).toEqual(4)
      expect(typeof self.depcheckConfig).toEqual('object')
    },
    function: async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js': endent`
          module.exports = config => ({ readmeInstallString: config.bar })

        `,
        'package.json': JSON.stringify({
          baseConfig: {
            name: 'foo',
            bar: 'baz',
          },
          name: 'foo',
        }),
      })

      const self = stealthyRequire(require.cache, () => require('./config'))
      expect(self.readmeInstallString).toEqual('baz')
    },
  },
  [
    {
      transform: test =>
        function () {
          return withTmpDir(cwd => chdir(cwd, () => test.call(this)), {
            unsafeCleanup: true,
          })
        },
    },
  ]
)
