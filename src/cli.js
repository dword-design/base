#!/usr/bin/env node

(async () => {
  const { spawn, fork } = require('child-process-promise')
  const { remove, copyFile } = require('fs-extra')
  const P = require('path')
  const { register, unregister } = require('./pre-commit')
  const nodeEnv = require('better-node-env')
  const chokidar = require('chokidar')
  const debounce = require('debounce')

  const build = async () => {
    await remove('dist')
    await spawn('eslint', ['--config', require.resolve('../eslintrc'), '--ignore-path', '.gitignore', '.'], { stdio: 'inherit' })
    await spawn('babel', ['--out-dir', 'dist', '--config-file', require.resolve('../babel.config'), 'src'], { stdio: 'inherit' })
  }

  const commandName = process.argv[2]

  try {
    await spawn('dw-config-files', [])
    await copyFile(P.resolve(__dirname, '..', 'travis.config.yml'), '.travis.yml')

    switch (commandName) {
      case undefined:
      case 'build':
        await build()
        break
      case 'pre-commit':
        await build()
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
        const watcher = chokidar.watch('src')
        watcher.on(
          'all',
          debounce(
            async () => {
              try {
                await build()
              } catch (error) {
                if (error.name !== 'ChildProcessError') {
                  console.log(error)
                }
              }
            },
            200
          )
        )
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
})()
