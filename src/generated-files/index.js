import { add, join, jsonToString, map } from '@dword-design/functions'
import sortPackageJson from 'sort-package-json'
import yaml from 'yaml'

import babelConfig from './babel'
import commitizenConfig from './commitizen'
import editorconfigConfig from './editorconfig'
import gitattributesConfig from './gitattributes'
import githubWorkflowConfig from './github-workflow'
import gitignoreConfig from './gitignore'
import gitpodConfig from './gitpod'
import gitpodDockerfile from './gitpod-dockerfile'
import licenseString from './license-string'
import packageConfig from './package-config'
import readmeString from './readme-string'
import releaseConfig from './release'
import renovateConfig from './renovate.json'
import vscodeConfig from './vscode'

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
