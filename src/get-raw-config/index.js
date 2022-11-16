import { cosmiconfig } from 'cosmiconfig'
import packageName from 'depcheck-package-name'
import { transform as pluginNameToPackageName } from 'plugin-name-to-package-name'
import { property } from '@dword-design/functions'

export default async () => {
  const explorer = cosmiconfig('base', { packageProp: 'baseConfig' })
  let config = (explorer.search() |> await |> property('config')) || {}
  if (typeof config === 'string') {
    config = { name: config }
  }

  return {
    ...config,
    name: config.name
      ? pluginNameToPackageName(config.name, 'base-config')
      : packageName`@dword-design/base-config-node`,
  }
}