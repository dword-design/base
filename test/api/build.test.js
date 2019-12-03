import { spawn } from 'child_process'
import outputFiles from 'output-files'
import { endent } from '@functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { resolve } from 'path'
import { minimalProjectConfig } from '@dword-design/base'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'cli.js': endent`
      #!/usr/bin/env node

      const { base } = require('@dword-design/base')
      const { outputFile } = require('fs-extra')
      const { join } = require('path')

      base({ build: () => outputFile(join('dist', 'index.js'), 'module.exports = \'foo\'') })
    `,
  })
  await spawn('node', ['cli.js', 'build'])
  expect(require(resolve('dist'))).toEqual('foo')
})

export const timeout = 20000
