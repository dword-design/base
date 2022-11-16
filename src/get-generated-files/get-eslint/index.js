import packageName from 'depcheck-package-name'

export default (config = {}) => config.eslintConfig || {
  extends: packageName`@dword-design/eslint-config`,
}
