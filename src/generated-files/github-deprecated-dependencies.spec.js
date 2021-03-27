import self from './github-deprecated-dependencies'

export default {
  valid() {
    expect(self).toMatchSnapshot(this)
  },
}
