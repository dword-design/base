import outputFiles from 'output-files'
import { spawn } from 'child_process'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { resolve } from 'path'
import { writeFile } from 'fs'
import waitForChange from 'wait-for-change'
import delay from 'delay'
import { minimalProjectConfig } from '@dword-design/base'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'src/index.js': 'export default 1',
  })
  const childProcess = spawn('base', ['start'], { capture: ['stdout', 'stderr'] })
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
