import depcheck from 'depcheck'
import { outputFile } from 'fs-extra'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'
import withLocalTmpDir from 'with-local-tmp-dir'

const myStealthyRequire = (...args) => {
  const previousChildren = module.children.slice()

  const result = stealthyRequire(...args)
  module.children = previousChildren

  return result
}

export default {
  'no config': () =>
    withLocalTmpDir(async () => {
      await outputFile('package.json', JSON.stringify({}))

      const self = myStealthyRequire(require.cache, () =>
        require('./depcheck-special-base-config')
      )
      await depcheck('.', {
        package: {},
        specials: [self],
      })
    }),
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js': 'module.exports = 1',
        'package.json': JSON.stringify({
          baseConfig: 'foo',
        }),
      })

      const self = myStealthyRequire(require.cache, () =>
        require('./depcheck-special-base-config')
      )

      const result = await depcheck('.', {
        package: {
          devDependencies: {
            'base-config-foo': '^1.0.0',
          },
        },
        specials: [self],
      })
      expect(result.devDependencies).toEqual([])
    }),
}
