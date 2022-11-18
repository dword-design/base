import { Base } from '@/src'

export default {
  base() {
    expect(
      new Base({ package: { name: '@dword-design/base' } }).getRenovateConfig()
    ).toMatchSnapshot(this)
  },
  'lock file fix commit type': function () {
    expect(
      new Base({
        isLockFileFixCommitType: true,
        package: { name: 'foo' },
      }).getRenovateConfig()
    ).toMatchSnapshot(this)
  },
  'not base': function () {
    expect(
      new Base({ package: { name: 'foo' } }).getRenovateConfig()
    ).toMatchSnapshot(this)
  },
}
