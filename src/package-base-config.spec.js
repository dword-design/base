import { mapValues } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

const runTest = config => () => {
  const self = proxyquire('./package-base-config', {
    'load-pkg': { sync: () => ({ baseConfig: config.baseConfig }) },
  })
  expect(self).toEqual(config.result)
}

export default {
  empty: {
    result: { name: '@dword-design/base-config-node' },
  },
  valid: {
    baseConfig: 'foo',
    result: { name: 'base-config-foo' },
  },
  scope: {
    baseConfig: '@dword-design/foo',
    result: { name: '@dword-design/base-config-foo' },
  },
  'package config': {
    baseConfig: { name: 'foo', foo: 1 },
    result: { name: 'base-config-foo', foo: 1 },
  },
} |> mapValues(runTest)
