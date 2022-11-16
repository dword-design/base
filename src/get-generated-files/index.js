import { join, jsonToString, map } from '@dword-design/functions'
import sortKeys from 'sort-keys'
import sortPackageJson from 'sort-package-json'
import yaml from 'yaml'

import babelConfig from './babel'
import commitizenConfig from './commitizen'
import commitlintConfig from './commitlint'
import editorconfigConfig from './editorconfig'
import getEslintConfig from './get-eslint'
import gitattributesConfig from './gitattributes'
import githubDeprecatedDependenciesConfig from './github-deprecated-dependencies'
import deprecatedDependenciesIssueTemplate from './github-deprecated-dependencies-issue-template'
import githubFunding from './github-funding'
import githubLabelsConfig from './github-labels'
import githubSyncLabelsConfig from './github-sync-labels'
import getGithubSyncMetadataConfig from './get-github-sync-metadata'
import getGithubWorkflowConfig from './get-github-workflow'
import getGitignoreConfig from './get-gitignore'
import gitpodConfig from './gitpod'
import getGitpodDockerfile from './get-gitpod-dockerfile'
import getLicenseString from './get-license-string'
import getReadmeString from './get-readme-string'
import getReleaseConfig from './get-release'
import getRenovateConfig from './get-renovate'
import getVscodeConfig from './get-vscode'
import getPackageConfig from './get-package-config'

export default config => {
  const generatedPackageConfig = getPackageConfig(config)
  return {
    '.babelrc.json': `${babelConfig |> jsonToString({ indent: 2 })}\n`,
    '.commitlintrc.json': `${commitlintConfig |> jsonToString({ indent: 2 })}\n`,
    '.cz.json': `${commitizenConfig |> jsonToString({ indent: 2 })}\n`,
    '.editorconfig': editorconfigConfig,
    '.eslintrc.json': `${getEslintConfig(config) |> jsonToString({ indent: 2 })}\n`,
    '.gitattributes': gitattributesConfig,
    '.github/DEPRECATED_DEPENDENCIES_ISSUE_TEMPLATE.md':
      deprecatedDependenciesIssueTemplate,
    '.github/FUNDING.yml': githubFunding |> yaml.stringify,
    '.github/labels.yml':
      sortKeys(githubLabelsConfig, { deep: true }) |> yaml.stringify,
    '.github/workflows/build.yml':
      sortKeys(getGithubWorkflowConfig(config), { deep: true }) |> yaml.stringify,
    '.github/workflows/deprecated-dependencies.yml':
      sortKeys(githubDeprecatedDependenciesConfig, { deep: true })
      |> yaml.stringify,
    '.github/workflows/sync-labels.yml':
      sortKeys(githubSyncLabelsConfig, { deep: true }) |> yaml.stringify,
    '.github/workflows/sync-metadata.yml':
      sortKeys(getGithubSyncMetadataConfig(config), { deep: true }) |> yaml.stringify,
    '.gitignore': getGitignoreConfig(config) |> map(entry => `${entry}\n`) |> join(''),
    '.gitpod.Dockerfile': getGitpodDockerfile(config),
    '.gitpod.yml': gitpodConfig |> yaml.stringify,
    '.releaserc.json': `${getReleaseConfig(config) |> jsonToString({ indent: 2 })}\n`,
    '.renovaterc.json': `${
      sortKeys(getRenovateConfig(config), { deep: true }) |> jsonToString({ indent: 2 })
    }\n`,
    '.vscode/settings.json': `${getVscodeConfig(config) |> jsonToString({ indent: 2 })}\n`,
    'LICENSE.md': getLicenseString(config),
    'README.md': getReadmeString({ ...config, package: generatedPackageConfig }),
    'package.json': `${
      generatedPackageConfig |> sortPackageJson |> jsonToString({ indent: 2 })
    }\n`,
  }
}
