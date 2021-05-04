import proxyquire from '@dword-design/proxyquire'

export default {
  'custom config': () => {
    const self = proxyquire('./eslint', {
      '../config': {
        eslintConfig: 'foo',
      },
    })
    expect(self).toEqual('foo')
  },
  valid: () => {
    const self = proxyquire('./eslint', {})
    expect(self).toEqual({ extends: '@dword-design/eslint-config' })
  },
}
