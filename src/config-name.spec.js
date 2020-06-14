import { mapValues } from '@dword-design/functions'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'
import withLocalTmpDir from 'with-local-tmp-dir'

const runTest = config => () =>
  withLocalTmpDir(async () => {
    await outputFiles({
      [`node_modules/${config.longName}/index.js`]: '',
      ...(config.shortName
        ? {
            'package.json': JSON.stringify(
              {
                baseConfig: config.shortName,
              },
              undefined,
              2
            ),
          }
        : {}),
    })
    const configName = stealthyRequire(require.cache, () =>
      require('./config-name')
    )
    expect(configName).toEqual(config.longName)
  })

export default {
  empty: {
    longName: '@dword-design/base-config-node',
  },
  'no scope': {
    shortName: 'foo',
    longName: 'base-config-foo',
  },
  'with scope': {
    shortName: 'foo',
    longName: '@dword-design/base-config-foo',
  },
  full: {
    shortName: 'base-config-foo',
    longName: 'base-config-foo',
  },
} |> mapValues(runTest)
