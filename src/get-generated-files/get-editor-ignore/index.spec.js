import tester from '@dword-design/tester'

import { Base } from '@/src/index.js'

export default tester(
  {
    valid: ['foo'],
  },
  [
    {
      transform: test =>
        function () {
          const base = new Base({ editorIgnore: test })
          expect(base.getEditorIgnoreConfig()).toMatchSnapshot(this)
        },
    },
  ]
)
