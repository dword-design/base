import { endent, identity } from '@dword-design/functions'
import deepmerge from 'deepmerge'
import depcheck from 'depcheck'
import depcheckDetectorExeca from 'depcheck-detector-execa'
import depcheckDetectorPackageName from 'depcheck-detector-package-name'
import packageName from 'depcheck-package-name'
import depcheckParserBabel from 'depcheck-parser-babel'
import importCwd from 'import-cwd'
import { transform as pluginNameToPackageName } from 'plugin-name-to-package-name'

import checkUnknownFiles from './commands/check-unknown-files'
import commit from './commands/commit'
import depcheckMethod from './commands/depcheck'
import lint from './commands/lint'
import prepare from './commands/prepare'
import test from './commands/test'
import testDocker from './commands/test-docker'
import testRaw from './commands/test-raw'
import getDepcheckSpecialBase from './get-depcheck-special-base'
import getGeneratedFiles from './get-generated-files'
import getEditorIgnoreConfig from './get-generated-files/get-editor-ignore'
import getEslintConfig from './get-generated-files/get-eslint'
import getGithubSyncMetadataConfig from './get-generated-files/get-github-sync-metadata'
import getGithubWorkflowConfig from './get-generated-files/get-github-workflow'
import getGitignoreConfig from './get-generated-files/get-gitignore'
import getGitpodDockerfile from './get-generated-files/get-gitpod-dockerfile'
import getLicenseString from './get-generated-files/get-license-string'
import getPackageConfig from './get-generated-files/get-package-config'
import getReadmeString from './get-generated-files/get-readme-string'
import getReleaseConfig from './get-generated-files/get-release'
import getRenovateConfig from './get-generated-files/get-renovate'
import getVscodeConfig from './get-generated-files/get-vscode'
import getGitInfo from './get-git-info'

class Base {
  constructor(config = {}) {
    config.name = config.name
      ? pluginNameToPackageName(config.name, 'base-config')
      : packageName`@dword-design/base-config-node`
    config.package = config.package || {}

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
        $ npm install ${config.global ? '-g ' : ''}${config.package.name}

        # Yarn
        $ yarn ${config.global ? 'global ' : ''}add ${config.package.name}
        \`\`\`
      `,
      seeAlso: [],
      supportedNodeVersions: [14, 16, 18],
      syncKeywords: true,
    }
    let inheritedConfig = importCwd.silent(config.name) || require(config.name)

    const mergeOptions = {
      customMerge: key =>
        key === 'supportedNodeVersions' ? (a, b) => b : undefined,
    }
    if (typeof inheritedConfig === 'function') {
      inheritedConfig = inheritedConfig(
        deepmerge(defaultConfig, config, mergeOptions)
      )
    }
    this.config = deepmerge.all(
      [defaultConfig, inheritedConfig, config],
      mergeOptions
    )
    this.config.package = this.getPackageConfig()
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
