import {
  add,
  filter,
  identity,
  join,
  jsonToString,
  map,
  sortBy,
  unary,
} from '@dword-design/functions'
import { remove } from 'fs-extra'
import glob from 'glob-promise'
import ignore from 'ignore'
import outputFiles from 'output-files'
import sortPackageJson from 'sort-package-json'
import yaml from 'yaml'

import allowedMatches from './allowed-matches.config'
import config from './config'
import babelConfig from './config-files/babel.config'
import commitizenConfig from './config-files/commitizen.config'
import editorconfigConfig from './config-files/editorconfig.config'
import gitattributesConfig from './config-files/gitattributes.config'
import githubWorkflowConfig from './config-files/github-workflow.config'
import gitignoreConfig from './config-files/gitignore.config'
import gitpodDockerfile from './config-files/gitpod-dockerfile.config'
import gitpodConfig from './config-files/gitpod.config'
import releaseConfig from './config-files/release.config'
import renovateConfig from './config-files/renovate.config'
import vscodeConfig from './config-files/vscode.json'
import licenseString from './license-string'
import packageConfig from './package-config'
import readmeString from './readme-string'

export default async () => {
  await (glob('*', { dot: true, ignore: allowedMatches })
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
    '.gitignore':
      gitignoreConfig
      |> sortBy(identity)
      |> map(entry => `${entry}\n`)
      |> join(''),
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
