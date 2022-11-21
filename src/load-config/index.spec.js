import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { outputFile } from 'fs-extra'

import self from '.'

export default tester(
  {
    '.baserc.json': async () => {
      await outputFile('.baserc.json', JSON.stringify({ foo: 'bar' }))
      expect(await self()).toEqual({ foo: 'bar' })
    },
    'package.json': async () => {
      await outputFile(
        'package.json',
        JSON.stringify({ baseConfig: { foo: 'bar' } })
      )
      expect(await self()).toEqual({ foo: 'bar' })
    },
  },
  [testerPluginTmpDir()]
)
