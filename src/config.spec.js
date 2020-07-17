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
  filled: {
    baseConfig: {
      commands: {
        prepublishOnly: x => x + 1,
        start: x => x + 3,
      },
      deployAssets: [{ label: 'Foo', path: 'foo.js' }],
      deployEnv: {
        FOO: '${{ secrets.FOO }}',
      },
      deployPlugins: ['semantic-release-foo'],
      editorIgnore: ['foo'],
      gitignore: ['foo'],
      lint: x => x + 3,
      packageConfig: {
        main: 'dist/index.scss',
      },
      preDeploySteps: [{ run: 'foo' }],
      prepare: x => x + 2,
    },
    packageConfig: { name: 'base-config-foo' },
    test: config => {
      expect(
        config |> omit(['commands', 'depcheckConfig', 'prepare', 'lint'])
      ).toEqual({
        deployAssets: [{ label: 'Foo', path: 'foo.js' }],
        deployEnv: {
          FOO: '${{ secrets.FOO }}',
        },
        deployPlugins: ['semantic-release-foo'],
        editorIgnore: ['foo'],
        gitignore: ['foo'],
        name: 'base-config-foo',
        packageConfig: {
          main: 'dist/index.scss',
        },
        preDeploySteps: [{ run: 'foo' }],
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
  valid: {
    packageConfig: { name: 'base-config-foo' },
    test: config => {
      expect(config |> omit(['depcheckConfig', 'prepare', 'lint'])).toEqual({
        commands: {},
        deployAssets: [],
        deployEnv: {},
        deployPlugins: [],
        editorIgnore: [],
        gitignore: [],
        name: 'base-config-foo',
        preDeploySteps: [],
      })
      expect(typeof config.depcheckConfig).toEqual('object')
      expect(config.lint(1)).toEqual(1)
    },
  },
} |> mapValues(runTest)
