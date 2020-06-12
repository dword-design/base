import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import stealthyRequire from 'stealthy-require'

export default {
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/foo/index.js': endent`
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