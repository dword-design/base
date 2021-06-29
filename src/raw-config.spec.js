import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { outputFile } from 'fs-extra'
import stealthyRequire from 'stealthy-require-no-leak'

export default tester(
  {
    '.baserc.json': async () => {
      await outputFile('.baserc.json', JSON.stringify({ foo: 'bar' }))

      const self = stealthyRequire(require.cache, () => require('./raw-config'))
      expect(self).toEqual({
        foo: 'bar',
        name: '@dword-design/base-config-node',
      })
    },
    empty: async () => {
      await outputFile('.baserc.json', JSON.stringify({}))

      const self = stealthyRequire(require.cache, () => require('./raw-config'))
      expect(self).toEqual({ name: '@dword-design/base-config-node' })
    },
    name: async () => {
      await outputFile(
        'package.json',
        JSON.stringify({ baseConfig: { name: 'foo' } })
      )

      const self = stealthyRequire(require.cache, () => require('./raw-config'))
      expect(self).toEqual({ name: 'base-config-foo' })
    },
    'name shortcut': async () => {
      await outputFile('package.json', JSON.stringify({ baseConfig: 'foo' }))

      const self = stealthyRequire(require.cache, () => require('./raw-config'))
      expect(self).toEqual({ name: 'base-config-foo' })
    },
    'package.json': async () => {
      await outputFile(
        'package.json',
        JSON.stringify({ baseConfig: { foo: 'bar' } })
      )

      const self = stealthyRequire(require.cache, () => require('./raw-config'))
      expect(self).toEqual({
        foo: 'bar',
        name: '@dword-design/base-config-node',
      })
    },
  },
  [testerPluginTmpDir()]
)
