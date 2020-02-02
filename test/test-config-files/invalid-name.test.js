import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'
import { outputFile } from 'fs-extra'
import expect from 'expect'
import testConfigFiles from '../../src/test-config-files'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFile('package.json', endent`
    {
      "name": "_foo"
    }
  `)
  let message
  try {
    await testConfigFiles()
  } catch (error) {
    message = error.message
  }
  expect(message).toMatch('data.name should match pattern')
})
