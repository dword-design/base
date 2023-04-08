import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import depcheck from 'depcheck'
import fs from 'fs-extra'

import self from './index.js'

export default tester(
  {
    'no config': async () => {
      const packageConfig = {}
      await fs.outputFile('package.json', JSON.stringify(packageConfig))
      await depcheck('.', {
        package: packageConfig,
        specials: [self()],
      })
    },
    valid: async () => {
      const packageConfig = {
        devDependencies: {
          'base-config-foo': '^1.0.0',
        },
      }
      await fs.outputFile('package.json', JSON.stringify(packageConfig))

      const result = await depcheck('.', {
        package: {
          devDependencies: {
            'base-config-foo': '^1.0.0',
          },
        },
        specials: [self('base-config-foo')],
      })
      expect(result.devDependencies).toEqual([])
    },
  },
  [testerPluginTmpDir()],
)
