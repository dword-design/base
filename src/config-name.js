import { find } from '@dword-design/functions'
import P from 'path'
import getPackageName from 'get-package-name'
import safeRequire from 'safe-require'
import resolveCwd from 'resolve-cwd'

const packageConfig = safeRequire(P.join(process.cwd(), 'package.json')) || {}
const shortName =
  typeof packageConfig.baseConfig === 'string'
    ? packageConfig.baseConfig
    : packageConfig.baseConfig?.name

export default [
  ...(shortName
    ? [
        `@dword-design/base-config-${shortName}`,
        `base-config-${shortName}`,
        shortName,
      ]
    : []),
  getPackageName(require.resolve('@dword-design/base-config-node')),
] |> find(resolveCwd.silent)
