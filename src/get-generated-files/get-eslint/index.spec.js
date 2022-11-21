import { Base } from '@/src/index.js'

export default {
  'custom config': () => {
    const base = new Base({ eslintConfig: 'foo' })
    expect(base.getEslintConfig()).toEqual('foo')
  },
  valid: () => {
    const base = new Base()
    expect(base.getEslintConfig()).toEqual({
      extends: '@dword-design/eslint-config',
    })
  },
}
