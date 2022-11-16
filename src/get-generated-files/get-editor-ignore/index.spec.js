import self from '.'
import tester from '@dword-design/tester'

export default tester({
  valid: ['foo'],
}, [
  {
    transform: test => function () {
      expect(self({ editorIgnore: test })).toMatchSnapshot(this)
    }
  }
])
