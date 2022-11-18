import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { outputFile } from 'fs-extra'

import { Base } from '@/src'

export default tester(
  {
    async base() {
      await outputFile(
        'package.json',
        JSON.stringify({ name: '@dword-design/base' })
      )
      expect(new Base().getRenovateConfig()).toMatchSnapshot(this)
    },
    'lock file fix commit type': async function () {
      await outputFile('package.json', JSON.stringify({ name: 'foo' }))
      expect(
        new Base({ isLockFileFixCommitType: true }).getRenovateConfig()
      ).toMatchSnapshot(this)
    },
    'not base': async function () {
      await outputFile('package.json', JSON.stringify({ name: 'foo' }))
      expect(new Base().getRenovateConfig()).toMatchSnapshot(this)
    },
  },
  [testerPluginTmpDir()]
)
