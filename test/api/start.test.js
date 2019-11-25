import { spawn } from 'child_process'
import outputFiles from 'output-files'
import { endent } from '@functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import waitForChange from 'wait-for-change'
import importFresh from 'import-fresh'
import { resolve, join } from 'path'
import { writeFile } from 'fs'
import { minimalProjectConfig } from '@dword-design/base'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'src/index.js': 'export default 1',
    'cli.js': endent`
      #!/usr/bin/env node

      const { base } = require('@dword-design/base')
      const { outputFile } = require('fs-extra')
      const { join } = require('path')
      const chokidar = require('chokidar')
      const debounce = require('debounce')

      let counter = 1

      base({ start: () => chokidar
        .watch('src')
        .on('all', debounce(() => outputFile(join('dist', 'index.js'), 'module.exports = \'foo' + (counter++) + '\''), 200))
      })
    `,
  })
  const childProcess = spawn('node', ['cli.js', 'start'])
    .catch(error => {
      if (error.code !== null) {
        throw error
      }
    })
    .childProcess
  try {
    await waitForChange(join('dist', 'index.js'))
    expect(require(resolve('dist'))).toEqual('foo1')
    await writeFile(join('src', 'index.js'), 'export default 2')
    await waitForChange(join('dist', 'index.js'))
    expect(importFresh(resolve('dist'))).toEqual('foo2')
  } finally {
    childProcess.kill()
  }
})

export const timeout = 20000
