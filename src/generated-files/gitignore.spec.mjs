import { mapValues } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

const runTest = config => () => {
  const self = proxyquire('./gitignore', {
    '../config': { gitignore: config.config },
    './common-gitignore.json': config.common,
  })
  expect(self).toEqual(config.result)
}

export default {
  valid: {
    common: ['foo'],
    config: ['bar'],
    result: ['bar', 'foo'],
  },
} |> mapValues(runTest)
