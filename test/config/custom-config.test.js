import withLocalTmpDir from 'with-local-tmp-dir'
import { endent, omit } from '@dword-design/functions'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'node_modules/base-config-foo/index.js': '',
    'package.json': endent`
      {
        "baseConfig": "foo",
        "devDependencies": {
          "base-config-foo": "^1.0.0"
        }
      }
    `,
  })
  const config = stealthyRequire(require.cache, () => require('../../src/config'))
  expect(config |> omit(['depcheckConfig', 'test'])).toEqual({
    name: 'base-config-foo',
    gitignore: [],
    main: 'index.js',
    commands: {},
  })
  expect(typeof config.depcheckConfig).toEqual('object')
  expect(config.test(1)).toEqual(1)
})
