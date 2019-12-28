import { spawn } from 'child-process-promise'
import gitignoreConfig from './gitignore.config'
import isWorkspaceRoot from '@dword-design/is-workspace-root'
import { copyFile, outputFile, remove, exists } from 'fs-extra'
import P from 'path'
import { join, map, sortBy, identity } from '@dword-design/functions'
import projectzConfig from './projectz.config'

export default async () => {
  if (isWorkspaceRoot) {
    await copyFile(P.resolve(__dirname, 'config-files', 'editorconfig'), '.editorconfig')
    await copyFile(P.resolve(__dirname, 'config-files', 'gitpod.yml'), '.gitpod.yml')
    await copyFile(P.resolve(__dirname, 'config-files', 'renovaterc.json'), '.renovaterc.json')
    await copyFile(P.resolve(__dirname, 'config-files', 'travis.yml'), '.travis.yml')
  }
  await outputFile('.gitignore', gitignoreConfig |> sortBy(identity) |> map(entry => `${entry}\n`) |> join(''))
  await copyFile(P.resolve(__dirname, 'config-files', 'LICENSE.md'), 'LICENSE.md')
  if (!(await exists('README.md'))) {
    await copyFile(P.resolve(__dirname, 'config-files', 'README.md'), 'README.md')
  }
  await outputFile('projectz.json', JSON.stringify(projectzConfig, undefined, 2))
  try {
    await spawn('projectz', ['compile'], { capture: ['stdout'] })
  } catch (error) {
    console.log(error.stdout)
    throw error
  } finally {
    await remove('projectz.json')
  }
}
