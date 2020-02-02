import gitignoreConfig from './gitignore.config'
import isWorkspaceRoot from '@dword-design/is-workspace-root'
import { copyFile, outputFile, readFile } from 'fs-extra'
import P from 'path'
import { join, map, sortBy, identity, jsonToString } from '@dword-design/functions'
import getPackageString from './get-package-string'
import { spawn } from 'child-process-promise'
import badges from './badges.config'
import withLocalTmpDir from 'with-local-tmp-dir'
import { readFileSync as safeReadFileSync } from 'safe-readfile'

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
      safeReadFileSync(P.join('..', 'README.md'), 'utf8')
        ?? (await readFile(P.resolve(__dirname, 'config-files', 'README.md'))),
    )
    await copyFile(P.resolve(__dirname, 'config-files', 'LICENSE.md'), 'LICENSE.md')
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

  return {
    '.gitignore': gitignoreConfig |> sortBy(identity) |> map(entry => `${entry}\n`) |> join(''),
    'package.json': packageJsonString,
    ...isWorkspaceRoot
      ? {
        '.editorconfig': await readFile(P.resolve(__dirname, 'config-files', 'editorconfig'), 'utf8'),
        '.gitpod.yml': await readFile(P.resolve(__dirname, 'config-files', 'gitpod.yml'), 'utf8'),
        '.renovaterc.json': await readFile(P.resolve(__dirname, 'config-files', 'renovaterc.json'), 'utf8'),
        '.travis.yml': await readFile(P.resolve(__dirname, 'config-files', 'travis.yml'), 'utf8'),
      }
      : {},
    ...markdownFiles,
  }
}