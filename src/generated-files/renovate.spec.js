import proxyquire from '@dword-design/proxyquire'

export default {
  base() {
    const self = proxyquire('./renovate', {
      '../package-config': { name: '@dword-design/base' },
    })
    expect(self).toMatchSnapshot(this)
  },
  'lock file fix commit type': function () {
    const self = proxyquire('./renovate', {
      '../config': { isLockFileFixCommitType: true },
      '../package-config': { name: 'foo' },
    })
    expect(self).toMatchSnapshot(this)
  },
  'not base': function () {
    const self = proxyquire('./renovate', {
      '../package-config': { name: 'foo' },
    })
    expect(self).toMatchSnapshot(this)
  },
}
