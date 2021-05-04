import packageName from 'depcheck-package-name'

import config from '@/src/config'

export default config.eslintConfig || {
  extends: packageName`@dword-design/eslint-config`,
}
