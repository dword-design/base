import { cosmiconfigSync } from 'cosmiconfig'
import packageName from 'depcheck-package-name'
import { transform as pluginNameToPackageName } from 'plugin-name-to-package-name'

const explorer = cosmiconfigSync('base', { packageProp: 'baseConfig' })
let config = explorer.search()?.config || {}
if (typeof config === 'string') {
  config = { name: config }
}

export default {
  ...config,
  name: config.name
    ? pluginNameToPackageName(config.name, 'base-config')
    : packageName`@dword-design/base-config-node`,
}
