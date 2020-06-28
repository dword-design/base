import { mapValues } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

const runTest = config => () => {
  const self = proxyquire('./vscode.config', {
    './editor-ignore.config': config.config,
  })
  expect(self).toEqual(config.result)
}

export default {
  valid: {
    config: ['bar', 'foo'],
    result: {
      'files.exclude': {
        bar: true,
        foo: true,
      },
    },
  },
} |> mapValues(runTest)
