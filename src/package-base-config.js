import packageName from 'depcheck-package-name'
import { transform as pluginNameToPackageName } from 'plugin-name-to-package-name'

import packageConfig from './package-config'

const packageBaseConfig =
  typeof packageConfig.baseConfig === 'string'
    ? { name: packageConfig.baseConfig }
    : packageConfig.baseConfig || {}

export default {
  ...packageBaseConfig,
  name: packageBaseConfig.name
    ? pluginNameToPackageName(packageBaseConfig.name, 'base-config')
    : packageName`@dword-design/base-config-node`,
}
