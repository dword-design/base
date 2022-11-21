import { Base } from '@/src'

export default {
  valid() {
    expect(
      new Base({ gitignore: ['foo'] }).getGitignoreConfig()
    ).toMatchSnapshot(this)
  },
}
