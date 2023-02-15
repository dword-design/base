import { join, jsonToString, map } from '@dword-design/functions'
import sortKeys from 'sort-keys'
import sortPackageJson from 'sort-package-json'
import yaml from 'yaml'

import babelConfig from './babel.js'
import commitizenConfig from './commitizen.js'
import commitlintConfig from './commitlint.js'
import editorconfigConfig from './editorconfig.js'
import gitattributesConfig from './gitattributes.js'
import githubDeprecatedDependenciesConfig from './github-deprecated-dependencies/index.js'
import deprecatedDependenciesIssueTemplate from './github-deprecated-dependencies-issue-template.js'
import githubFunding from './github-funding.js'
import githubLabelsConfig from './github-labels.js'
import githubSyncLabelsConfig from './github-sync-labels.js'
import gitpodConfig from './gitpod.js'

export default function () {
  const packageConfig = this.getPackageConfig()

  return {
    '.babelrc.json': `${babelConfig |> jsonToString({ indent: 2 })}\n`,
    '.commitlintrc.json': `${
      commitlintConfig |> jsonToString({ indent: 2 })
    }\n`,
    '.cz.json': `${commitizenConfig |> jsonToString({ indent: 2 })}\n`,
    '.devcontainer/devcontainer.json': `${
      this.getGithubCodespacesConfig() |> jsonToString({ indent: 2 })
    }\n`,
    '.editorconfig': editorconfigConfig,
    '.eslintrc.json': `${
      this.getEslintConfig() |> jsonToString({ indent: 2 })
    }\n`,
    '.gitattributes': gitattributesConfig,
    '.github/DEPRECATED_DEPENDENCIES_ISSUE_TEMPLATE.md':
      deprecatedDependenciesIssueTemplate,
    '.github/FUNDING.yml': githubFunding |> yaml.stringify,
    '.github/labels.yml':
      sortKeys(githubLabelsConfig, { deep: true }) |> yaml.stringify,
    '.github/workflows/build.yml':
      sortKeys(this.getGithubWorkflowConfig(), { deep: true })
      |> yaml.stringify,
    '.github/workflows/deprecated-dependencies.yml':
      sortKeys(githubDeprecatedDependenciesConfig, { deep: true })
      |> yaml.stringify,
    '.github/workflows/sync-labels.yml':
      sortKeys(githubSyncLabelsConfig, { deep: true }) |> yaml.stringify,
    '.github/workflows/sync-metadata.yml':
      sortKeys(this.getGithubSyncMetadataConfig(), { deep: true })
      |> yaml.stringify,
    '.gitignore':
      this.getGitignoreConfig() |> map(entry => `${entry}\n`) |> join(''),
    '.gitpod.Dockerfile': this.getGitpodDockerfile(),
    '.gitpod.yml': gitpodConfig |> yaml.stringify,
    '.releaserc.json': `${
      this.getReleaseConfig() |> jsonToString({ indent: 2 })
    }\n`,
    '.renovaterc.json': `${
      sortKeys(this.getRenovateConfig(), { deep: true })
      |> jsonToString({ indent: 2 })
    }\n`,
    '.vscode/settings.json': `${
      this.getVscodeConfig() |> jsonToString({ indent: 2 })
    }\n`,
    'LICENSE.md': this.getLicenseString(),
    'README.md': this.getReadmeString(),
    'package.json': `${
      packageConfig |> sortPackageJson |> jsonToString({ indent: 2 })
    }\n`,
  }
}
