import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'depcheck.config.js': endent`
      const baseConfigSpecial = require('../../../src/depcheck-base-config-special')
      module.exports = {
        specials: [
          baseConfigSpecial,
        ],
        prodDependencyMatches: ['src/**'],
      }
    `,
    'node_modules/base-config-foo/index.js': 'module.exports = 1',
    'package.json': endent`
      {
        "baseConfig": "foo",
        "devDependencies": {
          "base-config-foo": "^1.0.0"
        }
      }

    `,
  })
  await spawn('depcheck', [])
})