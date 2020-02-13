import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import workspaceGlob from './workspace-glob'
import glob from 'glob-promise'
import { outputFile, readFile, remove } from 'fs-extra'
import P from 'path'
import { join, map, sortBy, identity, jsonToString, filter, unary } from '@dword-design/functions'
import badges from './badges.config'
import withLocalTmpDir from 'with-local-tmp-dir'
import { readFileSync as safeReadFileSync } from 'safe-readfile'
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
import license from './config-files/license.config'
import readme from './config-files/readme.config'
import getPackageString from './get-package-string'
import isWorkspaceRoot from '@dword-design/is-workspace-root'

export default async () => {

  const packageJsonString = await getPackageString()

  const markdownFiles = await withLocalTmpDir(async () => {
    await outputFile(
      'package.json',
      {
        name: 'base-project',
        repository: 'base/project',
        ...JSON.parse(packageJsonString),
        badges: {
          list: badges,
        },
      }
        |> jsonToString({ indent: 2 }),
    )
    await outputFile(
      'README.md',
      safeReadFileSync(P.join('..', 'README.md'), 'utf8') ?? readme,
    )
    await outputFile('LICENSE.md', license)
    try {
      await spawn('projectz', ['compile'], { capture: ['stdout'] })
      return {
        'LICENSE.md': await readFile('LICENSE.md', 'utf8'),
        'README.md': await readFile('README.md', 'utf8'),
      }
    } catch (error) {
      throw new Error(error.stdout)
    }
  })

  const configFiles = {
    ...isWorkspaceRoot
      ? {
        '.cz.json': commitizenConfig,
        '.editorconfig': editorconfigConfig,
        '.gitattributes': gitattributesConfig,
        '.github/workflows/node.yml': githubWorkflowConfig,
        '.gitpod.Dockerfile': gitpodDockerfile,
        '.gitpod.yml': gitpodConfig,
        '.releaserc.json': semanticReleaseConfig,
        '.renovaterc.json': renovateConfig,
      }
      : {},
    '.gitignore': gitignoreConfig
      |> sortBy(identity)
      |> map(entry => `${entry}\n`)
      |> join(''),
    'package.json': packageJsonString,
    ...markdownFiles,
  }

  glob('*', { dot: true, ignore: allowedFilenames })
    |> await
    |> filter(ignore().add(gitignoreConfig).createFilter())
    |> map(unary(remove))
    |> Promise.all
    |> await

  await outputFiles(configFiles)

  if (workspaceGlob !== undefined) {
    return spawn('wsrun', ['--stages', '--bin', require.resolve('./run-command.cli'), '-c', 'prepare'], { stdio: 'inherit' })
  }
}