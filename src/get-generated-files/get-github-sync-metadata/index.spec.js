import { Base } from '@/src'

export default {
  'do not sync keywords': function () {
    const base = new Base({ syncMetadata: false })
    expect(base.getGithubSyncMetadataConfig()).toMatchSnapshot(this)
  },
  valid() {
    const base = new Base()
    expect(base.getGithubSyncMetadataConfig()).toMatchSnapshot(this)
  },
  /**
   * Manual Tests
   *
   * - Creates branch action-sync-node-meta
   * - Changing the description updates the PR
   * - Changing the topics updates the PR
   */
}
