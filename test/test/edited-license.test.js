import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import filesConfig from '../files.config'
import { outputFile } from 'fs-extra'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles(filesConfig)
  await spawn('base', ['build'])
  await outputFile('LICENSE.md', 'foo')
  let stderr
  try {
    await spawn('base', ['test'], { capture: ['stderr'] })
  } catch (error) {
    stderr = error.stderr
  }
  expect(stderr).toEqual('LICENSE.md file must be generated. Maybe it has been accidentally modified.\n')
})
