import getPackageName from 'get-package-name'

export default {
  extends: [getPackageName(require.resolve('@commitlint/config-conventional'))],
}
