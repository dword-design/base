import tester from '@dword-design/tester'

import { Base } from '@/src'

export default tester(
  {
    valid: ['foo'],
  },
  [
    {
      transform: test =>
        function () {
          const base = new Base({ editorIgnore: test })
          expect(base.getEditorIgnore()).toMatchSnapshot(this)
        },
    },
  ]
)
