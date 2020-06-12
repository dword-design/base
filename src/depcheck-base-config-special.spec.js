import execa from 'execa'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  'dev dependency': () =>
    withLocalTmpDir(async () => {
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
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
            devDependencies: {
              'base-config-foo': '^1.0.0',
            },
          },
          undefined,
          2
        ),
      })
      await execa.command('depcheck')
    }),
  'no config': () =>
    withLocalTmpDir(async () => {
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
      await execa.command('depcheck')
    }),
  'prod dependency': () =>
    withLocalTmpDir(async () => {
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
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
            dependencies: {
              'base-config-foo': '^1.0.0',
            },
          },
          undefined,
          2
        ),
      })
      let all
      try {
        await execa.command('depcheck', { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toEqual('Unused dependencies\n* base-config-foo')
    }),
}
