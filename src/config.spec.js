import {
  identity,
  keys,
  mapValues,
  omit,
  sortBy,
} from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

const runTest = config => () => {
  config = { baseConfig: {}, packageConfig: {}, ...config }
  const self = proxyquire('./config', {
    './package-base-config': config.packageConfig,
    'import-cwd': () => config.baseConfig,
  })
  config.test(self)
}

export default {
  valid: {
    packageConfig: { name: 'base-config-foo' },
    test: config => {
      expect(config |> omit(['depcheckConfig', 'prepare', 'lint'])).toEqual({
        name: 'base-config-foo',
        gitignore: [],
        editorIgnore: [],
        commands: {},
        deployPlugins: [],
        deployAssets: [],
        deployEnv: {},
      })
      expect(typeof config.depcheckConfig).toEqual('object')
      expect(config.lint(1)).toEqual(1)
    },
  },
  filled: {
    packageConfig: { name: 'base-config-foo' },
    baseConfig: {
      gitignore: ['foo'],
      editorIgnore: ['foo'],
      packageConfig: {
        main: 'dist/index.scss',
      },
      prepare: x => x + 2,
      lint: x => x + 3,
      commands: {
        prepublishOnly: x => x + 1,
        start: x => x + 3,
      },
      deployPlugins: ['semantic-release-foo'],
      deployAssets: [{ path: 'foo.js', label: 'Foo' }],
      deployEnv: {
        FOO: '${{ secrets.FOO }}',
      },
    },
    test: config => {
      expect(
        config |> omit(['commands', 'depcheckConfig', 'prepare', 'lint'])
      ).toEqual({
        name: 'base-config-foo',
        gitignore: ['foo'],
        editorIgnore: ['foo'],
        packageConfig: {
          main: 'dist/index.scss',
        },
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
    },
  },
} |> mapValues(runTest)
