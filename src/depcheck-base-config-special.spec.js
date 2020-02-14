import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  'dev dependency': () => withLocalTmpDir(async () => {
    await outputFiles({
      'depcheck.config.js': endent`
        const baseConfigSpecial = require('../src/depcheck-base-config-special')
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
  }),
  'no config': () => withLocalTmpDir(async () => {
    await outputFiles({
      'package.json': '{}',
      'depcheck.config.js': endent`
        const baseConfigSpecial = require('../src/depcheck-base-config-special')
        
        module.exports = {
          specials: [
            baseConfigSpecial,
          ],
          prodDependencyMatches: ['src/**'],
        }
      `,
    })
    await spawn('depcheck', [])
  }),
  'prod dependency': () => withLocalTmpDir(async () => {
    await outputFiles({
      'depcheck.config.js': endent`
        const baseConfigSpecial = require('../src/depcheck-base-config-special')

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
          "dependencies": {
            "base-config-foo": "^1.0.0"
          }
        }

      `,
    })
    let stdout
    try {
      await spawn('depcheck', [], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toEqual('Unused dependencies\n* base-config-foo\n')
  }),
}