import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'

export default () => withLocalTmpDir(__dirname, async () => {
  expect(require('../../src/config-name')).toEqual('@dword-design/base-config-node')
})