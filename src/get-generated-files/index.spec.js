import { keys } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'

import { Base } from '@/src/index.js'

export default tester(
  {
    works() {
      expect(new Base().getGeneratedFiles() |> keys).toMatchSnapshot(this)
    },
  },
  [testerPluginTmpDir()],
)
