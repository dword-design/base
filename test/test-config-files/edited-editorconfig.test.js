import withLocalTmpDir from 'with-local-tmp-dir'
import { outputFile } from 'fs-extra'
import prepare from '../../src/prepare'
import testConfigFiles from '../../src/test-config-files'

export default () => withLocalTmpDir(__dirname, async () => {
  await prepare()
  await outputFile('.editorconfig', '')
  await testConfigFiles()
})
