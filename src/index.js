import babelConfig from '@dword-design/babel-config'
import { endent, identity } from '@dword-design/functions'
import deepmerge from 'deepmerge'
import depcheck from 'depcheck'
import depcheckDetectorExeca from 'depcheck-detector-execa'
import depcheckDetectorPackageName from 'depcheck-detector-package-name'
import packageName from 'depcheck-package-name'
import depcheckParserBabel from 'depcheck-parser-babel'
import jiti from 'jiti'
import loadPkg from 'load-pkg'
import P from 'path'
import { transform as pluginNameToPackageName } from 'plugin-name-to-package-name'

import checkUnknownFiles from './commands/check-unknown-files/index.js'
import commit from './commands/commit/index.js'
import depcheckMethod from './commands/depcheck/index.js'
import lint from './commands/lint/index.js'
import prepare from './commands/prepare/index.js'
import test from './commands/test/index.js'
import testDocker from './commands/test-docker/index.js'
import testRaw from './commands/test-raw/index.js'
import getDepcheckSpecialBase from './get-depcheck-special-base/index.js'
import getEditorIgnoreConfig from './get-generated-files/get-editor-ignore/index.js'
import getEslintConfig from './get-generated-files/get-eslint/index.js'
import getGithubCodespacesDockerfile from './get-generated-files/get-github-codespaces-dockerfile/index.js'
import getGithubSyncMetadataConfig from './get-generated-files/get-github-sync-metadata/index.js'
import getGithubWorkflowConfig from './get-generated-files/get-github-workflow/index.js'
import getGitignoreConfig from './get-generated-files/get-gitignore/index.js'
import getGitpodDockerfile from './get-generated-files/get-gitpod-dockerfile.js'
import getLicenseString from './get-generated-files/get-license-string.js'
import getPackageConfig from './get-generated-files/get-package-config/index.js'
import getReadmeString from './get-generated-files/get-readme-string/index.js'
import getReleaseConfig from './get-generated-files/get-release/index.js'
import getRenovateConfig from './get-generated-files/get-renovate/index.js'
import getVscodeConfig from './get-generated-files/get-vscode/index.js'
import getGeneratedFiles from './get-generated-files/index.js'
import getGitInfo from './get-git-info/index.js'

class Base {
  constructor(config) {
    const jitiInstance = jiti(process.cwd(), {
      esmResolve: true,
      interopDefault: true,
      transformOptions: {
        babel: babelConfig,
      },
    })
    if (config === undefined) {
      config = { name: packageName`@dword-design/base-config-node` }
    }
    if (typeof config === 'function') {
      config = config()
    }
    if (config.name) {
      config.name = pluginNameToPackageName(config.name, 'base-config')
    }
    this.packageConfig = loadPkg.sync() || {}

    const defaultConfig = {
      allowedMatches: [],
      commands: {},
      coverageFileExtensions: [],
      depcheckConfig: {
        detectors: [
          depcheck.detector.importDeclaration,
          depcheck.detector.requireCallExpression,
          depcheck.detector.requireResolveCallExpression,
          depcheckDetectorExeca,
          depcheckDetectorPackageName,
        ],
        ignorePath: '.gitignore',
        parsers: {
          '**/*.js': depcheckParserBabel,
        },
        specials: [getDepcheckSpecialBase(config.name), depcheck.special.bin],
      },
      deployAssets: [],
      deployEnv: {},
      deployPlugins: [],
      editorIgnore: [],
      git: getGitInfo(),
      gitignore: [],
      lint: identity,
      nodeVersion: 16,
      preDeploySteps: [],
      prepare: identity,
      readmeInstallString: endent`
        ## Install

        \`\`\`bash
        # npm
        $ npm install ${config.global ? '-g ' : ''}${this.packageConfig.name}

        # Yarn
        $ yarn ${config.global ? 'global ' : ''}add ${this.packageConfig.name}
        \`\`\`
      `,
      seeAlso: [],
      supportedNodeVersions: [14, 16, 18],
      syncKeywords: true,
      windows: true,
    }

    const mergeOptions = {
      customMerge: key =>
        key === 'supportedNodeVersions' ? (a, b) => b : undefined,
    }

    const configsToMerge = [defaultConfig]
    if (config.name) {
      const inheritedConfigPath =
        config.name === this.packageConfig.name
          ? P.resolve('src', 'index.js')
          : config.name
      let inheritedConfig = inheritedConfigPath
        ? jitiInstance(inheritedConfigPath)
        : undefined
      if (typeof inheritedConfig === 'function') {
        inheritedConfig = inheritedConfig(
          deepmerge(defaultConfig, config, mergeOptions)
        )
      }
      configsToMerge.push(inheritedConfig)
    }
    configsToMerge.push(config)
    this.config = deepmerge.all(configsToMerge, mergeOptions)
    this.packageConfig = this.getPackageConfig()
    this.generatedFiles = this.getGeneratedFiles()
  }
}
Object.assign(Base.prototype, {
  checkUnknownFiles,
  commit,
  depcheck: depcheckMethod,
  getEditorIgnoreConfig,
  getEslintConfig,
  getGeneratedFiles,
  getGithubCodespacesDockerfile,
  getGithubSyncMetadataConfig,
  getGithubWorkflowConfig,
  getGitignoreConfig,
  getGitpodDockerfile,
  getLicenseString,
  getPackageConfig,
  getReadmeString,
  getReleaseConfig,
  getRenovateConfig,
  getVscodeConfig,
  lint,
  prepare,
  test,
  testDocker,
  testRaw,
})

export { Base }
