const noop = require('@dword-design/functions/dist/noop')
const chokidar = require('chokidar')
const debounce = require('debounce')

exports.babelConfigFilename = require.resolve('../babel.config')
exports.eslintConfigFilename = require.resolve('../eslintrc')

exports.base = async ({ prepare: configPrepare, start: configStart } = {}) => {

  const { spawn, fork } = require('child-process-promise')
  const { remove } = require('fs-extra')
  const P = require('path')
  const nodeEnv = require('better-node-env')
  const { register, unregister } = require('./pre-commit')
  const initCwd = require('./init-cwd')

  configPrepare = configPrepare || (async () => {
    await remove('dist')
    await spawn('eslint', ['--config', require.resolve('../eslintrc'), '--ignore-path', '.gitignore', '.'], { stdio: 'inherit' })
    await spawn('babel', ['--out-dir', 'dist', '--config-file', require.resolve('../babel.config'), 'src'], { stdio: 'inherit' })
  })

  configStart = configStart || (() => {
    const watcher = chokidar.watch('src')
    watcher.on(
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
    return watcher
  })

  if (require(P.resolve(initCwd(), 'package.json')).name !== require('../package.json').name) {

    const prepare = async () => {
      await configPrepare()
      await spawn('mos', [], { stdio: 'inherit' })
    }

    const commandName = process.argv[2]

    try {
      await spawn('dw-config-files', [], { stdio: 'inherit' })

      switch (commandName) {
        case 'prepare':
          await prepare()
          break
        case 'test':
          await prepare()
          await fork(require.resolve('./depcheck.cli'), [])
          if (nodeEnv === 'development') {
            await spawn('install-self', [])
          }
          await spawn('nyc', ['--reporter', 'lcov', '--reporter', 'text', 'mocha', '--require', require.resolve('./pretest')], { stdio: 'inherit' })
          break
        case 'register':
          if (nodeEnv === 'development') {
            await register()
          }
          break
        case 'start':
          await configStart()
          break
        case 'unregister':
          if (nodeEnv === 'development') {
            await unregister()
          }
          break
        default:
          throw new Error(`Unknown command '${commandName}'.`)
      }
    } catch (error) {
      if (error.name !== 'ChildProcessError') {
        console.error(error)
      }
      process.exit(1)
    }
  }
}
