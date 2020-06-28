import { keys, mapValues } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

const runTest = config => () => {
  const self = proxyquire('./commands', {
    './prepare': config.prepare,
    './additional-commands': config.additional,
  })
  config.test(self)
}

export default {
  valid: {
    prepare: () => 1,
    additional: {
      foo: {
        handler: () => 2,
      },
    },
    test: result => {
      expect(result |> keys).toEqual(['prepare', 'foo'])
      expect(result.prepare.handler()).toEqual(1)
      expect(result.foo.handler()).toEqual(2)
    },
  },
} |> mapValues(runTest)
