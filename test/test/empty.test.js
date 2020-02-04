import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(async () => {
  await spawn('base', ['prepare'])
  await spawn('base', ['test'])
})
