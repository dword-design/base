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
          lint: x => x + 3,
          commands: {
            prepublishOnly: x => x + 1,
            start: x => x + 3,
          },
          deployPlugins: [
            'semantic-release-foo',
          ],
          deployAssets: [
            { path: 'foo.js', label: 'Foo' },
          ],
          deployEnv: {
            'FOO': '\${{ secrets.FOO }}',
          },
        }
      `,
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
            devDependencies: {
              'base-config-foo': '^1.0.0',
            },
          },
          undefined,
          2
        ),
      })
      const config = stealthyRequire(require.cache, () => require('./config'))
      expect(
        config |> omit(['commands', 'depcheckConfig', 'prepare', 'lint'])
      ).toEqual({
        name: 'base-config-foo',
        gitignore: ['foo'],
        main: 'index.scss',
        deployPlugins: ['semantic-release-foo'],
        deployAssets: [{ path: 'foo.js', label: 'Foo' }],
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
      expect(config.lint(1)).toEqual(4)
      expect(typeof config.depcheckConfig).toEqual('object')
    }),
  'custom config': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js': '',
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
            devDependencies: {
              'base-config-foo': '^1.0.0',
            },
          },
          undefined,
          2
        ),
      })
      const config = stealthyRequire(require.cache, () => require('./config'))
      expect(config |> omit(['depcheckConfig', 'prepare', 'lint'])).toEqual({
        name: 'base-config-foo',
        gitignore: [],
        main: 'index.js',
        commands: {},
        deployPlugins: [],
        deployAssets: [],
        deployEnv: {},
      })
      expect(typeof config.depcheckConfig).toEqual('object')
      expect(config.lint(1)).toEqual(1)
    }),
  empty: () =>
    withLocalTmpDir(() => {
      const config = stealthyRequire(require.cache, () => require('./config'))
      expect(
        config |> omit(['commands', 'prepare', 'lint', 'depcheckConfig'])
      ).toEqual({
        name: '@dword-design/base-config-node',
        allowedMatches: ['src'],
        gitignore: ['/.eslintrc.json'],
        main: 'index.js',
        npmPublish: true,
        useJobMatrix: true,
        deployPlugins: [],
        deployAssets: [],
        deployEnv: {},
      })
      expect(config |> keys |> sortBy(identity)).toEqual([
        'allowedMatches',
        'commands',
        'depcheckConfig',
        'deployAssets',
        'deployEnv',
        'deployPlugins',
        'gitignore',
        'lint',
        'main',
        'name',
        'npmPublish',
        'prepare',
        'useJobMatrix',
      ])
    }),
}
