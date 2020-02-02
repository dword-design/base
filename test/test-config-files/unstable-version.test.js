import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'
import { outputFile } from 'fs-extra'
import expect from 'expect'
import prepare from '../../src/prepare'
import testConfigFiles from '../../src/test-config-files'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFile('package.json', endent`
    {
      "version": "0.1.0"
    }
  `)
  await prepare()
  let message
  try {
    await testConfigFiles()
  } catch (error) {
    message = error.message
  }
  expect(message).toMatch('data.version should match pattern')
})
