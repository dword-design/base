import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'
import { outputFile } from 'fs-extra'
import expect from 'expect'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFile('package.json', endent`
    {
      "name": "_foo"
    }
  `)
  await spawn('base', ['prepare'])
  let stdout
  try {
    await spawn('base', ['test'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toMatch('data.name should match pattern')
})
