import tester from '@dword-design/tester'

import { Base } from '@/src'

export default tester(
  {
    valid: ['bar', 'foo'],
  },
  [
    {
      transform: test => function () {
        expect(new Base({ editorIgnore: test }).getVscodeConfig()).toMatchSnapshot(this)
      }
    },
  ]
)
