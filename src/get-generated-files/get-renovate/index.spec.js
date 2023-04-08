import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import fs from 'fs-extra'

import { Base } from '@/src/index.js'

export default tester(
  {
    async base() {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ name: '@dword-design/base' }),
      )
      expect(new Base().getRenovateConfig()).toMatchSnapshot(this)
    },
    async 'lock file fix commit type'() {
      await fs.outputFile('package.json', JSON.stringify({ name: 'foo' }))
      expect(
        new Base({ isLockFileFixCommitType: true }).getRenovateConfig(),
      ).toMatchSnapshot(this)
    },
    async 'not base'() {
      await fs.outputFile('package.json', JSON.stringify({ name: 'foo' }))
      expect(new Base().getRenovateConfig()).toMatchSnapshot(this)
    },
  },
  [testerPluginTmpDir()],
)
