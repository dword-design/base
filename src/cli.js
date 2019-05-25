#!/usr/bin/env node

const { spawn } = require('child-process-promise')
const path = require('path')
const readPkgUp = require('read-pkg-up')
const yargs = require('yargs')

const lint = ({ packagePath }) => spawn(
  'eslint',
  ['.', '--config', path.resolve(packagePath, 'src/eslintrc.js'), '--ignore-path', path.resolve(packagePath, 'src/gitignore')],
  { stdio: 'inherit' }
)

const build = context => {
  const { packagePath } = context
  return lint(context)
    .then(() => spawn(
      'babel',
      ['src', '--out-dir', 'dist', '--config-file', path.resolve(packagePath, 'src/babel.config.js')],
      { stdio: 'inherit' }
    ))
}

Promise.all([readPkgUp({ cwd: __dirname }), readPkgUp()])
  .then(([{ path: packageFilePath }, { package: { type = 'node' } }]) =>
    ({ packagePath: path.dirname(packageFilePath), type })
  )
  .then(context => {
    const { packagePath } = context
    yargs
      .command({ command: 'lint', handler: () => lint(context).catch(() => {}) })
      .command({ command: 'build', handler: () => build(context).catch(() => {}) })
      .argv
  })
