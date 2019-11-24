import P from 'path'
import { copyFile, remove, rename, outputFile } from 'fs'
import { spawn, fork } from 'child_process'
import chokidar from 'chokidar'
import debounce from 'debounce'
import nodeEnv from 'node-env'
import resolveBin from 'resolve-bin'
import projectzConfig from './projectz.config'
import safeRequire from 'safe-require'
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex'
import { readFileSync as safeReadFileSync } from 'safe-readfile'
import { filter, join } from '@functions'

export default ({ prepare: configPrepare, start: configStart }) => {

  configPrepare = configPrepare || (async () => {
    try {
      await spawn(resolveBin.sync('eslint'), ['--config', require.resolve('@dword-design/eslint-config'), '--ignore-path', '.gitignore', '.'], { stdio: 'inherit' })
      await spawn(resolveBin.sync('@babel/cli', { executable: 'babel' }), ['--out-dir', 'dist-new', '--config-file', require.resolve('@dword-design/babel-config'), '--copy-files', 'src'], { stdio: 'inherit' })
      await remove('dist')
      await rename('dist-new', 'dist')
    } catch (error) {
      await remove('dist')
      throw error
    }
  })

  configStart = configStart || (() => chokidar
    .watch('src')
    .on(
      'all',
      debounce(
        async () => {
          try {
            await configPrepare()
          } catch (error) {
            if (error.name !== 'ChildProcessError') {
              console.log(error)
            }
          }
        },
        200
      )
    )
  )

  const prepareFiles = async () => {
    console.log('Copying config files …')
    await copyFile(P.resolve(__dirname, 'config-files', 'editorconfig'), '.editorconfig')
    await copyFile(P.resolve(__dirname, 'config-files', 'gitignore'), '.gitignore')
    await copyFile(P.resolve(__dirname, 'config-files', 'gitpod.yml'), '.gitpod.yml')
    if ((safeRequire(P.join(process.cwd(), 'package.json'))?.license ?? '') !== '') {
      await copyFile(P.resolve(__dirname, 'config-files', 'LICENSE.md'), 'LICENSE.md')
    }
    await copyFile(P.resolve(__dirname, 'config-files', 'renovaterc.json'), '.renovaterc.json')
    await copyFile(P.resolve(__dirname, 'config-files', 'travis.yml'), '.travis.yml')
    console.log('Updating README.md …')
    const readmeContent = safeReadFileSync('README.md') ?? ''
    const missingReadmeSections = ['TITLE', 'BADGES', 'DESCRIPTION', 'INSTALL', 'LICENSE']
      |> filter(sectionName => !getProjectzReadmeSectionRegex(sectionName).test(readmeContent))
    if (missingReadmeSections.length > 0) {
      throw new Error(`The README.md file is missing or misses the following sections: ${missingReadmeSections |> join(', ')}`)
    }
    try {
      await outputFile('projectz.json', JSON.stringify(projectzConfig, undefined, 2))
      await spawn(resolveBin.sync('projectz'), ['compile'], { capture: ['stdout'] })
    } catch (error) {
      console.log(error.stdout)
      throw error
    } finally {
      await remove('projectz.json')
    }
  }

  const prepare = async () => {
    await prepareFiles()
    return configPrepare()
  }

  return {
    prepare: {
      handler: () => prepare(),
    },
    test: {
      handler: async () => {
        await prepare()
        await fork(require.resolve('./depcheck.cli'), [])
        if (nodeEnv === 'development') {
          await spawn(resolveBin.sync('install-self'), [])
        }
        await spawn(
          resolveBin.sync('nyc'),
          [
            '--reporter', 'lcov',
            '--reporter', 'text',
            '--cwd', process.cwd(),
            resolveBin.sync('mocha-per-file'),
            '--require', require.resolve('./pretest'),
          ],
          { stdio: 'inherit' }
        )
      },
    },
    start: {
      handler: async () => {
        await prepareFiles()
        return configStart()
      },
    },
  }
}
