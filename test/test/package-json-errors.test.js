import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import expect from 'expect'
import packageConfig from '../package.config'
import filesConfig from '../files.config'
import outputFiles from 'output-files'
import { omit } from '@dword-design/functions'
import { outputFile } from 'fs-extra'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles(filesConfig)
  await spawn('base', ['build'])
  await outputFile('package.json', JSON.stringify(packageConfig |> omit('name'), undefined, 2))
  let stdout
  try {
    await spawn('base', ['test'], { capture: ['stderr'] })
  } catch (error) {
    stdout = error.stderr
  }
  expect(stdout).toMatch('data should have required property \'name\'')
})
