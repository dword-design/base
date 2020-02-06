import withLocalTmpDir from 'with-local-tmp-dir'
import { outputFile } from 'fs-extra'
import { endent } from '@dword-design/functions'
import stealthyRequire from 'stealthy-require'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFile('package.json', endent`
    {
      "baseConfig": "foo",
      "devDependencies": {
        "base-config-foo": "^1.0.0"
      }
    }

  `)
  const configName = stealthyRequire(require.cache, () => require('../../src/config-name'))
  expect(configName).toEqual('base-config-foo')
})
