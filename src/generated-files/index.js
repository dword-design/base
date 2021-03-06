import { add, join, jsonToString, map } from '@dword-design/functions'
import sortKeys from 'sort-keys'
import sortPackageJson from 'sort-package-json'
import yaml from 'yaml'

import babelConfig from './babel'
import commitizenConfig from './commitizen'
import commitlintConfig from './commitlint'
import editorconfigConfig from './editorconfig'
import eslintConfig from './eslint'
import gitattributesConfig from './gitattributes'
import githubDeprecatedDependenciesConfig from './github-deprecated-dependencies'
import deprecatedDependenciesIssueTemplate from './github-deprecated-dependencies-issue-template'
import githubFunding from './github-funding'
import githubLabelsConfig from './github-labels'
import githubSyncLabelsConfig from './github-sync-labels'
import githubSyncMetadataConfig from './github-sync-metadata'
import githubWorkflowConfig from './github-workflow'
import gitignoreConfig from './gitignore'
import gitpodConfig from './gitpod'
import gitpodDockerfile from './gitpod-dockerfile'
import licenseString from './license-string'
import packageConfig from './package-config'
import readmeString from './readme-string'
import releaseConfig from './release'
import renovateConfig from './renovate'
import vscodeConfig from './vscode'

export default {
  '.babelrc.json': babelConfig |> jsonToString({ indent: 2 }),
  '.commitlintrc.json': commitlintConfig |> jsonToString({ indent: 2 }),
  '.cz.json': commitizenConfig,
  '.editorconfig': editorconfigConfig,
  '.eslintrc.json': `${eslintConfig |> jsonToString({ indent: 2 })}\n`,
  '.gitattributes': gitattributesConfig,
  '.github/DEPRECATED_DEPENDENCIES_ISSUE_TEMPLATE.md':
    deprecatedDependenciesIssueTemplate,
  '.github/FUNDING.yml': githubFunding |> yaml.stringify,
  '.github/labels.yml':
    sortKeys(githubLabelsConfig, { deep: true }) |> yaml.stringify,
  '.github/workflows/build.yml':
    sortKeys(githubWorkflowConfig, { deep: true }) |> yaml.stringify,
  '.github/workflows/deprecated-dependencies.yml':
    sortKeys(githubDeprecatedDependenciesConfig, { deep: true })
    |> yaml.stringify,
  '.github/workflows/sync-labels.yml':
    sortKeys(githubSyncLabelsConfig, { deep: true }) |> yaml.stringify,
  '.github/workflows/sync-metadata.yml':
    sortKeys(githubSyncMetadataConfig, { deep: true }) |> yaml.stringify,
  '.gitignore': gitignoreConfig |> map(entry => `${entry}\n`) |> join(''),
  '.gitpod.Dockerfile': gitpodDockerfile,
  '.gitpod.yml': gitpodConfig |> yaml.stringify,
  '.releaserc.json': releaseConfig |> jsonToString({ indent: 2 }),
  '.renovaterc.json':
    sortKeys(renovateConfig, { deep: true }) |> jsonToString({ indent: 2 }),
  '.vscode/settings.json': vscodeConfig |> jsonToString({ indent: 2 }),
  'LICENSE.md': licenseString,
  'README.md': readmeString,
  'package.json':
    packageConfig
    |> sortPackageJson
    |> jsonToString({ indent: 2 })
    |> add('\n'),
}
