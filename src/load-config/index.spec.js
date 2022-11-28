import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import fs from 'fs-extra'
import os from 'os'

import self from './index.js'

export default tester(
  {
    '.baserc.json': async () => {
      await fs.outputFile('.baserc.json', JSON.stringify({ foo: 'bar' }))
      expect(await self()).toEqual({ foo: 'bar' })
    },
    none: async () => expect(await self()).toBeUndefined(),
    'package.json': async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ baseConfig: { foo: 'bar' } })
      )
      expect(await self()).toEqual({ foo: 'bar' })
    },
  },
  [testerPluginTmpDir({ dir: os.tmpdir(), tmpdir: os.tmpdir() })]
)
