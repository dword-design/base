import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import { outputFile } from 'fs-extra'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFile('src/index.js', 'export default 1')
  await spawn('base', ['build'])
  await spawn('base', ['test'])
})
