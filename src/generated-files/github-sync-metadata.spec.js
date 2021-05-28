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
  /**
   * Manual Tests
   *
   * - Creates branch action-sync-node-meta
   * - Changing the description updates the PR
   * - Changing the topics updates the PR
   */
}
