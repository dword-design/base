#!/usr/bin/env node

import { spawn } from 'child-process-promise'
import path from 'path'
import readPkgUp from 'read-pkg-up'
import yargs from 'yargs'

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
          ['.', '--config', path.resolve(packagePath, 'dist/eslintrc.js')],
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
