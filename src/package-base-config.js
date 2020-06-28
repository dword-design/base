import getPackageName from 'get-package-name'
import loadPkg from 'load-pkg'
import { transform as pluginNameToPackageName } from 'plugin-name-to-package-name'

const packageConfig = loadPkg.sync() || {}
const packageBaseConfig =
  typeof packageConfig.baseConfig === 'string'
    ? { name: packageConfig.baseConfig }
    : packageConfig.baseConfig || {}

export default {
  ...packageBaseConfig,
  name: packageBaseConfig.name
    ? pluginNameToPackageName(packageBaseConfig.name, 'base-config')
    : getPackageName(require.resolve('@dword-design/base-config-node')),
}
