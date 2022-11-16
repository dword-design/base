import self from '.'

export default {
  'custom config': () => expect(self({ eslintConfig: 'foo' })).toEqual('foo'),
  valid: () => expect(self()).toEqual({ extends: '@dword-design/eslint-config' }),
}
