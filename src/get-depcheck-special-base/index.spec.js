import depcheck from 'depcheck'
import { outputFile } from 'fs-extra'
import outputFiles from 'output-files'
import getRawConfig from '@/src/get-raw-config'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import self from '.'

export default tester({
  'no config': async () => {
    await outputFile('package.json', JSON.stringify({}))
    await depcheck('.', {
      package: {},
      specials: [self(await getRawConfig())],
    })
  },
  valid: async () => {
    await outputFiles({
      'node_modules/base-config-foo/index.js': 'module.exports = 1',
      'package.json': JSON.stringify({
        baseConfig: 'foo',
      }),
    })
    const result = await depcheck('.', {
      package: {
        devDependencies: {
          'base-config-foo': '^1.0.0',
        },
      },
      specials: [self(await getRawConfig())],
    })
    expect(result.devDependencies).toEqual([])
  },
}, [testerPluginTmpDir()])
