#!/usr/bin/env node

const { spawn } = require('child-process-promise')
const path = require('path')
const readPkgUp = require('read-pkg-up')
const yargs = require('yargs')
const { reduce } = require('lodash')
const { paramCase } = require('change-case')

Promise.all([readPkgUp({ cwd: __dirname }), readPkgUp()])
  .then(([{ path: packageFilePath }, { package: { type = 'node' } }]) =>
    ({ packagePath: path.dirname(packageFilePath), type })
  )
  .then(({ packagePath }) => {

    const lint = () => spawn(
      'eslint',
      ['.', '--config', path.resolve(packagePath, 'src/eslintrc.js'), '--ignore-path', path.resolve(packagePath, 'src/gitignore')],
      { stdio: 'inherit' },
    )

    const commands = {
      lint,
      lintStaged: () => spawn(
        'lint-staged',
        ['.', '--config', path.resolve(packagePath, 'src/lint-staged.config.js')],
        { stdio: 'inherit' },
      ),
      // build: () => lint()
      //   .then(() => spawn(
      //     'babel',
      //     ['src', '--out-dir', 'dist', '--config-file', path.resolve(packagePath, 'src/babel.config.js')],
      //     { stdio: 'inherit' },
      //   )),
      build: () => spawn(
        'webpack',
        ['--config', path.resolve(packagePath, 'src/webpack.config.js')],
        { stdio: 'inherit' },
      ),
      start: () => spawn(
        'webpack',
        ['--watch', '--config', path.resolve(packagePath, 'src/webpack.start.config.js')],
        { stdio: 'inherit' },
      ),
    }

    return reduce(
      commands,
      (result, handler, name) => result.command({ command: paramCase(name), handler: () => handler().catch(() => {}) }),
      yargs
    ).argv
  })
