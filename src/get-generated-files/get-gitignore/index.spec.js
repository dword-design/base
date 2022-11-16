import self from '.'

export default {
  valid() {
    expect(self({ gitignore: ['foo'] })).toMatchSnapshot(this)
  },
}