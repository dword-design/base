import self from '.'

export default {
  valid() {
    expect(self).toMatchSnapshot(this)
  },
}
