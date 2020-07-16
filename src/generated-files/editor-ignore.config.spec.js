import { mapValues } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

const runTest = config => () => {
  const self = proxyquire('./editor-ignore.config', {
    '../config': { editorIgnore: config.config },
    './common-editor-ignore.json': config.common,
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
