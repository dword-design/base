import { spawn } from 'child_process'
import outputFiles from 'output-files'
import { endent } from '@functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import waitForChange from 'wait-for-change'
import importFresh from 'import-fresh'
import { resolve, join } from 'path'
import { writeFile } from 'fs'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'project-prepare/src/index.js': 'export default 1',
    'project-start/src/index.js': 'export default 1',
    'cli.js': endent`
      #!/usr/bin/env node

      const { base } = require('@dword-design/base')

      base()
    `,
  })
  await spawn('node', ['../cli.js', 'prepare'], { cwd: 'project-prepare' })
  expect(require(resolve('project-prepare', 'dist'))).toEqual(1)

  const childProcess = spawn('node', ['../cli.js', 'start'], { cwd: 'project-start' })
    .catch(error => {
      if (error.code !== null) {
        throw error
      }
    })
    .childProcess
  try {
    await waitForChange(join('project-start', 'dist', 'index.js'))
    expect(require(resolve('project-start', 'dist'))).toEqual(1)
    await writeFile(join('project-start', 'src', 'index.js'), 'export default 2')
    await waitForChange(join('project-start', 'dist', 'index.js'))
    expect(importFresh(resolve('project-start', 'dist'))).toEqual(2)
  } finally {
    childProcess.kill()
  }
})
export const timeout = 20000
