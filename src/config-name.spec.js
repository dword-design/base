import withLocalTmpDir from 'with-local-tmp-dir'
import { outputFile } from 'fs-extra'
import { endent } from '@dword-design/functions'
import stealthyRequire from 'stealthy-require'

export default {
  empty: () => withLocalTmpDir(async () => {
    expect(require('../src/config-name')).toEqual('@dword-design/base-config-node')
  }),
  'short name no scope': () => withLocalTmpDir(async () => {
    await outputFile('package.json', endent`
      {
        "baseConfig": "foo",
        "devDependencies": {
          "base-config-foo": "^1.0.0"
        }
      }

    `)
    const configName = stealthyRequire(require.cache, () => require('../src/config-name'))
    expect(configName).toEqual('base-config-foo')
  }),
  'short name with scope': () => withLocalTmpDir(async () => {
    await outputFile('package.json', endent`
      {
        "baseConfig": "foo",
        "devDependencies": {
          "@dword-design/base-config-foo": "^1.0.0"
        }
      }

    `)
    const configName = stealthyRequire(require.cache, () => require('../src/config-name'))
    expect(configName).toEqual('@dword-design/base-config-foo')
  }),
}