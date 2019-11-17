import { register, unregister } from './pre-commit'
import { resolve } from 'path'
import { copyFile, remove } from 'fs'
import { spawn, fork } from 'child_process'
import chokidar from 'chokidar'
import debounce from 'debounce'
import glob from 'glob-promise'
import { map } from '@functions'
import nodeEnv from 'node-env'
import resolveBin from 'resolve-bin'

export default ({ prepare: configPrepare, start: configStart }) => {

  configPrepare = configPrepare || (async () => {
    await remove('dist')
    await spawn(resolveBin.sync('eslint'), ['--config', require.resolve('@dword-design/eslint-config'), '--ignore-path', '.gitignore', '.'], { stdio: 'inherit' })
    await spawn(resolveBin.sync('@babel/cli', { executable: 'babel' }), ['--out-dir', 'dist', '--config-file', require.resolve('@dword-design/babel-config'), 'src'], { stdio: 'inherit' })
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
    const configFiles = await glob('*', { cwd: resolve(__dirname, '..', 'config-files') })
    await Promise.all(configFiles |> map(filename => copyFile(resolve(__dirname, '..', 'config-files', filename), `.${filename}`)))
    await spawn(resolveBin.sync('mos'), [], { stdio: 'inherit' })
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
    register: {
      handler: () => register(),
    },
    start: {
      handler: async () => {
        await prepareFiles()
        return configStart()
      },
    },
    unregister: {
      handler: () => unregister(),
    },
  }
}
