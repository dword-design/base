import { endent } from '@dword-design/functions'
import { outputFile, readFile } from 'fs-extra'
import outputFiles from 'output-files'
import P from 'path'
import stealthyRequire from 'stealthy-require-no-leak'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  'custom linter': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js': endent`
        module.exports = {
          lint: () => {
            throw new Error('foobar')
          },
        }
      `,
        'package.json': JSON.stringify({
          baseConfig: 'foo',
        }),
      })

      const prepare = stealthyRequire(require.cache, () => require('./prepare'))
      await prepare()

      const self = stealthyRequire(require.cache, () => require('./lint'))
      await expect(self()).rejects.toThrow('foobar')
    }),
  fixable: () =>
    withLocalTmpDir(async () => {
      await outputFile('src/index.js', "console.log('foo');")

      const prepare = stealthyRequire(require.cache, () => require('./prepare'))
      await prepare()

      const self = stealthyRequire(require.cache, () => require('./lint'))
      await self()
      expect(await readFile(P.join('src', 'index.js'), 'utf8')).toEqual(
        endent`
          console.log('foo')

        `
      )
    }),
  'linting errors': () =>
    withLocalTmpDir(async () => {
      await outputFile('src/index.js', "const foo = 'bar'")

      const prepare = stealthyRequire(require.cache, () => require('./prepare'))
      await prepare()

      const self = stealthyRequire(require.cache, () => require('./lint'))
      await expect(self()).rejects.toThrow(
        "'foo' is assigned a value but never used"
      )
    }),
  'plugin next to config': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        node_modules: {
          '@dword-design/eslint-config': {
            'index.js': endent`
              module.exports = {
                plugins: ['foo'],
              }
            `,
            'node_modules/eslint-plugin-foo/index.js': '',
          },
          'eslint-plugin-foo/index.js': 'foo bar',
        },
        'src/index.js': '',
      })

      const prepare = stealthyRequire(require.cache, () => require('./prepare'))
      await prepare()

      const self = stealthyRequire(require.cache, () => require('./lint'))
      await self({
        resolvePluginsRelativeTo: P.join(
          'node_modules',
          '@dword-design',
          'eslint-config'
        ),
      })
    }),
}
