import { Base } from '@/src/index.js'

export default {
  'do not sync keywords'() {
    const base = new Base({ syncKeywords: false })
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
