import getPackageName from 'get-package-name'

export default {
  extends: getPackageName(require.resolve('@dword-design/babel-config')),
}
