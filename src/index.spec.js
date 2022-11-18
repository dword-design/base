import { endent, identity, keys, omit, sortBy } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { outputFile } from 'fs-extra'
import outputFiles from 'output-files'
import P from 'path'

import { Base as Self } from '.'

export default tester(
  {
    'array merge': async () => {
      await outputFile(
        P.join('node_modules', '@dword-design', 'base-config-foo', 'index.js'),
        "module.exports = { allowedMatches: ['foo.txt'] }"
      )

      const base = new Self({
        allowedMatches: ['bar.txt'],
        name: '@dword-design/foo',
      })
      expect(base.config.allowedMatches).toEqual(['foo.txt', 'bar.txt'])
    },
    empty: async () => {
      await outputFile(
        'package.json',
        JSON.stringify({
          name: 'foo',
        })
      )

      const base = new Self()
      expect(base.config.name).toEqual('@dword-design/base-config-node')
    },
    'empty parent': async function () {
      await outputFiles({
        'node_modules/base-config-foo/index.js': 'module.exports = {}',
        'package.json': JSON.stringify({ name: 'foo' }),
      })

      const base = new Self({ name: 'foo' })
      expect(
        base.config |> omit(['depcheckConfig', 'prepare', 'lint'])
      ).toMatchSnapshot(this)
      expect(typeof base.config.depcheckConfig).toEqual('object')
      expect(base.config.lint(1)).toEqual(1)
    },
    function: async () => {
      await outputFile(
        P.join('node_modules', 'base-config-foo', 'index.js'),
        'module.exports = config => ({ readmeInstallString: config.bar })'
      )

      const base = new Self({ bar: 'baz', name: 'foo' })
      expect(base.config.readmeInstallString).toEqual('baz')
    },
    global: async () => {
      await outputFile('package.json', JSON.stringify({ name: 'foo' }))

      const base = new Self({ global: true })
      expect(base.config.readmeInstallString).toEqual(endent`
      ## Install

      \`\`\`bash
      # npm
      $ npm install -g foo

      # Yarn
      $ yarn global add foo
      \`\`\`
    `)
    },
    async inherited() {
      await outputFile(
        P.join('node_modules', 'base-config-foo', 'index.js'),
        endent`
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
          supportedNodeVersions: [1, 2],
        }

      `
      )

      const base = new Self({ name: 'foo' })
      expect(
        base.config |> omit(['commands', 'depcheckConfig', 'prepare', 'lint'])
      ).toMatchSnapshot(this)
      expect(base.config.commands |> keys |> sortBy(identity)).toEqual([
        'prepublishOnly',
        'start',
      ])
      expect(base.config.commands.prepublishOnly(1)).toEqual(2)
      expect(base.config.commands.start(1)).toEqual(4)
      expect(base.config.prepare(1)).toEqual(3)
      expect(base.config.lint(1)).toEqual(4)
      expect(typeof base.config.depcheckConfig).toEqual('object')
    },
  },
  [testerPluginTmpDir()]
)
