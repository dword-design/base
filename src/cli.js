#!/usr/bin/env node

import { spawn } from 'child_process'
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
      handler: () => spawn(
        'babel',
        ['src', '--out-dir', 'dist', '--config-file', path.resolve(packagePath, 'src/babel.config.js')],
        { stdio: 'inherit' }
      ),
    })
    .argv
  )
