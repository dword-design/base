import { mapValues } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

const runTest = config => () => {
  const self = proxyquire('./package-base-config', {
    './package-config': {
      baseConfig: config.baseConfig
    },
  })
  expect(self).toEqual(config.result)
}

export default {
  empty: {
    result: { name: '@dword-design/base-config-node' },
  },
  'package config': {
    baseConfig: { foo: 1, name: 'foo' },
    result: { foo: 1, name: 'base-config-foo' },
  },
  scope: {
    baseConfig: '@dword-design/foo',
    result: { name: '@dword-design/base-config-foo' },
  },
  valid: {
    baseConfig: 'foo',
    result: { name: 'base-config-foo' },
  },
} |> mapValues(runTest)
