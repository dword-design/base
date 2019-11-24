import outputFiles from 'output-files'
import { spawn } from 'child_process'
import resolveBin from 'resolve-bin'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { resolve } from 'path'
import { writeFile } from 'fs'
import waitForChange from 'wait-for-change'
import delay from 'delay'
import projectConfig from '../project-config'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...projectConfig,
    'src/index.js': 'export default 1',
  })
  const childProcess = spawn(
    resolveBin.sync('@dword-design/base', { executable: 'base' }),
    ['start'],
    { capture: ['stdout', 'stderr'] }
  )
    .catch(error => {
      expect(error.stdout).toMatch('error  Extra semicolon  semi')
      if (error.code !== null) {
        throw error
      }
    })
    .childProcess
  try {
    await waitForChange('dist/index.js')
    expect(require(resolve('dist'))).toEqual(1)
    await writeFile('src/index.js', 'export default 2;')
    await delay(3000)
  } finally {
    childProcess.kill()
  }
})

export const timeout = 20000
