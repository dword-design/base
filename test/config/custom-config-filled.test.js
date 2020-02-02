import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { endent, keys, sortBy, identity, omit } from '@dword-design/functions'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'node_modules/base-config-foo/index.js': endent`
      module.exports = {
        gitignore: ['foo'],
        main: 'index.scss',
        test: x => x + 2,
        commands: {
          prepublishOnly: x => x + 1,
          start: x => x + 3,
        }
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
  const config = stealthyRequire(require.cache, () => require('../../src/config'))
  expect(config |> omit(['commands', 'depcheckConfig', 'test'])).toEqual({
    name: 'base-config-foo',
    gitignore: ['foo'],
    main: 'index.scss',
  })
  expect(config.commands |> keys |> sortBy(identity)).toEqual([
    'prepublishOnly',
    'start',
  ])
  expect(config.commands.prepublishOnly(1)).toEqual(2)
  expect(config.commands.start(1)).toEqual(4)
  expect(config.test(1)).toEqual(3)
  expect(typeof config.depcheckConfig).toEqual('object')
})
