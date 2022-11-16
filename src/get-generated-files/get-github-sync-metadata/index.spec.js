import self from '.'

export default {
  'do not sync keywords'() {
    expect(self({ syncMetadata: false })).toMatchSnapshot(this)
  },
  valid() {
    expect(self()).toMatchSnapshot(this)
  },
  /**
   * Manual Tests
   *
   * - Creates branch action-sync-node-meta
   * - Changing the description updates the PR
   * - Changing the topics updates the PR
   */
}
