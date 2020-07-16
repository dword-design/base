import { add, join, jsonToString, map } from '@dword-design/functions'
import sortPackageJson from 'sort-package-json'
import yaml from 'yaml'

import babelConfig from './babel'
import commitizenConfig from './commitizen'
import editorconfigConfig from './editorconfig'
import gitattributesConfig from './gitattributes.config'
import githubWorkflowConfig from './github-workflow.config'
import gitignoreConfig from './gitignore.config'
import gitpodDockerfile from './gitpod-dockerfile.config'
import gitpodConfig from './gitpod.config'
import licenseString from './license-string'
import packageConfig from './package-config'
import readmeString from './readme-string'
import releaseConfig from './release.config'
import renovateConfig from './renovate.json'
import vscodeConfig from './vscode.config'

export default {
  '.babelrc.json': babelConfig |> jsonToString({ indent: 2 }),
  '.cz.json': commitizenConfig,
  '.editorconfig': editorconfigConfig,
  '.gitattributes': gitattributesConfig,
  '.github/workflows/build.yml': githubWorkflowConfig |> yaml.stringify,
  '.gitignore': gitignoreConfig |> map(entry => `${entry}\n`) |> join(''),
  '.gitpod.Dockerfile': gitpodDockerfile,
  '.gitpod.yml': gitpodConfig,
  '.releaserc.json': releaseConfig |> jsonToString({ indent: 2 }),
  '.renovaterc.json': renovateConfig |> jsonToString({ indent: 2 }),
  '.vscode/settings.json': vscodeConfig |> jsonToString({ indent: 2 }),
  'LICENSE.md': licenseString,
  'README.md': readmeString,
  'package.json':
    packageConfig
    |> sortPackageJson
    |> jsonToString({ indent: 2 })
    |> add('\n'),
}
