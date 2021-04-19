import { add, join, jsonToString, map } from '@dword-design/functions'
import sortKeys from 'sort-keys'
import sortPackageJson from 'sort-package-json'
import yaml from 'yaml'

import config from '@/src/config.mjs'

import babelConfig from './babel.mjs'
import commitizenConfig from './commitizen.mjs'
import commitlintConfig from './commitlint.mjs'
import editorconfigConfig from './editorconfig.mjs'
import gitattributesConfig from './gitattributes.mjs'
import githubDeprecatedDependenciesConfig from './github-deprecated-dependencies.mjs'
import deprecatedDependenciesIssueTemplate from './github-deprecated-dependencies-issue-template.mjs'
import githubSyncMetadataConfig from './github-sync-metadata.mjs'
import githubWorkflowConfig from './github-workflow/index.mjs'
import gitignoreConfig from './gitignore.mjs'
import gitpodConfig from './gitpod.mjs'
import gitpodDockerfile from './gitpod-dockerfile.mjs'
import huskyConfig from './husky.mjs'
import licenseString from './license-string.mjs'
import packageConfig from './package-config.mjs'
import readmeString from './readme-string/index.mjs'
import releaseConfig from './release.mjs'
import renovateConfig from './renovate.mjs'
import vscodeConfig from './vscode.mjs'

export default {
  '.babelrc.json': babelConfig |> jsonToString({ indent: 2 }),
  '.commitlintrc.json': commitlintConfig |> jsonToString({ indent: 2 }),
  '.cz.json': commitizenConfig,
  '.editorconfig': editorconfigConfig,
  '.gitattributes': gitattributesConfig,
  '.github/DEPRECATED_DEPENDENCIES_ISSUE_TEMPLATE.md': deprecatedDependenciesIssueTemplate,
  '.github/workflows/build.yml':
    sortKeys(githubWorkflowConfig, { deep: true }) |> yaml.stringify,
  '.github/workflows/deprecated-dependencies.yml':
    sortKeys(githubDeprecatedDependenciesConfig, { deep: true })
    |> yaml.stringify,
  ...(config.syncMetadata && {
    '.github/workflows/sync-metadata.yml':
      sortKeys(githubSyncMetadataConfig, { deep: true }) |> yaml.stringify,
  }),
  '.gitignore': gitignoreConfig |> map(entry => `${entry}\n`) |> join(''),
  '.gitpod.Dockerfile': gitpodDockerfile,
  '.gitpod.yml': gitpodConfig |> yaml.stringify,
  '.huskyrc.json': huskyConfig |> jsonToString({ indent: 2 }),
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
