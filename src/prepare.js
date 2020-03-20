import outputFiles from 'output-files'
import glob from 'glob-promise'
import { remove } from 'fs-extra'
import { jsonToString, add, join, map, sortBy, identity, filter, unary } from '@dword-design/functions'
import ignore from 'ignore'
import allowedFilenames from './allowed-filenames.config'
import editorconfigConfig from './config-files/editorconfig.config'
import gitattributesConfig from './config-files/gitattributes.config'
import gitignoreConfig from './config-files/gitignore.config'
import githubWorkflowConfig from './config-files/github-workflow.config'
import gitpodConfig from './config-files/gitpod.config'
import gitpodDockerfile from './config-files/gitpod-dockerfile.config'
import commitizenConfig from './config-files/commitizen.config'
import renovateConfig from './config-files/renovate.config'
import semanticReleaseConfig from './config-files/semantic-release.config'
import packageConfig from './package-config'
import sortpackageJson from 'sort-package-json'
import readmeString from './readme-string'
import licenseString from './license-string'
import yaml from 'yaml'

export default async () => {

  const configFiles = {
    '.cz.json': commitizenConfig,
    '.editorconfig': editorconfigConfig,
    '.gitattributes': gitattributesConfig,
    '.github/workflows/build.yml': githubWorkflowConfig |> yaml.stringify,
    '.gitpod.Dockerfile': gitpodDockerfile,
    '.gitpod.yml': gitpodConfig,
    '.releaserc.json': semanticReleaseConfig,
    '.renovaterc.json': renovateConfig,
    '.gitignore': gitignoreConfig
      |> sortBy(identity)
      |> map(entry => `${entry}\n`)
      |> join(''),
    'LICENSE.md': licenseString,
    'package.json': packageConfig
      |> sortpackageJson
      |> jsonToString({ indent: 2 })
      |> add('\n'),
    'README.md': readmeString,
  }

  glob('*', { dot: true, ignore: allowedFilenames })
    |> await
    |> filter(ignore().add(gitignoreConfig).createFilter())
    |> map(unary(remove))
    |> Promise.all
    |> await

  await outputFiles(configFiles)
}