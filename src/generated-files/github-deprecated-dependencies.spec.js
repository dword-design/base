import self from './github-deprecated-dependencies.mjs'

export default {
  valid() {
    expect(self).toMatchSnapshot(this)
  },
}
