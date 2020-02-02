import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'
import { outputFile } from 'fs-extra'
import expect from 'expect'
import testConfigFiles from '../../src/test-config-files'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFile('package.json', endent`
    {
      "bin": {
        "foo": "./src/cli.js"
      }
    }
  `)
  let message
  try {
    await testConfigFiles()
  } catch (error) {
    message = error.message
  }
  expect(message).toMatch('data.bin[\'foo\'] should match pattern')
})
