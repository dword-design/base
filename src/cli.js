#!/usr/bin/env node

const { spawn } = require('child-process-promise')
const path = require('path')
const readPkgUp = require('read-pkg-up')
const yargs = require('yargs')
const { reduce } = require('lodash')
const { paramCase } = require('change-case')

Promise.all([readPkgUp({ cwd: __dirname }), readPkgUp()])
  .then(([{ path: packageFilePath }, { package: { type = 'lib' } }]) =>
    ({ packagePath: path.dirname(packageFilePath), type })
  )
  .then(({ packagePath, type }) => {

    const commands = {
      lint: () => spawn(
        'eslint',
        ['.', '--config', path.resolve(packagePath, 'src/eslintrc.js'), '--ignore-path', path.resolve(packagePath, 'src/gitignore')],
        { stdio: 'inherit' },
      ),
      lintStaged: () => spawn(
        'lint-staged',
        ['.', '--config', path.resolve(packagePath, 'src/lint-staged.config.js')],
        { stdio: 'inherit' },
      ),
      build: () => spawn(
        'webpack',
        ['--config', path.resolve(packagePath, `src/webpack.${type}.config.js`)],
        { stdio: 'inherit' },
      ),
      start: () => {
        const { cmd, params } = {
          lib: {
            cmd: 'webpack',
            params: ['--watch', '--config', path.resolve(packagePath, 'src/webpack.lib.start.config.js')],
          },
          web: {
            cmd: 'webpack-dev-server',
            params: ['--config', path.resolve(packagePath, 'src/webpack.web.config.js')],
          }
        }[type]
        return spawn(cmd, params, { stdio: 'inherit' })
      },
    }

    return reduce(
      commands,
      (result, handler, name) => result.command({ command: paramCase(name), handler: () => handler().catch(() => {}) }),
      yargs
    ).argv
  })
