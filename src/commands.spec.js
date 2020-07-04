import { keys, mapValues } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

const runTest = config => () => {
  const self = proxyquire('./commands', {
    './additional-commands': config.additional,
    './prepare': config.prepare,
  })
  config.test(self)
}

export default {
  valid: {
    additional: {
      foo: {
        handler: () => 2,
      },
    },
    prepare: () => 1,
    test: result => {
      expect(result |> keys).toEqual(['prepare', 'foo'])
      expect(result.prepare.handler()).toEqual(1)
      expect(result.foo.handler()).toEqual(2)
    },
  },
} |> mapValues(runTest)
