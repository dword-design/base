import { Base } from '@/src'

export default {
  valid() {
    const base = new Base({ gitignore: ['foo'] })
    expect(base.gitignoreConfig()).toMatchSnapshot(this)
  },
}
