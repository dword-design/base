import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { endent } from '@dword-design/functions'
import { outputFile } from 'fs-extra'
import prepare from '../../src/prepare'
import testConfigFiles from '../../src/test-config-files'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFile('README.md', endent`
    <!-- TITLE -->

    <!-- BADGES -->

    <!-- LICENSE -->

  `)
  await prepare()
  let message
  try {
    await testConfigFiles()
  } catch (error) {
    message = error.message
  }
  expect(message).toEqual('The README.md file is missing or misses the following sections: DESCRIPTION, INSTALL')
})
