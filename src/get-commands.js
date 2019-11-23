import { resolve } from 'path'
import { copyFile, remove, rename, outputFile } from 'fs'
import { spawn, fork } from 'child_process'
import chokidar from 'chokidar'
import debounce from 'debounce'
import { map } from '@functions'
import nodeEnv from 'node-env'
import resolveBin from 'resolve-bin'
import projectzConfig from './projectz.config'
import glob from 'glob-promise'

export default ({ prepare: configPrepare, start: configStart }) => {

  configPrepare = configPrepare || (async () => {
    try {
      await spawn(resolveBin.sync('eslint'), ['--config', require.resolve('@dword-design/eslint-config'), '--ignore-path', '.gitignore', '.'], { stdio: 'inherit' })
      await spawn(resolveBin.sync('@babel/cli', { executable: 'babel' }), ['--out-dir', 'dist-new', '--config-file', require.resolve('@dword-design/babel-config'), 'src'], { stdio: 'inherit' })
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
    await glob('*', { cwd: resolve(__dirname, '..', 'config-files') })
      .then(filenames => Promise.all(
        filenames |> map(filename => copyFile(resolve(__dirname, '..', 'config-files', filename), `.${filename}`))
      ))

    console.log('Updating README.md …')
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
