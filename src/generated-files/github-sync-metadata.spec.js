import proxyquire from '@dword-design/proxyquire'

export default {
  'do not sync keywords': function () {
    const self = proxyquire('./github-sync-metadata', {
      '../config': {
        syncMetadata: false,
      },
    })
    expect(self).toMatchSnapshot(this)
  },
  valid() {
    const self = proxyquire('./github-sync-metadata', {
      '../config': {},
    })
    expect(self).toMatchSnapshot(this)
  },
}
