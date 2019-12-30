import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { outputFile } from 'fs-extra'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFile('src/index.js', 'export default 1')
  await spawn('base', ['build'])
  await outputFile('src/index.js', 'export default 1;')

  let stdout
  try {
    await spawn('base', ['test'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toMatch('error  Extra semicolon  semi')
})
