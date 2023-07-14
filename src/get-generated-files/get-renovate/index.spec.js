import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'

import { Base } from '@/src/index.js'

export default tester(
  {
    base() {
      expect(new Base().getRenovateConfig()).toMatchSnapshot(this)
    },
    'custom config'() {
      expect(
        new Base({ renovateConfig: { foo: 'bar' } }).getRenovateConfig(),
      ).toMatchSnapshot(this)
    },
    'custom config array'() {
      expect(
        new Base({ renovateConfig: { labels: ['foo'] } }).getRenovateConfig(),
      ).toMatchSnapshot(this)
    },
    'lock file fix commit type'() {
      expect(
        new Base({ isLockFileFixCommitType: true }).getRenovateConfig(),
      ).toMatchSnapshot(this)
    },
    'not base'() {
      expect(new Base().getRenovateConfig()).toMatchSnapshot(this)
    },
  },
  [testerPluginTmpDir()],
)
