import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import depcheck from 'depcheck'
import { outputFile } from 'fs-extra'

import self from '.'

export default tester(
  {
    'no config': async () => {
      await outputFile('package.json', JSON.stringify({}))
      await depcheck('.', {
        package: {},
        specials: [self()],
      })
    },
    valid: async () => {
      const result = await depcheck('.', {
        package: {
          devDependencies: {
            'base-config-foo': '^1.0.0',
          },
        },
        specials: [self('foo')],
      })
      expect(result.devDependencies).toEqual([])
    },
  },
  [testerPluginTmpDir()]
)
