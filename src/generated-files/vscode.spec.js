import { mapValues } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

const runTest = config => () => {
  const self = proxyquire('./vscode', {
    './editor-ignore': config.config,
  })
  expect(self).toEqual(config.result)
}

export default {
  valid: {
    config: ['bar', 'foo'],
    result: {
      'editor.tabSize': 2,
      'files.exclude': {
        bar: true,
        foo: true,
      },
      'workbench.editor.enablePreview': false,
    },
  },
} |> mapValues(runTest)
