import proxyquire from '@dword-design/proxyquire'

export default {
  base() {
    const self = proxyquire('./renovate', {
      '../package-config': { name: '@dword-design/base' },
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
