import tester from '@dword-design/tester'
import self from '.'

export default tester({
  valid: {
    config: ['bar', 'foo'],
    result: {
      'editor.tabSize': 2,
      'files.autoSave': 'off',
      'files.exclude': {
        bar: true,
        foo: true,
      },
      'workbench.editor.enablePreview': false,
    },
  },
}, [
  transform: test => () => expect(self(await getConfig())).toEqual(test.result),
])