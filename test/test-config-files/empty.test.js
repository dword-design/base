import withLocalTmpDir from 'with-local-tmp-dir'
import prepare from '../../src/prepare'
import testConfigFiles from '../../src/test-config-files'

export default () => withLocalTmpDir(async () => {
  await prepare()
  await testConfigFiles()
})
