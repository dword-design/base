import { endent } from '@dword-design/functions'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js': endent`
        module.exports = {
          lint: () => 2,
        }
      `,
        'package.json': JSON.stringify({
          baseConfig: 'foo',
        }),
      })
      const lint = stealthyRequire(require.cache, () => require('./lint'))
      expect(lint()).toEqual(2)
    }),
}
