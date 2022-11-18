import tester from '@dword-design/tester'

import { Base } from '@/src'

export default tester(
  {
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
  },
  [
    {
      transform: test => () =>
        expect(new Base().getVscodeConfig()).toEqual(test.result),
    },
  ]
)
