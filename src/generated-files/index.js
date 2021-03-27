import { add, join, jsonToString, map } from '@dword-design/functions'
import sortKeys from 'sort-keys'
import sortPackageJson from 'sort-package-json'
import yaml from 'yaml'

import babelConfig from './babel'
import commitizenConfig from './commitizen'
import commitlintConfig from './commitlint'
import editorconfigConfig from './editorconfig'
import gitattributesConfig from './gitattributes'
import githubWorkflowConfig from './github-workflow'
import gitignoreConfig from './gitignore'
import gitpodConfig from './gitpod'
import gitpodDockerfile from './gitpod-dockerfile'
import huskyConfig from './husky'
import licenseString from './license-string'
import packageConfig from './package-config'
import readmeString from './readme-string'
import releaseConfig from './release'
import renovateConfig from './renovate'
import vscodeConfig from './vscode'
import deprecatedDependenciesIssueTemplate from './github-deprecated-dependencies-issue-template'

export default {
  '.babelrc.json': babelConfig |> jsonToString({ indent: 2 }),
  '.commitlintrc.json': commitlintConfig |> jsonToString({ indent: 2 }),
  '.cz.json': commitizenConfig,
  '.editorconfig': editorconfigConfig,
  '.gitattributes': gitattributesConfig,
  '.github': {
    'DEPRECATED_DEPENDENCIES_ISSUE_TEMPLATE.md': deprecatedDependenciesIssueTemplate,
    'workflows/build.yml':
      sortKeys(githubWorkflowConfig, { deep: true }) |> yaml.stringify,
  },
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
