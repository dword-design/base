import {
  endent,
  identity,
  keys,
  mapValues,
  omit,
  sortBy,
} from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

const runTest = config => () => {
  config = {
    baseConfig: {},
    packageBaseConfig: {},
    packageConfig: {},
    ...config,
  }

  const self = proxyquire('./config', {
    './package-base-config': config.packageBaseConfig,
    './package-config': config.packageConfig,
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
      nodeVersion: 10,
      packageBaseConfig: {
        main: 'dist/index.scss',
      },
      preDeploySteps: [{ run: 'foo' }],
      prepare: x => x + 2,
      readmeInstallString: 'foo',
    },
    packageBaseConfig: { name: 'base-config-foo' },
    test: config => {
      expect(
        config |> omit(['commands', 'depcheckConfig', 'prepare', 'lint'])
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
  global: {
    packageBaseConfig: { global: true },
    packageConfig: {
      name: 'foo',
    },
    test: config =>
      expect(config.readmeInstallString).toEqual(endent`
        ## Install

        \`\`\`bash
        # npm
        $ npm install -g foo

        # Yarn
        $ yarn global add foo
        \`\`\`
      `),
  },
  valid: {
    packageBaseConfig: { name: 'base-config-foo' },
    packageConfig: {
      name: 'foo',
    },
    test: config => {
      expect(config |> omit(['depcheckConfig', 'prepare', 'lint'])).toEqual({
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
      })
      expect(typeof config.depcheckConfig).toEqual('object')
      expect(config.lint(1)).toEqual(1)
    },
  },
} |> mapValues(runTest)
