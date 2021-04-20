import proxyquire from '@dword-design/proxyquire'

export default {
  valid() {
    const self = proxyquire('./github-sync-metadata', {
      '../config': {},
    })
    expect(self).toMatchSnapshot(this)
  },
  'do not sync keywords'() {
    const self = proxyquire('./github-sync-metadata', {
      '../config': {
        syncMetadata: false,
      },
    })
    expect(self).toMatchSnapshot(this)
  },
}
