import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import { outputFile } from 'fs-extra'
import expect from 'expect'
import filesConfig from '../files.config'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles(filesConfig)
  await spawn('base', ['build'])
  await outputFile('src/test.json', endent`
    {
    "foo": "bar"
    }
  `)
  let stdout
  try {
    await spawn('base', ['test'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toMatch('Format Error: expected "  "')
})
