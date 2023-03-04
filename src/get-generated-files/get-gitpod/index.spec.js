import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { execaCommand } from 'execa'
import fs from 'fs-extra'

import { Base } from '@/src/index.js'

export default tester(
  {
    async works() {
      await fs.outputFile('package.json', JSON.stringify({ name: 'bar' }))
      await execaCommand('git init')
      await execaCommand('git remote add origin https://github.com/user/foo.git')
      expect(new Base().getGitpodConfig()).toMatchSnapshot(this)
    },
  },
  [testerPluginTmpDir()]
)
