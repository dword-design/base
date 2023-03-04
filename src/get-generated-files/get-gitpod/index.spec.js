import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import fs from 'fs-extra'

import { Base } from '@/src/index.js'

export default tester(
  {
    async works() {
      await fs.outputFile('package.json', JSON.stringify({ name: '@dword-design/foo' }))
      expect(new Base().getGitpodConfig()).toMatchSnapshot(this)
    },
  },
  [testerPluginTmpDir()]
)
