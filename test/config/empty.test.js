import withLocalTmpDir from 'with-local-tmp-dir'
import stealthyRequire from 'stealthy-require'
import { keys, sortBy, identity, omit } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, () => {
  const config = stealthyRequire(require.cache, () => require('../../src/config'))
  expect(config |> omit(['commands', 'test', 'depcheckConfig'])).toEqual({
    name: '@dword-design/base-config-node',
    gitignore: ['/.eslintrc.json'],
    main: 'index.js',
  })
  expect(config |> keys |> sortBy(identity)).toEqual([
    'commands',
    'depcheckConfig',
    'gitignore',
    'main',
    'name',
    'test',
  ])
})
