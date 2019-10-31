const configParameters = {
  eslintConfigFilename: require.resolve('../eslintrc'),
  babelConfigFilename: require.resolve('../babel.config'),
}

module.exports = async ({ prepare: configPrepare, start: configStart } = {}) => {

  const { spawn, fork } = require('child-process-promise')
  const { remove, copyFile } = require('fs-extra')
  const P = require('path')
  const nodeEnv = require('better-node-env')
  const chokidar = require('chokidar')
  const debounce = require('debounce')
  const { register, unregister } = require('./pre-commit')
  const initCwd = require('./init-cwd')

  if (require(P.resolve(initCwd(), 'package.json')).name !== require('../package.json').name) {

    const prepare = async () => {
      await configPrepare(configParameters)
      await spawn('mos', [], { stdio: 'inherit' })
    }

    const commandName = process.argv[2]

    try {
      await spawn('dw-config-files', [], { stdio: 'inherit' })
      await copyFile(P.resolve(__dirname, '..', 'travis.config.yml'), '.travis.yml')

      switch (commandName) {
        case undefined:
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
          await configStart(configParameters)
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
