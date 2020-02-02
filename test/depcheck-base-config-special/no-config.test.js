import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': '{}',
    'depcheck.config.js': endent`
      const baseConfigSpecial = require('../../../src/depcheck-base-config-special')
      
      module.exports = {
        specials: [
          baseConfigSpecial,
        ],
        prodDependencyMatches: ['src/**'],
      }
    `,
  })
  await spawn('depcheck', [])
})