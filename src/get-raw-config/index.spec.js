import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { outputFile } from 'fs-extra'
import self from '.'

export default tester(
  {
    '.baserc.json': async () => {
      await outputFile('.baserc.json', JSON.stringify({ foo: 'bar' }))
      expect(await self()).toEqual({
        foo: 'bar',
        name: '@dword-design/base-config-node',
      })
    },
    empty: async () => {
      await outputFile('.baserc.json', JSON.stringify({}))
      expect(await self()).toEqual({ name: '@dword-design/base-config-node' })
    },
    name: async () => {
      await outputFile(
        'package.json',
        JSON.stringify({ baseConfig: { name: 'foo' } })
      )
      expect(await self()).toEqual({ name: 'base-config-foo' })
    },
    'name shortcut': async () => {
      await outputFile('package.json', JSON.stringify({ baseConfig: 'foo' }))
      expect(await self()).toEqual({ name: 'base-config-foo' })
    },
    'package.json': async () => {
      await outputFile(
        'package.json',
        JSON.stringify({ baseConfig: { foo: 'bar' } })
      )
      expect(await self()).toEqual({
        foo: 'bar',
        name: '@dword-design/base-config-node',
      })
    },
  },
  [testerPluginTmpDir()]
)
