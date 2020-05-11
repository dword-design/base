import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import { endent, mapValues } from '@dword-design/functions'
import stealthyRequire from 'stealthy-require'

const runTest = ({ shortName, longName }) => () =>
  withLocalTmpDir(async () => {
    await outputFiles({
      [`node_modules/${longName}/index.js`]: '',
      ...(shortName
        ? {
            'package.json': endent`
              {
                "baseConfig": "${shortName}"
              }

            `,
          }
        : {}),
    })
    const configName = stealthyRequire(require.cache, () =>
      require('./config-name')
    )
    expect(configName).toEqual(longName)
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
