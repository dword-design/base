import { find } from '@dword-design/functions'
import getPackageName from 'get-package-name'
import P from 'path'
import resolveCwd from 'resolve-cwd'
import safeRequire from 'safe-require'

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
