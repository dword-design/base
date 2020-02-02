import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { endent } from '@dword-design/functions'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'node_modules/base-config-foo/index.js': endent`
      module.exports = {
        main: 'index.scss',
      }
    `,
    'package.json': endent`
      {
        "baseConfig": "foo",
        "devDependencies": {
          "base-config-foo": "^1.0.0"
        }
      }

    `,
  })
  const getPackageString = stealthyRequire(require.cache, () => require('../../src/get-package-string'))
  expect(await getPackageString()).toMatch('"main": "dist/index.scss"')
})
