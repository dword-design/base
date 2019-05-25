#!/usr/bin/env node

const { spawn } = require('child-process-promise')
const path = require('path')
const readPkgUp = require('read-pkg-up')
const yargs = require('yargs')

Promise.all([readPkgUp({ cwd: __dirname }), readPkgUp()])
  .then(([{ path: packageFilePath }, { package: { type = 'node' } }]) =>
    ({ packagePath: path.dirname(packageFilePath), type })
  )
  .then(({ packagePath }) => yargs
    .command({
      command: 'build',
      handler: () => Promise.resolve()
        .then(() => spawn(
          'eslint',
          ['.', '--config', path.resolve(packagePath, 'src/eslintrc.js'), '--ignore-path', path.resolve(packagePath, 'src/gitignore')],
          { stdio: 'inherit' }
        ))
        .then(() => spawn(
          'babel',
          ['src', '--out-dir', 'dist', '--config-file', path.resolve(packagePath, 'src/babel.config.js')],
          { stdio: 'inherit' }
        ))
        .catch(() => {}),
    })
    .argv
  )
