import self from '.'

export default {
  base() {
    expect(self({ package: { name: '@dword-design/base' } })).toMatchSnapshot(this)
  },
  'lock file fix commit type'() {
    expect(self({ isLockFileFixCommitType: true, package: { name: 'foo' } })).toMatchSnapshot(this)
  },
  'not base'() {
    expect(self({ package: { name: 'foo' } })).toMatchSnapshot(this)
  },
}
