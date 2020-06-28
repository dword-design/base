import {
  add,
  filter,
  join,
  jsonToString,
  map,
  unary,
} from '@dword-design/functions'
import { remove } from 'fs-extra'
import globby from 'globby'
import ignore from 'ignore'
import outputFiles from 'output-files'
import sortPackageJson from 'sort-package-json'
import yaml from 'yaml'

import allowedMatches from './allowed-matches'
import config from './config'
import babelConfig from './config-files/babel'
import commitizenConfig from './config-files/commitizen'
import editorconfigConfig from './config-files/editorconfig'
import gitattributesConfig from './config-files/gitattributes.config'
import githubWorkflowConfig from './config-files/github-workflow.config'
import gitignoreConfig from './config-files/gitignore.config'
import gitpodDockerfile from './config-files/gitpod-dockerfile.config'
import gitpodConfig from './config-files/gitpod.config'
import releaseConfig from './config-files/release.config'
import renovateConfig from './config-files/renovate.config'
import vscodeConfig from './config-files/vscode.config'
import licenseString from './license-string'
import packageConfig from './package-config'
import readmeString from './readme-string'

export default async () => {
  await (globby('*', { onlyFiles: false, dot: true, ignore: allowedMatches })
    |> await
    |> filter(ignore().add(gitignoreConfig).createFilter())
    |> map(unary(remove))
    |> Promise.all)
  await outputFiles({
    '.babelrc.json': babelConfig |> jsonToString({ indent: 2 }),
    '.cz.json': commitizenConfig,
    '.editorconfig': editorconfigConfig,
    '.gitattributes': gitattributesConfig,
    '.github/workflows/build.yml': githubWorkflowConfig |> yaml.stringify,
    '.gitpod.Dockerfile': gitpodDockerfile,
    '.gitpod.yml': gitpodConfig,
    '.releaserc.json': releaseConfig |> jsonToString({ indent: 2 }),
    '.renovaterc.json': renovateConfig,
    '.gitignore': gitignoreConfig |> map(entry => `${entry}\n`) |> join(''),
    '.vscode/settings.json': vscodeConfig |> jsonToString({ indent: 2 }),
    'LICENSE.md': licenseString,
    'package.json':
      packageConfig
      |> sortPackageJson
      |> jsonToString({ indent: 2 })
      |> add('\n'),
    'README.md': readmeString,
  })
  await config.prepare()
}
