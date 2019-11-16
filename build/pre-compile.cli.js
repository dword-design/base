#!/usr/bin/env node

import { remove } from 'fs'
import { spawn } from 'child_process'
import { resolve } from 'path'
import resolveBin from 'resolve-bin'

(async () => {
  if (require(resolve(process.env.INIT_CWD || process.cwd(), 'package.json')).name === require('../package.json').name) {
    await remove('dist')
    await spawn(
      resolveBin.sync('@babel/cli', { executable: 'babel' }),
      ['--out-dir', 'dist', '--config-file', '@dword-design/babel-config', 'src'],
      { stdio: 'inherit' }
    )
  }
})()
