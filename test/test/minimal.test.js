import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import filesConfig from '../files.config'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles(filesConfig)
  await spawn('base', ['build'])
  await spawn('base', ['test'])
})
