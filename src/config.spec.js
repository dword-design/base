import withLocalTmpDir from 'with-local-tmp-dir'
import { endent, keys, sortBy, identity, omit } from '@dword-design/functions'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'

export default {
  'custom config filled': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js': endent`
        module.exports = {
          gitignore: ['foo'],
          main: 'index.scss',
          prepare: x => x + 2,
          test: x => x + 3,
          commands: {
            prepublishOnly: x => x + 1,
            start: x => x + 3,
          },
          deployPlugins: [
            'semantic-release-foo',
          ],
          deployEnv: {
            'FOO': '\${{ secrets.FOO }}',
          },
        }
      `,
        'package.json': endent`
        {
          "baseConfig": "foo",
          "devDependencies": {
            "base-config-foo": "^1.0.0"
          }
        }
      `,
      })
      const config = stealthyRequire(require.cache, () => require('./config'))
      expect(
        config |> omit(['commands', 'depcheckConfig', 'prepare', 'test'])
      ).toEqual({
        name: 'base-config-foo',
        gitignore: ['foo'],
        main: 'index.scss',
        deployPlugins: ['semantic-release-foo'],
        deployEnv: {
          FOO: '${{ secrets.FOO }}',
        },
      })
      expect(config.commands |> keys |> sortBy(identity)).toEqual([
        'prepublishOnly',
        'start',
      ])
      expect(config.commands.prepublishOnly(1)).toEqual(2)
      expect(config.commands.start(1)).toEqual(4)
      expect(config.prepare(1)).toEqual(3)
      expect(config.test(1)).toEqual(4)
      expect(typeof config.depcheckConfig).toEqual('object')
    }),
  'custom config': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js': '',
        'package.json': endent`
        {
          "baseConfig": "foo",
          "devDependencies": {
            "base-config-foo": "^1.0.0"
          }
        }
      `,
      })
      const config = stealthyRequire(require.cache, () => require('./config'))
      expect(config |> omit(['depcheckConfig', 'prepare', 'test'])).toEqual({
        name: 'base-config-foo',
        gitignore: [],
        main: 'index.js',
        commands: {},
        deployPlugins: [],
        deployEnv: {},
      })
      expect(typeof config.depcheckConfig).toEqual('object')
      expect(config.test(1)).toEqual(1)
    }),
  empty: () =>
    withLocalTmpDir(() => {
      const config = stealthyRequire(require.cache, () => require('./config'))
      expect(
        config |> omit(['commands', 'prepare', 'test', 'depcheckConfig'])
      ).toEqual({
        name: '@dword-design/base-config-node',
        allowedMatches: ['src'],
        gitignore: ['/.eslintrc.json'],
        main: 'index.js',
        npmPublish: true,
        deployPlugins: [],
        deployEnv: {},
      })
      expect(config |> keys |> sortBy(identity)).toEqual([
        'allowedMatches',
        'commands',
        'depcheckConfig',
        'deployEnv',
        'deployPlugins',
        'gitignore',
        'main',
        'name',
        'npmPublish',
        'prepare',
        'test',
      ])
    }),
}